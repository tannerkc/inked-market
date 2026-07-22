"use server";

import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z, ZodType } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyDepositToAppointment } from "@/lib/booking/deposits/orchestrate";
import {
  artistUserId,
  bookingTargetUserId,
  notificationContextForTarget,
  notifyUser,
} from "@/lib/booking/notify";
import { postBookingMessage } from "@/lib/booking/messaging";
import {
  BookConsultationSchema,
  BookFlashSchema,
  RespondToRequestSchema,
  ScheduleFromRequestSchema,
  SetBookingModeSchema,
  SubmitBookingRequestSchema,
} from "@/lib/validation/schemas";
import { validateChosenTime } from "@/lib/booking/scheduling";
import { computeEntitySlotsRange, localDateOf } from "@/lib/booking/server-slots";
import {
  type DbFlashItem,
  effectiveRequestStatus,
  mapDbFlashItem,
} from "@/lib/supabase/booking-types";
import type {
  BookingEntityRef,
  BookingRequestRecord,
  BookingSettings,
} from "@/lib/types/booking";
import {
  fetchBookingSettings,
  fetchProjectByRequest,
  fetchRequestById,
  resolveBookingEntity,
  saveBookingSettings,
} from "@/lib/data/supabase-booking";

interface ActionResult {
  success: boolean;
  error?: string;
}

const GENERIC_ERROR = "Something went wrong — try again.";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

const HOLD_HOURS = 24;

/** Insert fields for the deposit state machine: a deposit ask holds the slot. */
function depositInsertFields(depositCents: number): {
  status: "pending_deposit" | "confirmed";
  deposit_status: "pending" | "not_required";
  hold_expires_at: string | null;
} {
  if (depositCents > 0) {
    return {
      status: "pending_deposit",
      deposit_status: "pending",
      hold_expires_at: new Date(Date.now() + HOLD_HOURS * 3_600_000).toISOString(),
    };
  }
  return { status: "confirmed", deposit_status: "not_required", hold_expires_at: null };
}

/** Origin for checkout return URLs, from the action's request headers. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3002"}`;
}

/** Display-name snapshot for denormalized customer_name columns. */
async function customerNameOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  return profile?.name ?? email?.split("@")[0] ?? null;
}

type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

/** Validate action input; the first issue message becomes the user-facing error. */
function parseInput<T>(schema: ZodType<T>, input: unknown): Parsed<T> {
  const r = schema.safeParse(input);
  return r.success
    ? { ok: true, data: r.data }
    : { ok: false, error: r.error.issues[0]?.message ?? GENERIC_ERROR };
}

/** True when the target uses inbuilt booking, is accepting, and the flow's flag is on. */
function acceptsFlow(
  settings: BookingSettings | null,
  flag: "customRequestsEnabled" | "consultationsEnabled" | "flashEnabled"
): settings is BookingSettings {
  return Boolean(
    settings &&
      settings.bookingMode === "inbuilt" &&
      settings.acceptingBookings &&
      settings[flag]
  );
}

/** Server-side recompute of one local day's open slots for an entity. */
async function openSlotsForDay(
  admin: SupabaseClient,
  opts: {
    entity: BookingEntityRef;
    durationMin: number;
    timezone: string;
    startAt: string;
    now: Date;
  }
): Promise<{ startAt: string; endAt: string }[]> {
  const localDate = localDateOf(opts.startAt, opts.timezone);
  const range = await computeEntitySlotsRange(admin, {
    entity: opts.entity,
    durationMin: opts.durationMin,
    fromDate: localDate,
    toDate: localDate,
    now: opts.now,
  });
  return range?.slots ?? [];
}

/** Insert an appointment row; the gist-exclusion race becomes a friendly error. */
async function insertAppointment(
  supabase: SupabaseClient,
  row: Record<string, unknown>
): Promise<Parsed<{ id: string }>> {
  const { data, error } = await supabase
    .from("appointments")
    .insert(row)
    .select("id")
    .single();
  if (error || !data) {
    return {
      ok: false,
      error:
        error?.code === "23P01"
          ? "That time was just taken — pick another."
          : GENERIC_ERROR,
    };
  }
  return { ok: true, data: { id: (data as { id: string }).id } };
}

/** Route the deposit: artist targets use provider rails (checkout URL); studio
 *  targets fall back to the manual mark-received path. */
async function routeDeposit(
  admin: SupabaseClient,
  opts: {
    appointmentId: string;
    target: BookingEntityRef;
    depositCents: number;
    description: string;
  }
): Promise<string | null> {
  if (opts.target.artistId) {
    const { checkoutUrl } = await applyDepositToAppointment(admin, {
      appointmentId: opts.appointmentId,
      artistId: opts.target.artistId,
      depositCents: opts.depositCents,
      description: opts.description,
      origin: await requestOrigin(),
    });
    return checkoutUrl;
  }
  if (opts.depositCents > 0) {
    await admin
      .from("appointments")
      .update({ deposit_provider: "manual" })
      .eq("id", opts.appointmentId);
  }
  return null;
}

/** Only the receiving party may respond: the artist, or (for studio-target
 *  requests) the studio owner. */
async function canRespondToRequest(
  supabase: SupabaseClient,
  request: BookingRequestRecord,
  userId: string
): Promise<boolean> {
  if (request.artistId) {
    const { data } = await supabase
      .from("artists")
      .select("id")
      .eq("id", request.artistId)
      .or(`user_id.eq.${userId},claimed_by.eq.${userId}`)
      .maybeSingle();
    return Boolean(data);
  }
  if (request.studioId) {
    const { data } = await supabase
      .from("studios")
      .select("id")
      .eq("id", request.studioId)
      .eq("claimed_by", userId)
      .maybeSingle();
    return Boolean(data);
  }
  return false;
}

/** The system thread line summarizing an accept/decline (with quote). */
function responseMessageContent(d: z.infer<typeof RespondToRequestSchema>): string {
  if (d.action !== "accept") {
    return `[Booking] Declined your request${d.responseMessage ? `: ${d.responseMessage}` : "."}`;
  }
  const dollars = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const quote =
    d.quoteMinCents !== undefined || d.quoteMaxCents !== undefined
      ? ` — quote ${dollars(d.quoteMinCents ?? d.quoteMaxCents ?? 0)}${
          d.quoteMaxCents !== undefined && d.quoteMinCents !== undefined
            ? `-${dollars(d.quoteMaxCents)}`
            : ""
        }`
      : "";
  return `[Booking] Accepted your request${quote}. ${
    d.schedulingMode === "propose"
      ? "I offered times — pick one from your dashboard."
      : "Book a time from your dashboard."
  }`;
}

export async function submitBookingRequest(
  input: unknown
): Promise<ActionResult & { requestId?: string }> {
  const parsed = parseInput(SubmitBookingRequestSchema, input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to send a booking request." };

  const d = parsed.data;
  // The target (artist or studio) must use inbuilt booking and take requests.
  const settings = await fetchBookingSettings(supabase, {
    artistId: d.artistId,
    studioId: d.studioId,
  });
  if (!acceptsFlow(settings, "customRequestsEnabled")) {
    return { success: false, error: "Not taking requests right now." };
  }

  const customerName = await customerNameOf(supabase, user.id, user.email);
  const { data: created, error } = await supabase
    .from("booking_requests")
    .insert({
      customer_id: user.id,
      customer_name: customerName,
      artist_id: d.artistId ?? null,
      studio_id: d.studioId ?? null,
      preferred_artist_id: d.preferredArtistId ?? null,
      description: d.description,
      placement: d.placement ?? null,
      size_category: d.sizeCategory ?? null,
      budget_range: d.budgetRange ?? null,
      is_color: d.color === undefined ? null : d.color === "color",
      reference_image_urls: d.referenceImageUrls,
      preferred_timing: d.preferredTiming ?? null,
      flexible_dates: d.flexibleDates,
      is_multi_session: d.isMultiSession,
      estimated_sessions: d.estimatedSessions ?? null,
    })
    .select("id")
    .single();
  if (error || !created) return { success: false, error: GENERIC_ERROR };

  const admin = createAdminClient();
  await notifyUser(admin, await bookingTargetUserId(admin, d), "request_received", {
    actorName: customerName ?? undefined,
    requestId: created.id,
    recipientContext: notificationContextForTarget(d),
  });
  return { success: true, requestId: created.id };
}

/** The explicit booking-mode choice: inbuilt, external link-out, or off. */
export async function setBookingMode(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(SetBookingModeSchema, input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };
  const entity = await resolveBookingEntity(supabase);
  if (!entity) return { success: false, error: "No artist or studio profile found." };
  if (parsed.data.mode === "studio" && !entity.artistId) {
    return { success: false, error: "Only artists can book through a studio page." };
  }

  try {
    await saveBookingSettings(supabase, entity, {
      bookingMode: parsed.data.mode,
      externalBookingUrl: parsed.data.mode === "external" ? parsed.data.externalUrl ?? null : null,
    });
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

/** Bell quick-view (customer side): own request + scheduling context. */
export async function getOwnBookingRequest(
  requestId: string
): Promise<
  ActionResult & { request?: BookingRequestRecord; scheduled?: boolean; sessionCount?: number }
> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };
  const request = await fetchRequestById(supabase, requestId);
  if (!request || request.customerId !== user.id) {
    return { success: false, error: "Request not found." };
  }
  const { data: appts } = await supabase
    .from("appointments")
    .select("status")
    .eq("request_id", requestId);
  const rows = appts ?? [];
  return {
    success: true,
    request,
    scheduled: rows.length > 0,
    sessionCount: rows.filter((a) => a.status !== "cancelled" && a.status !== "no_show").length,
  };
}

/** Bell quick-view: fetch one request, gated to whoever may respond to it. */
export async function getBookingRequestForResponse(
  requestId: string
): Promise<ActionResult & { request?: BookingRequestRecord }> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };
  const request = await fetchRequestById(supabase, requestId);
  if (!request) return { success: false, error: "Request not found." };
  if (!(await canRespondToRequest(supabase, request, user.id))) {
    return { success: false, error: "Only the receiving artist or studio can view this." };
  }
  return { success: true, request };
}

export async function respondToBookingRequest(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(RespondToRequestSchema, input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };

  const request = await fetchRequestById(supabase, parsed.data.requestId);
  if (!request) return { success: false, error: "Request not found." };
  if (!(await canRespondToRequest(supabase, request, user.id))) {
    return { success: false, error: "Only the receiving artist or studio can respond." };
  }
  if (effectiveRequestStatus(request, new Date()) !== "pending") {
    return { success: false, error: "This request was already handled or expired." };
  }

  const d = parsed.data;
  const patch =
    d.action === "decline"
      ? { status: "declined", response_message: d.responseMessage ?? null }
      : {
          status: "accepted",
          response_message: d.responseMessage ?? null,
          quote_min_cents: d.quoteMinCents ?? null,
          quote_max_cents: d.quoteMaxCents ?? null,
          deposit_cents: d.depositCents ?? null,
          scheduling_mode: d.schedulingMode,
          session_duration_min: d.sessionDurationMin ?? null,
          proposed_times: d.proposedTimes,
        };

  // Atomic transition: only lands if still pending.
  const { data: updated, error } = await supabase
    .from("booking_requests")
    .update(patch)
    .eq("id", d.requestId)
    .eq("status", "pending")
    .select("id");
  if (error) return { success: false, error: GENERIC_ERROR };
  if (!updated || updated.length === 0) {
    return { success: false, error: "This request was already handled." };
  }

  const admin = createAdminClient();

  // Multi-session accepts open a project; the 1-row transition guarantee
  // above means this runs at most once per request.
  if (d.action === "accept" && request.isMultiSession) {
    await admin.from("projects").insert({
      request_id: request.id,
      customer_id: request.customerId,
      artist_id: request.artistId ?? null,
      title: request.description.slice(0, 60),
      estimated_sessions: request.estimatedSessions,
      status: "active",
    });
  }

  // Best-effort color: in-app notification + a system line in the thread.
  await notifyUser(
    admin,
    request.customerId,
    d.action === "accept" ? "request_accepted" : "request_declined",
    {
      otherName: request.artistName ?? request.studioName,
      requestId: request.id,
      recipientContext: "customer",
    }
  );
  const responderUserId = await bookingTargetUserId(admin, request);
  if (responderUserId) {
    await postBookingMessage(admin, {
      senderUserId: responderUserId,
      customerId: request.customerId,
      content: responseMessageContent(d),
      requestId: request.id,
    });
  }
  return { success: true };
}

export async function withdrawBookingRequest(requestId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };
  const { data: updated, error } = await supabase
    .from("booking_requests")
    .update({ status: "withdrawn" })
    .eq("id", requestId)
    .eq("customer_id", user.id)
    .eq("status", "pending")
    .select("id");
  if (error) return { success: false, error: GENERIC_ERROR };
  if (!updated || updated.length === 0) {
    return { success: false, error: "This request can no longer be withdrawn." };
  }
  return { success: true };
}

export async function scheduleFromRequest(
  input: unknown
): Promise<ActionResult & { appointmentId?: string; checkoutUrl?: string }> {
  const parsed = parseInput(ScheduleFromRequestSchema, input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };

  const request = await fetchRequestById(supabase, parsed.data.requestId);
  if (!request || request.customerId !== user.id) {
    return { success: false, error: "Request not found." };
  }
  const target = { artistId: request.artistId, studioId: request.studioId };
  if (
    request.status !== "accepted" ||
    !request.schedulingMode ||
    (!target.artistId && !target.studioId)
  ) {
    return { success: false, error: "This request is not ready to schedule." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const admin = createAdminClient();
  const settings = await fetchBookingSettings(admin, target);
  const timezone = settings?.timezone ?? "America/New_York";

  let openSlots: { startAt: string; endAt: string }[] = [];
  if (request.schedulingMode === "open_calendar") {
    if (!settings) {
      return { success: false, error: "No availability is set up yet." };
    }
    // Recompute slots for the chosen local day only, server-side.
    openSlots = await openSlotsForDay(admin, {
      entity: target,
      durationMin: request.sessionDurationMin ?? 180,
      timezone,
      startAt: chosen.startAt,
      now,
    });
  }

  const verdict = validateChosenTime({
    mode: request.schedulingMode,
    proposedTimes: request.proposedTimes,
    openSlots,
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  const depositCents = request.depositCents ?? 0;
  const created = await insertAppointment(supabase, {
    customer_id: user.id,
    customer_name: request.customerName,
    artist_id: target.artistId ?? null,
    studio_id: target.studioId ?? null,
    request_id: request.id,
    type: "session",
    start_at: chosen.startAt,
    end_at: chosen.endAt,
    timezone,
    deposit_cents: depositCents,
    ...depositInsertFields(depositCents),
  });
  if (!created.ok) return { success: false, error: created.error };

  // Link multi-session bookings to their project.
  if (request.isMultiSession) {
    const project = await fetchProjectByRequest(admin, request.id);
    if (project) {
      await admin
        .from("appointments")
        .update({ project_id: project.id })
        .eq("id", created.data.id);
    }
  }
  const checkoutUrl = await routeDeposit(admin, {
    appointmentId: created.data.id,
    target,
    depositCents,
    description: `Tattoo deposit - ${request.artistName ?? "session"}`,
  });
  await notifyUser(admin, await bookingTargetUserId(admin, target), "appointment_booked", {
    actorName: request.customerName ?? undefined,
    apptType: "session",
    whenIso: chosen.startAt,
    recipientContext: notificationContextForTarget(target),
  });
  return { success: true, appointmentId: created.data.id, checkoutUrl: checkoutUrl ?? undefined };
}

export async function bookConsultation(
  input: unknown
): Promise<ActionResult & { appointmentId?: string; checkoutUrl?: string }> {
  const parsed = parseInput(BookConsultationSchema, input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to book a consultation." };

  const target = { artistId: parsed.data.artistId, studioId: parsed.data.studioId };
  const admin = createAdminClient();
  const settings = await fetchBookingSettings(admin, target);
  if (!acceptsFlow(settings, "consultationsEnabled")) {
    return { success: false, error: "Not taking consultations right now." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const verdict = validateChosenTime({
    mode: "open_calendar",
    proposedTimes: [],
    openSlots: await openSlotsForDay(admin, {
      entity: target,
      durationMin: settings.consultDurationMin,
      timezone: settings.timezone,
      startAt: chosen.startAt,
      now,
    }),
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  // A paid consult charges its price through the deposit rails (spec).
  const consultDeposit = settings.consultPriceCents;
  const customerName = await customerNameOf(supabase, user.id, user.email);
  const created = await insertAppointment(supabase, {
    customer_id: user.id,
    customer_name: customerName,
    artist_id: target.artistId ?? null,
    studio_id: target.studioId ?? null,
    type: "consultation",
    start_at: chosen.startAt,
    end_at: chosen.endAt,
    timezone: settings.timezone,
    price_cents: settings.consultPriceCents > 0 ? settings.consultPriceCents : null,
    deposit_cents: consultDeposit,
    ...depositInsertFields(consultDeposit),
  });
  if (!created.ok) return { success: false, error: created.error };

  // Provider deposits are artist-account-scoped; studio consults use manual.
  const checkoutUrl = await routeDeposit(admin, {
    appointmentId: created.data.id,
    target,
    depositCents: consultDeposit,
    description: "Consultation booking",
  });
  await notifyUser(admin, await bookingTargetUserId(admin, target), "appointment_booked", {
    actorName: customerName ?? undefined,
    apptType: "consultation",
    whenIso: chosen.startAt,
    recipientContext: notificationContextForTarget(target),
  });
  return { success: true, appointmentId: created.data.id, checkoutUrl: checkoutUrl ?? undefined };
}

export async function bookFlash(
  input: unknown
): Promise<ActionResult & { appointmentId?: string; checkoutUrl?: string }> {
  const parsed = parseInput(BookFlashSchema, input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to book this piece." };

  const admin = createAdminClient();
  const { data: itemRow } = await admin
    .from("flash_items")
    .select("*")
    .eq("id", parsed.data.flashItemId)
    .maybeSingle();
  if (!itemRow) return { success: false, error: "This piece is no longer available." };
  const item = mapDbFlashItem(itemRow as DbFlashItem);
  if (!item.active) return { success: false, error: "This piece is no longer available." };

  const target = { artistId: item.artistId };
  const settings = await fetchBookingSettings(admin, target);
  if (!acceptsFlow(settings, "flashEnabled")) {
    return { success: false, error: "This artist is not taking flash bookings." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const verdict = validateChosenTime({
    mode: "open_calendar",
    proposedTimes: [],
    openSlots: await openSlotsForDay(admin, {
      entity: target,
      durationMin: item.durationMin,
      timezone: settings.timezone,
      startAt: chosen.startAt,
      now,
    }),
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  // One-off claim BEFORE insert: atomic active->inactive flip loses the race
  // cleanly; a failed insert reverts the claim (compensating action).
  let claimed = false;
  if (item.oneOff) {
    const { data: claimedRows } = await admin
      .from("flash_items")
      .update({ active: false })
      .eq("id", item.id)
      .eq("active", true)
      .select("id");
    if (!claimedRows || claimedRows.length === 0) {
      return { success: false, error: "Someone just claimed this piece." };
    }
    claimed = true;
  }

  const customerName = await customerNameOf(supabase, user.id, user.email);
  const created = await insertAppointment(supabase, {
    customer_id: user.id,
    customer_name: customerName,
    artist_id: item.artistId,
    flash_item_id: item.id,
    type: "flash",
    start_at: chosen.startAt,
    end_at: chosen.endAt,
    timezone: settings.timezone,
    price_cents: item.priceCents,
    deposit_cents: item.depositCents,
    ...depositInsertFields(item.depositCents),
  });
  if (!created.ok) {
    if (claimed) {
      // Compensating: give the piece back.
      await admin.from("flash_items").update({ active: true }).eq("id", item.id);
    }
    return { success: false, error: created.error };
  }
  const checkoutUrl = await routeDeposit(admin, {
    appointmentId: created.data.id,
    target,
    depositCents: item.depositCents,
    description: `Deposit: ${item.title}`,
  });
  await notifyUser(admin, await artistUserId(admin, item.artistId), "appointment_booked", {
    actorName: customerName ?? undefined,
    apptType: "flash",
    whenIso: chosen.startAt,
    recipientContext: "artist",
  });
  return { success: true, appointmentId: created.data.id, checkoutUrl: checkoutUrl ?? undefined };
}
