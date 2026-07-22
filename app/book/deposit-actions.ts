"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CancelAppointmentSchema } from "@/lib/validation/schemas";
import { refundDecision } from "@/lib/booking/lifecycle";
import {
  bookingTargetUserId,
  notificationContextForTarget,
  notifyUser,
} from "@/lib/booking/notify";
import type { DepositStatus } from "@/lib/types/booking";

interface ActionResult {
  success: boolean;
  error?: string;
}

/** The caller must be the appointment's provider: its artist, or (for
 * studio-level rows) the studio owner. */
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
    .select("artist_id, studio_id")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt || (!appt.artist_id && !appt.studio_id)) {
    return { ok: false, error: "Appointment not found." };
  }

  if (appt.artist_id) {
    const { data: artistRow } = await supabase
      .from("artists")
      .select("id")
      .eq("id", appt.artist_id)
      .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
      .maybeSingle();
    if (artistRow) return { ok: true, supabase };
  }
  if (appt.studio_id) {
    const { data: studioRow } = await supabase
      .from("studios")
      .select("id")
      .eq("id", appt.studio_id)
      .eq("claimed_by", user.id)
      .maybeSingle();
    if (studioRow) return { ok: true, supabase };
  }
  return { ok: false, error: "Only the provider can manage this appointment." };
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

// ─── Phase 5: appointment lifecycle ────────────────────────────────────────

async function providerTransition(
  appointmentId: string,
  toStatus: "completed" | "no_show"
): Promise<ActionResult> {
  const guard = await requireAppointmentArtist(appointmentId);
  if (!guard.ok) return { success: false, error: guard.error };

  // A no-show keeps a paid deposit paid — forfeiture is the deposit's job.
  const { data: updated, error } = await guard.supabase
    .from("appointments")
    .update({ status: toStatus })
    .eq("id", appointmentId)
    .eq("status", "confirmed")
    .select("id");
  if (error) return { success: false, error: "Something went wrong — try again." };
  if (!updated || updated.length === 0) {
    return { success: false, error: "This appointment was already handled." };
  }
  return { success: true };
}

export async function completeAppointment(appointmentId: string): Promise<ActionResult> {
  return providerTransition(appointmentId, "completed");
}

export async function markNoShow(appointmentId: string): Promise<ActionResult> {
  return providerTransition(appointmentId, "no_show");
}

/**
 * Cancel by either party. The refund decision is policy-aware: provider
 * cancellations always owe a paid deposit back; customer cancellations
 * forfeit inside the artist's cancellation window.
 */
export async function cancelAppointment(
  input: unknown
): Promise<ActionResult & { refund?: "refund_due" | "forfeit" | "none" }> {
  const parsed = CancelAppointmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid request." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in first." };

  // RLS-visible row or nothing: the caller must already be a party.
  const { data: appt } = await supabase
    .from("appointments")
    .select("id, customer_id, artist_id, studio_id, start_at, status, deposit_status")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();
  if (!appt) return { success: false, error: "Appointment not found." };

  const isCustomer = appt.customer_id === user.id;
  let isStudioOwner = false;
  if (!isCustomer) {
    const { data: artistRow } = await supabase
      .from("artists")
      .select("id")
      .eq("id", appt.artist_id ?? "")
      .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
      .maybeSingle();
    if (!artistRow && appt.studio_id) {
      const { data: studioRow } = await supabase
        .from("studios")
        .select("id")
        .eq("id", appt.studio_id)
        .eq("claimed_by", user.id)
        .maybeSingle();
      isStudioOwner = Boolean(studioRow);
    }
    if (!artistRow && !isStudioOwner) {
      return { success: false, error: "Only a party to the booking can cancel." };
    }
  }
  const cancelledBy = isCustomer ? "customer" : isStudioOwner ? "studio" : "artist";

  // Cancellation window from the artist's settings (default 48h).
  let windowHours = 48;
  if (appt.artist_id) {
    const { data: settings } = await createAdminClient()
      .from("booking_settings")
      .select("cancellation_window_hours")
      .eq("artist_id", appt.artist_id)
      .maybeSingle();
    if (settings?.cancellation_window_hours !== undefined && settings !== null) {
      windowHours = settings.cancellation_window_hours;
    }
  }

  const refund = refundDecision({
    depositStatus: appt.deposit_status as DepositStatus,
    cancelledBy,
    startAt: appt.start_at,
    cancellationWindowHours: windowHours,
    now: new Date(),
  });

  const patch: Record<string, unknown> = {
    status: "cancelled",
    cancelled_by: cancelledBy,
    cancellation_reason: parsed.data.reason ?? null,
  };
  if (refund === "refund_due") patch.deposit_status = "refund_due";

  const { data: updated, error } = await supabase
    .from("appointments")
    .update(patch)
    .eq("id", parsed.data.appointmentId)
    .in("status", ["pending_deposit", "confirmed"])
    .select("id");
  if (error) return { success: false, error: "Something went wrong — try again." };
  if (!updated || updated.length === 0) {
    return { success: false, error: "This appointment was already handled." };
  }

  // Notify the other party (best-effort).
  const admin = createAdminClient();
  const targetUserId =
    cancelledBy === "customer"
      ? await bookingTargetUserId(admin, { artistId: appt.artist_id, studioId: appt.studio_id })
      : appt.customer_id;
  await notifyUser(admin, targetUserId, "appointment_cancelled", {
    actorName: cancelledBy === "customer" ? "Your client" : "The artist",
    whenIso: appt.start_at,
    recipientContext:
      cancelledBy === "customer"
        ? notificationContextForTarget({ artistId: appt.artist_id, studioId: appt.studio_id })
        : "customer",
  });
  return { success: true, refund };
}
