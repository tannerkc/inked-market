import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDepositProvider, type PaymentProviderKey } from "@/lib/booking/deposits";
import { confirmDepositPaid } from "@/lib/booking/deposits/confirm";
import { getPaymentConnection } from "@/lib/integrations/connections";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checkout return leg. A redirect is never proof of payment: the provider is
 * asked directly, then the same idempotent transition as the webhook runs.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const appointmentId = searchParams.get("appointment") ?? "";
  const done = (state: "paid" | "pending") =>
    NextResponse.redirect(`${origin}/dashboard?deposit=${state}`);

  if (!UUID_RE.test(appointmentId)) return done("pending");

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("appointments")
    .select("id, artist_id, deposit_status, deposit_provider, deposit_checkout_id")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!row) return done("pending");
  if (row.deposit_status === "paid" || row.deposit_status === "waived") return done("paid");

  const providerKey = row.deposit_provider as PaymentProviderKey | "manual" | null;
  if (
    row.deposit_status === "pending" &&
    (providerKey === "stripe" || providerKey === "square") &&
    row.deposit_checkout_id &&
    row.artist_id
  ) {
    try {
      const connection = await getPaymentConnection(admin, row.artist_id, providerKey);
      if (connection) {
        const state = await getDepositProvider(providerKey).verifyCheckout({
          tokens: connection.tokens,
          accountId: connection.accountId,
          checkoutId: row.deposit_checkout_id,
        });
        if (state === "paid") {
          await confirmDepositPaid(admin, row.id);
          return done("paid");
        }
      }
    } catch {
      // Fall through — webhook or sweep will settle it.
    }
  }
  return done("pending");
}
