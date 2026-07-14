/**
 * Server-only slot computation: fetches settings/rules/overrides/busy with
 * the ADMIN client (appointments are RLS-protected) and returns derived
 * slots. Callers must never expose the busy intervals — only the slots.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeOpenSlots, type Slot } from "./availability";
import { zonedParts } from "./tz";
import type { BookingSettings } from "@/lib/types/booking";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
} from "@/lib/supabase/booking-types";

/** "YYYY-MM-DD" wall-clock date of an instant in a zone. */
export function localDateOf(iso: string, timeZone: string): string {
  const p = zonedParts(new Date(iso), timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export async function computeArtistSlotsRange(
  admin: SupabaseClient,
  input: { artistId: string; durationMin: number; fromDate: string; toDate: string; now?: Date }
): Promise<{ slots: Slot[]; timezone: string; settings: BookingSettings } | null> {
  const { artistId, durationMin, fromDate, toDate } = input;
  const now = input.now ?? new Date();

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("artist_id", artistId)
    .maybeSingle();
  if (!settingsRow) return null;
  const settings = mapDbBookingSettings(settingsRow as DbBookingSettings);
  if (!settings.acceptingBookings) {
    return { slots: [], timezone: settings.timezone, settings };
  }

  const [rulesRes, overridesRes, busyRes] = await Promise.all([
    admin.from("availability_rules").select("*").eq("artist_id", artistId),
    admin
      .from("availability_overrides")
      .select("*")
      .eq("artist_id", artistId)
      .gte("date", fromDate)
      .lte("date", toDate),
    // Active appointments overlapping the window: end after window start AND
    // start before window end (day-padded for timezone edges).
    admin
      .from("appointments")
      .select("start_at, end_at")
      .eq("artist_id", artistId)
      .in("status", ["pending_deposit", "confirmed"])
      .gte("end_at", `${fromDate}T00:00:00Z`)
      .lte("start_at", `${toDate}T23:59:59Z`),
  ]);

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
    fromDate,
    toDate,
    now,
  });

  return { slots, timezone: settings.timezone, settings };
}
