"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

/** The caller must own the artist on the appointment. Returns the artist id. */
async function requireAppointmentArtist(
  appointmentId: string
): Promise<{ ok: true; supabase: Awaited<ReturnType<typeof createClient>> } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const { data: appt } = await supabase
    .from("appointments")
    .select("artist_id")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt?.artist_id) return { ok: false, error: "Appointment not found." };

  const { data: artistRow } = await supabase
    .from("artists")
    .select("id")
    .eq("id", appt.artist_id)
    .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
    .maybeSingle();
  if (!artistRow) return { ok: false, error: "Only the artist can manage this deposit." };
  return { ok: true, supabase };
}

async function settleDeposit(
  appointmentId: string,
  depositStatus: "paid" | "waived"
): Promise<ActionResult> {
  const guard = await requireAppointmentArtist(appointmentId);
  if (!guard.ok) return { success: false, error: guard.error };

  const patch =
    depositStatus === "paid"
      ? { status: "confirmed", deposit_status: "paid", deposit_paid_at: new Date().toISOString() }
      : { status: "confirmed", deposit_status: "waived" };
  const { data: updated, error } = await guard.supabase
    .from("appointments")
    .update(patch)
    .eq("id", appointmentId)
    .eq("status", "pending_deposit")
    .eq("deposit_status", "pending")
    .select("id");
  if (error) return { success: false, error: "Something went wrong — try again." };
  if (!updated || updated.length === 0) {
    return { success: false, error: "This deposit was already handled." };
  }
  return { success: true };
}

/** Artist confirms an out-of-band payment (Venmo, cash, in person). */
export async function markDepositReceived(appointmentId: string): Promise<ActionResult> {
  return settleDeposit(appointmentId, "paid");
}

/** Artist skips the deposit; the appointment confirms without payment. */
export async function waiveDeposit(appointmentId: string): Promise<ActionResult> {
  return settleDeposit(appointmentId, "waived");
}
