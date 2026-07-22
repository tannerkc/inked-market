// Repairs legacy booking-notification payloads with the recipient role shown
// in the notification bell. Safe to re-run: rows with a valid field are skipped.
// Run manually after review: node scripts/backfill-notification-contexts.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const LEGACY_KINDS = [
  "request_received",
  "request_accepted",
  "request_declined",
  "appointment_booked",
  "appointment_cancelled",
  "deposit_paid",
];
const CUSTOMER_REQUEST_KINDS = new Set(["request_accepted", "request_declined"]);
const PAGE_SIZE = 1_000;

function env(key) {
  const match = readFileSync(".env.local", "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match?.[1]) throw new Error(`${key} missing from .env.local`);
  return match[1].trim();
}

const supabase = createClient(
  env("NEXT_PUBLIC_SUPABASE_URL"),
  env("SUPABASE_SERVICE_ROLE_KEY")
);

function isRecipientContext(value) {
  return value === "studio" || value === "artist" || value === "customer";
}

async function contextFor(row) {
  if (CUSTOMER_REQUEST_KINDS.has(row.kind)) {
    return "customer";
  }

  const requestId = row.payload.requestId;
  if (!requestId) return undefined;

  const { data: request, error } = await supabase
    .from("booking_requests")
    .select("artist_id, studio_id")
    .eq("id", requestId)
    .maybeSingle();
  if (error) throw error;
  if (request?.artist_id) return "artist";
  if (request?.studio_id) return "studio";
  return undefined;
}

async function main() {
  let changed = 0;
  let skipped = 0;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data: rows, error } = await supabase
      .from("notifications")
      .select("id, kind, payload")
      .in("kind", LEGACY_KINDS)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    for (const row of rows ?? []) {
      if (!row.payload || typeof row.payload !== "object" || Array.isArray(row.payload)) {
        skipped++;
        console.log(`skipped ${row.id} (${row.kind}): missing or invalid payload`);
        continue;
      }
      if (isRecipientContext(row.payload.recipientContext)) continue;

      const recipientContext = await contextFor(row);
      if (!isRecipientContext(recipientContext)) {
        skipped++;
        console.log(`skipped ${row.id} (${row.kind}): ambiguous or missing request target`);
        continue;
      }

      const nextPayload = { ...row.payload, recipientContext };
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ payload: nextPayload })
        .eq("id", row.id);
      if (updateError) throw updateError;

      changed++;
      console.log(`updated ${row.id} (${row.kind}): ${recipientContext}`);
    }

    if (!rows || rows.length < PAGE_SIZE) break;
  }

  console.log(`notification context backfill: ${changed} changed, ${skipped} skipped`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
