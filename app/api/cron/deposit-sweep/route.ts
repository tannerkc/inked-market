import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDepositProvider, type PaymentProviderKey } from "@/lib/booking/deposits";
import { confirmDepositPaid } from "@/lib/booking/deposits/confirm";
import { getPaymentConnection } from "@/lib/integrations/connections";

/**
 * Every 30 min (see vercel.json): re-verify stale provider-backed pending
 * deposits against the provider — the backstop for missed webhooks.
 * Vercel invokes this with `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data: rows } = await admin
    .from("appointments")
    .select("id, artist_id, deposit_provider, deposit_checkout_id")
    .eq("status", "pending_deposit")
    .eq("deposit_status", "pending")
    .in("deposit_provider", ["stripe", "square"])
    .lt("created_at", tenMinAgo)
    .limit(50);

  let scanned = 0;
  let confirmed = 0;
  for (const row of rows ?? []) {
    scanned++;
    if (!row.artist_id || !row.deposit_checkout_id) continue;
    const providerKey = row.deposit_provider as PaymentProviderKey;
    try {
      const connection = await getPaymentConnection(admin, row.artist_id, providerKey);
      if (!connection) continue;
      const state = await getDepositProvider(providerKey).verifyCheckout({
        tokens: connection.tokens,
        accountId: connection.accountId,
        checkoutId: row.deposit_checkout_id,
      });
      if (state === "paid") {
        const result = await confirmDepositPaid(admin, row.id);
        if (result !== "noop") confirmed++;
      }
    } catch {
      // Provider hiccup — next sweep retries.
    }
  }
  return NextResponse.json({ scanned, confirmed });
}
