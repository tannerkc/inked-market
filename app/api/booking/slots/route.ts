import { NextResponse } from "next/server";
import { SlotsQuerySchema } from "@/lib/validation/schemas";
import { computeOpenSlots } from "@/lib/booking/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
} from "@/lib/supabase/booking-types";

/**
 * Open slots for an artist. Admin client reads busy intervals (appointments
 * are RLS-protected) but the response contains only derived open slots —
 * no appointment data ever leaves this handler.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = SlotsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { artistId, durationMin, from, to } = parsed.data;

  const admin = createAdminClient();
  const [settingsRes, rulesRes, overridesRes, busyRes] = await Promise.all([
    admin.from("booking_settings").select("*").eq("artist_id", artistId).maybeSingle(),
    admin.from("availability_rules").select("*").eq("artist_id", artistId),
    admin
      .from("availability_overrides")
      .select("*")
      .eq("artist_id", artistId)
      .gte("date", from)
      .lte("date", to),
    // Any active appointment overlapping the window: ends after window start
    // AND starts before window end (day-padded for timezone edges).
    admin
      .from("appointments")
      .select("start_at, end_at")
      .eq("artist_id", artistId)
      .in("status", ["pending_deposit", "confirmed"])
      .gte("end_at", `${from}T00:00:00Z`)
      .lte("start_at", `${to}T23:59:59Z`),
  ]);

  if (!settingsRes.data) {
    return NextResponse.json({ slots: [], timezone: "America/New_York" });
  }
  const settings = mapDbBookingSettings(settingsRes.data as DbBookingSettings);
  if (!settings.acceptingBookings) {
    return NextResponse.json({ slots: [], timezone: settings.timezone });
  }

  const slots = computeOpenSlots({
    rules: ((rulesRes.data ?? []) as DbAvailabilityRule[]).map(mapDbAvailabilityRule),
    overrides: ((overridesRes.data ?? []) as DbAvailabilityOverride[]).map(mapDbAvailabilityOverride),
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
    durationMin,
    fromDate: from,
    toDate: to,
    now: new Date(),
  });

  return NextResponse.json({ slots, timezone: settings.timezone });
}
