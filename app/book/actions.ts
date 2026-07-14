"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  RespondToRequestSchema,
  ScheduleFromRequestSchema,
  SubmitBookingRequestSchema,
} from "@/lib/validation/schemas";
import { validateChosenTime } from "@/lib/booking/scheduling";
import { computeOpenSlots } from "@/lib/booking/availability";
import { zonedParts } from "@/lib/booking/tz";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  effectiveRequestStatus,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
} from "@/lib/supabase/booking-types";
import { fetchRequestById } from "@/lib/data/supabase-booking";

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

export async function submitBookingRequest(
  input: unknown
): Promise<ActionResult & { requestId?: string }> {
  const parsed = SubmitBookingRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Sign in to send a booking request." };

  // Artist must exist and be taking custom requests.
  const { data: settingsRow } = await supabase
    .from("booking_settings")
    .select("accepting_bookings, custom_requests_enabled")
    .eq("artist_id", parsed.data.artistId)
    .maybeSingle();
  if (!settingsRow || !settingsRow.accepting_bookings || !settingsRow.custom_requests_enabled) {
    return { success: false, error: "This artist is not taking requests right now." };
  }

  // Display-name snapshot (own profile is readable under RLS).
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const d = parsed.data;
  const { data: created, error } = await supabase
    .from("booking_requests")
    .insert({
      customer_id: user.id,
      customer_name: profile?.name ?? user.email?.split("@")[0] ?? null,
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
  return { success: true, requestId: created.id };
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
): Promise<ActionResult & { appointmentId?: string }> {
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
    const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
    // Recompute slots for the chosen local day only, server-side.
    const p = zonedParts(new Date(chosen.startAt), settings.timezone);
    const localDate = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
    const [rulesRes, overridesRes, busyRes] = await Promise.all([
      admin.from("availability_rules").select("*").eq("artist_id", request.artistId),
      admin
        .from("availability_overrides")
        .select("*")
        .eq("artist_id", request.artistId)
        .eq("date", localDate),
      admin
        .from("appointments")
        .select("start_at, end_at")
        .eq("artist_id", request.artistId)
        .in("status", ["pending_deposit", "confirmed"])
        .gte("end_at", `${localDate}T00:00:00Z`)
        .lte("start_at", `${localDate}T23:59:59Z`),
    ]);
    openSlots = computeOpenSlots({
      rules: ((rulesRes.data ?? []) as DbAvailabilityRule[]).map(mapDbAvailabilityRule),
      overrides: ((overridesRes.data ?? []) as DbAvailabilityOverride[]).map(
        mapDbAvailabilityOverride
      ),
      busy: ((busyRes.data ?? []) as { start_at: string; end_at: string }[]).map((b) => ({
        startAt: b.start_at,
        endAt: b.end_at,
      })),
      settings: {
        timezone: settings.timezone,
        slotGranularityMin: settings.slotGranularityMin,
        bufferMin: settings.bufferMin,
        minNoticeHours: settings.minNoticeHours,
        maxHorizonDays: settings.maxHorizonDays,
      },
      durationMin: request.sessionDurationMin ?? 180,
      fromDate: localDate,
      toDate: localDate,
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
      status: "confirmed",
      deposit_cents: request.depositCents ?? 0,
      deposit_status: "not_required", // phase 4 wires real deposits
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23P01") {
      return { success: false, error: "That time was just taken — pick another." };
    }
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true, appointmentId: created.id };
}
