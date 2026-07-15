import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingNotificationKind =
  | "request_received"
  | "request_accepted"
  | "request_declined"
  | "appointment_booked"
  | "appointment_cancelled"
  | "deposit_paid";

interface NotificationCtx {
  actorName?: string;
  otherName?: string;
  whenIso?: string;
  apptType?: string;
}

function fmtWhen(iso?: string): string {
  if (!iso) return "";
  return ` for ${new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Pure copy builder so the wording is checkable. */
export function buildNotification(
  kind: BookingNotificationKind,
  ctx: NotificationCtx
): { message: string } {
  const actor = ctx.actorName ?? "A client";
  const other = ctx.otherName ?? "The artist";
  switch (kind) {
    case "request_received":
      return { message: `${actor} sent you a booking request` };
    case "request_accepted":
      return { message: `${other} accepted your booking request — pick a time` };
    case "request_declined":
      return { message: `${other} declined your booking request` };
    case "appointment_booked":
      return { message: `${actor} booked a ${ctx.apptType ?? "session"}${fmtWhen(ctx.whenIso)}` };
    case "appointment_cancelled":
      return { message: `${actor} cancelled an appointment${fmtWhen(ctx.whenIso)}` };
    case "deposit_paid":
      return { message: `${actor} paid their deposit — booking confirmed` };
  }
}

/** Best-effort insert: a failed notification must never fail a booking. */
export async function notifyUser(
  admin: SupabaseClient,
  userId: string | null | undefined,
  kind: BookingNotificationKind,
  ctx: NotificationCtx
): Promise<void> {
  if (!userId) return;
  try {
    await admin
      .from("notifications")
      .insert({ user_id: userId, kind, payload: buildNotification(kind, ctx) });
  } catch {
    // Swallow — observability only.
  }
}

export async function artistUserId(
  admin: SupabaseClient,
  artistId: string
): Promise<string | null> {
  const { data } = await admin
    .from("artists")
    .select("user_id, claimed_by")
    .eq("id", artistId)
    .maybeSingle();
  return data?.user_id ?? data?.claimed_by ?? null;
}

export async function studioOwnerUserId(
  admin: SupabaseClient,
  studioId: string
): Promise<string | null> {
  const { data } = await admin
    .from("studios")
    .select("claimed_by")
    .eq("id", studioId)
    .maybeSingle();
  return data?.claimed_by ?? null;
}

/** Recipient for a booking target: the artist's user, else the studio owner. */
export async function bookingTargetUserId(
  admin: SupabaseClient,
  target: { artistId?: string | null; studioId?: string | null }
): Promise<string | null> {
  if (target.artistId) return artistUserId(admin, target.artistId);
  if (target.studioId) return studioOwnerUserId(admin, target.studioId);
  return null;
}
