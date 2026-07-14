"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyDepositToAppointment } from "@/lib/booking/deposits/orchestrate";
import { artistUserId, notifyUser } from "@/lib/booking/notify";
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
import { computeArtistSlotsRange, localDateOf } from "@/lib/booking/server-slots";
import {
  type DbBookingSettings,
  type DbFlashItem,
  effectiveRequestStatus,
  mapDbBookingSettings,
  mapDbFlashItem,
} from "@/lib/supabase/booking-types";
import {
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

export async function submitBookingRequest(
  input: unknown
): Promise<ActionResult & { requestId?: string }> {
  const parsed = SubmitBookingRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to send a booking request." };

  // Artist must exist, use inbuilt booking, and be taking custom requests.
  const { data: settingsRow } = await supabase
    .from("booking_settings")
    .select("booking_mode, accepting_bookings, custom_requests_enabled")
    .eq("artist_id", parsed.data.artistId)
    .maybeSingle();
  if (
    !settingsRow ||
    settingsRow.booking_mode !== "inbuilt" ||
    !settingsRow.accepting_bookings ||
    !settingsRow.custom_requests_enabled
  ) {
    return { success: false, error: "This artist is not taking requests right now." };
  }

  const d = parsed.data;
  const customerName = await customerNameOf(supabase, user.id, user.email);
  const { data: created, error } = await supabase
    .from("booking_requests")
    .insert({
      customer_id: user.id,
      customer_name: customerName,
      artist_id: d.artistId,
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
  await notifyUser(admin, await artistUserId(admin, d.artistId), "request_received", {
    actorName: customerName ?? undefined,
  });
  return { success: true, requestId: created.id };
}

/** The explicit booking-mode choice: inbuilt, external link-out, or off. */
export async function setBookingMode(input: unknown): Promise<ActionResult> {
  const parsed = SetBookingModeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };
  const entity = await resolveBookingEntity(supabase);
  if (!entity) return { success: false, error: "No artist or studio profile found." };

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

export async function respondToBookingRequest(input: unknown): Promise<ActionResult> {
  const parsed = RespondToRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };

  const request = await fetchRequestById(supabase, parsed.data.requestId);
  if (!request) return { success: false, error: "Request not found." };

  // Only the receiving artist may respond (front-desk grants arrive in phase 5).
  const { data: artistRow } = await supabase
    .from("artists")
    .select("id")
    .eq("id", request.artistId ?? "")
    .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
    .maybeSingle();
  if (!artistRow) return { success: false, error: "Only the artist can respond to this request." };

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
    { otherName: request.artistName }
  );
  const responderUserId = request.artistId ? await artistUserId(admin, request.artistId) : null;
  if (responderUserId) {
    const quote =
      d.action === "accept" && (d.quoteMinCents !== undefined || d.quoteMaxCents !== undefined)
        ? ` — quote $${((d.quoteMinCents ?? d.quoteMaxCents ?? 0) / 100).toFixed(0)}${
            d.quoteMaxCents !== undefined && d.quoteMinCents !== undefined
              ? `-$${(d.quoteMaxCents / 100).toFixed(0)}`
              : ""
          }`
        : "";
    const content =
      d.action === "accept"
        ? `[Booking] Accepted your request${quote}. ${
            d.schedulingMode === "propose"
              ? "I offered times — pick one from your dashboard."
              : "Book a time from your dashboard."
          }`
        : `[Booking] Declined your request${d.responseMessage ? `: ${d.responseMessage}` : "."}`;
    await postBookingMessage(admin, {
      artistUserId: responderUserId,
      customerId: request.customerId,
      content,
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
  const parsed = ScheduleFromRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in first." };

  const request = await fetchRequestById(supabase, parsed.data.requestId);
  if (!request || request.customerId !== user.id) {
    return { success: false, error: "Request not found." };
  }
  if (request.status !== "accepted" || !request.schedulingMode || !request.artistId) {
    return { success: false, error: "This request is not ready to schedule." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();

  let openSlots: { startAt: string; endAt: string }[] = [];
  let timezone = "America/New_York";
  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", request.artistId)
    .maybeSingle();
  if (settingsRow) timezone = (settingsRow as DbBookingSettings).timezone;

  if (request.schedulingMode === "open_calendar") {
    if (!settingsRow) {
      return { success: false, error: "This artist has no availability set up." };
    }
    // Recompute slots for the chosen local day only, server-side.
    const localDate = localDateOf(chosen.startAt, timezone);
    const range = await computeArtistSlotsRange(admin, {
      artistId: request.artistId,
      durationMin: request.sessionDurationMin ?? 180,
      fromDate: localDate,
      toDate: localDate,
      now,
    });
    openSlots = range?.slots ?? [];
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
  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: user.id,
      customer_name: request.customerName,
      artist_id: request.artistId,
      request_id: request.id,
      type: "session",
      start_at: chosen.startAt,
      end_at: chosen.endAt,
      timezone,
      deposit_cents: depositCents,
      ...depositInsertFields(depositCents),
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23P01") {
      return { success: false, error: "That time was just taken — pick another." };
    }
    return { success: false, error: GENERIC_ERROR };
  }
  // Link multi-session bookings to their project.
  if (request.isMultiSession) {
    const project = await fetchProjectByRequest(admin, request.id);
    if (project) {
      await admin.from("appointments").update({ project_id: project.id }).eq("id", created.id);
    }
  }
  const { checkoutUrl } = await applyDepositToAppointment(admin, {
    appointmentId: created.id,
    artistId: request.artistId,
    depositCents,
    description: `Tattoo deposit - ${request.artistName ?? "session"}`,
    origin: await requestOrigin(),
  });
  await notifyUser(admin, await artistUserId(admin, request.artistId), "appointment_booked", {
    actorName: request.customerName ?? undefined,
    apptType: "session",
    whenIso: chosen.startAt,
  });
  return { success: true, appointmentId: created.id, checkoutUrl: checkoutUrl ?? undefined };
}

export async function bookConsultation(
  input: unknown
): Promise<ActionResult & { appointmentId?: string; checkoutUrl?: string }> {
  const parsed = BookConsultationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to book a consultation." };

  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", parsed.data.artistId)
    .maybeSingle();
  if (!settingsRow) return { success: false, error: "This artist is not taking consultations." };
  const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
  if (settings.bookingMode !== "inbuilt" || !settings.acceptingBookings || !settings.consultationsEnabled) {
    return { success: false, error: "This artist is not taking consultations." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const localDate = localDateOf(chosen.startAt, settings.timezone);
  const range = await computeArtistSlotsRange(admin, {
    artistId: parsed.data.artistId,
    durationMin: settings.consultDurationMin,
    fromDate: localDate,
    toDate: localDate,
    now,
  });
  const verdict = validateChosenTime({
    mode: "open_calendar",
    proposedTimes: [],
    openSlots: range?.slots ?? [],
    chosen,
    now,
  });
  if (!verdict.ok) return { success: false, error: verdict.error };

  // A paid consult charges its price through the deposit rails (spec).
  const consultDeposit = settings.consultPriceCents;
  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: user.id,
      customer_name: await customerNameOf(supabase, user.id, user.email),
      artist_id: parsed.data.artistId,
      type: "consultation",
      start_at: chosen.startAt,
      end_at: chosen.endAt,
      timezone: settings.timezone,
      price_cents: settings.consultPriceCents > 0 ? settings.consultPriceCents : null,
      deposit_cents: consultDeposit,
      ...depositInsertFields(consultDeposit),
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23P01") {
      return { success: false, error: "That time was just taken — pick another." };
    }
    return { success: false, error: GENERIC_ERROR };
  }
  const { checkoutUrl } = await applyDepositToAppointment(admin, {
    appointmentId: created.id,
    artistId: parsed.data.artistId,
    depositCents: consultDeposit,
    description: "Consultation booking",
    origin: await requestOrigin(),
  });
  await notifyUser(admin, await artistUserId(admin, parsed.data.artistId), "appointment_booked", {
    actorName: (await customerNameOf(supabase, user.id, user.email)) ?? undefined,
    apptType: "consultation",
    whenIso: chosen.startAt,
  });
  return { success: true, appointmentId: created.id, checkoutUrl: checkoutUrl ?? undefined };
}

export async function bookFlash(
  input: unknown
): Promise<ActionResult & { appointmentId?: string; checkoutUrl?: string }> {
  const parsed = BookFlashSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
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

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", item.artistId)
    .maybeSingle();
  if (!settingsRow) return { success: false, error: "This artist is not taking flash bookings." };
  const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
  if (settings.bookingMode !== "inbuilt" || !settings.acceptingBookings || !settings.flashEnabled) {
    return { success: false, error: "This artist is not taking flash bookings." };
  }

  const chosen = { startAt: parsed.data.startAt, endAt: parsed.data.endAt };
  const now = new Date();
  const localDate = localDateOf(chosen.startAt, settings.timezone);
  const range = await computeArtistSlotsRange(admin, {
    artistId: item.artistId,
    durationMin: item.durationMin,
    fromDate: localDate,
    toDate: localDate,
    now,
  });
  const verdict = validateChosenTime({
    mode: "open_calendar",
    proposedTimes: [],
    openSlots: range?.slots ?? [],
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

  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: user.id,
      customer_name: await customerNameOf(supabase, user.id, user.email),
      artist_id: item.artistId,
      flash_item_id: item.id,
      type: "flash",
      start_at: chosen.startAt,
      end_at: chosen.endAt,
      timezone: settings.timezone,
      price_cents: item.priceCents,
      deposit_cents: item.depositCents,
      ...depositInsertFields(item.depositCents),
    })
    .select("id")
    .single();
  if (error) {
    if (claimed) {
      // Compensating: give the piece back.
      await admin.from("flash_items").update({ active: true }).eq("id", item.id);
    }
    if (error.code === "23P01") {
      return { success: false, error: "That time was just taken — pick another." };
    }
    return { success: false, error: GENERIC_ERROR };
  }
  const { checkoutUrl } = await applyDepositToAppointment(admin, {
    appointmentId: created.id,
    artistId: item.artistId,
    depositCents: item.depositCents,
    description: `Deposit: ${item.title}`,
    origin: await requestOrigin(),
  });
  await notifyUser(admin, await artistUserId(admin, item.artistId), "appointment_booked", {
    actorName: (await customerNameOf(supabase, user.id, user.email)) ?? undefined,
    apptType: "flash",
    whenIso: chosen.startAt,
  });
  return { success: true, appointmentId: created.id, checkoutUrl: checkoutUrl ?? undefined };
}
