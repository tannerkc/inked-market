import type { SupabaseClient } from "@supabase/supabase-js";
import { artistUserId, notifyUser } from "@/lib/booking/notify";

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
    .select("id, artist_id, customer_name");
  if (confirmed && confirmed.length > 0) {
    const row = confirmed[0] as { artist_id: string | null; customer_name: string | null };
    if (row.artist_id) {
      await notifyUser(admin, await artistUserId(admin, row.artist_id), "deposit_paid", {
        actorName: row.customer_name ?? undefined,
        recipientContext: "artist",
      });
    }
    return "confirmed";
  }

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
