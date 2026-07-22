import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingNotificationKind =
  | "request_received"
  | "request_accepted"
  | "request_declined"
  | "appointment_booked"
  | "appointment_cancelled"
  | "deposit_paid"
  | "message_received";

export type NotificationRecipientContext = "studio" | "artist" | "customer";

export function isNotificationRecipientContext(
  value: unknown
): value is NotificationRecipientContext {
  return value === "studio" || value === "artist" || value === "customer";
}

/** Safely reads the recipient role from a persisted JSON notification payload. */
export function notificationContextFromPayload(payload: unknown): NotificationRecipientContext | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;
  const { recipientContext } = payload as { recipientContext?: unknown };
  return isNotificationRecipientContext(recipientContext) ? recipientContext : undefined;
}

export function notificationContextForTarget(target: {
  artistId?: string | null;
  studioId?: string | null;
}): Exclude<NotificationRecipientContext, "customer"> | undefined {
  if (target.artistId) return "artist";
  if (target.studioId) return "studio";
  return undefined;
}

export function notificationContextLabel(
  context: NotificationRecipientContext
): "Studio" | "Artist" | "Your booking" {
  if (context === "studio") return "Studio";
  if (context === "artist") return "Artist";
  return "Your booking";
}

interface NotificationCtx {
  actorName?: string;
  otherName?: string;
  whenIso?: string;
  apptType?: string;
  recipientContext?: NotificationRecipientContext;
  /** Booking request the bell's quick actions act on. */
  requestId?: string;
  /** Sender's user id — enables inline quick-reply from the bell. */
  actorUserId?: string;
}

function fmtWhen(iso?: string): string {
  if (!iso) return "";
  return ` for ${new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Pure copy builder so the wording is checkable. actorName is whichever
 * name appears in the copy — the bell bolds it in the rendered message. */
export function buildNotification(
  kind: BookingNotificationKind,
  ctx: NotificationCtx
): { message: string; actorName: string; recipientContext?: NotificationRecipientContext } {
  const actor = ctx.actorName ?? "A client";
  const other = ctx.otherName ?? "The artist";
  const result = (message: string, actorName: string) => ({
    message,
    actorName,
    ...(ctx.recipientContext ? { recipientContext: ctx.recipientContext } : {}),
  });
  switch (kind) {
    case "request_received":
      return result(`${actor} requested a booking`, actor);
    case "request_accepted":
      return result(`${other} approved your booking request`, other);
    case "request_declined":
      return result(`${other} declined your booking request`, other);
    case "appointment_booked":
      return result(`${actor} booked a ${ctx.apptType ?? "session"}${fmtWhen(ctx.whenIso)}`, actor);
    case "appointment_cancelled":
      return result(`${actor} cancelled an appointment${fmtWhen(ctx.whenIso)}`, actor);
    case "deposit_paid":
      return result(`${actor} paid their deposit — booking confirmed`, actor);
    case "message_received":
      return result(`${actor} sent you a message`, actor);
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
    await admin.from("notifications").insert({
      user_id: userId,
      kind,
      payload: {
        ...buildNotification(kind, ctx),
        ...(ctx.requestId ? { requestId: ctx.requestId } : {}),
        ...(ctx.actorUserId ? { actorUserId: ctx.actorUserId } : {}),
      },
    });
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
