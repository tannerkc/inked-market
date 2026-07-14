import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The single idempotent paid-transition. Webhook, redirect verification,
 * cron sweep, and manual confirmation all converge here.
 * Late payment after hold-expiry cancellation becomes refund_due — money
 * never disappears.
 */
export async function confirmDepositPaid(
  admin: SupabaseClient,
  appointmentId: string
): Promise<"confirmed" | "refund_due" | "noop"> {
  const paidAt = new Date().toISOString();
  const { data: confirmed } = await admin
    .from("appointments")
    .update({ status: "confirmed", deposit_status: "paid", deposit_paid_at: paidAt })
    .eq("id", appointmentId)
    .eq("status", "pending_deposit")
    .eq("deposit_status", "pending")
    .select("id");
  if (confirmed && confirmed.length > 0) return "confirmed";

  const { data: refund } = await admin
    .from("appointments")
    .update({ deposit_status: "refund_due", deposit_paid_at: paidAt })
    .eq("id", appointmentId)
    .eq("status", "cancelled")
    .eq("deposit_status", "pending")
    .select("id");
  if (refund && refund.length > 0) return "refund_due";
  return "noop";
}
