// Client-side data access for booking settings + availability (RLS enforced),
// following the lib/data/supabase-artists.ts pattern.
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AvailabilityOverride,
  AvailabilityRule,
  BookingEntityRef,
  BookingSettings,
  BookingSettingsInput,
} from "@/lib/types/booking";
import type { WeeklyAvailability } from "@/lib/types";
import {
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingSettings,
  mapBookingSettingsToDb,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingSettings,
  weeklyToRules,
} from "@/lib/supabase/booking-types";

/** The signed-in user's bookable entity. Artist row wins over claimed studio. */
export async function resolveBookingEntity(
  supabase: SupabaseClient
): Promise<BookingEntityRef | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
    .limit(1)
    .maybeSingle();
  if (artist) return { artistId: artist.id };

  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("claimed_by", user.id)
    .maybeSingle();
  return studio ? { studioId: studio.id } : null;
}

function entityColumns(entity: BookingEntityRef): { column: string; id: string } {
  if (entity.artistId) return { column: "artist_id", id: entity.artistId };
  if (entity.studioId) return { column: "studio_id", id: entity.studioId };
  throw new Error("BookingEntityRef must set artistId or studioId");
}

export async function fetchBookingSettings(
  supabase: SupabaseClient,
  entity: BookingEntityRef
): Promise<BookingSettings | null> {
  const { column, id } = entityColumns(entity);
  const { data, error } = await supabase
    .from("booking_settings")
    .select("*")
    .eq(column, id)
    .maybeSingle();
  if (error || !data) return null;
  return mapDbBookingSettings(data as DbBookingSettings);
}

export async function saveBookingSettings(
  supabase: SupabaseClient,
  entity: BookingEntityRef,
  input: Partial<BookingSettingsInput>
): Promise<void> {
  const { column, id } = entityColumns(entity);
  const row = { ...mapBookingSettingsToDb(input), [column]: id };
  const { error } = await supabase.from("booking_settings").upsert(row, { onConflict: column });
  if (error) throw new Error(`Failed to save booking settings: ${error.message}`);
}

export async function fetchAvailability(
  supabase: SupabaseClient,
  entity: BookingEntityRef
): Promise<{ rules: AvailabilityRule[]; overrides: AvailabilityOverride[] }> {
  const { column, id } = entityColumns(entity);
  const [rulesRes, overridesRes] = await Promise.all([
    supabase.from("availability_rules").select("*").eq(column, id),
    supabase.from("availability_overrides").select("*").eq(column, id).order("date"),
  ]);
  return {
    rules: ((rulesRes.data ?? []) as DbAvailabilityRule[]).map(mapDbAvailabilityRule),
    overrides: ((overridesRes.data ?? []) as DbAvailabilityOverride[]).map(
      mapDbAvailabilityOverride
    ),
  };
}

/**
 * Replace-all weekly template write. Low row count (< ~20), runs on explicit
 * Save only — simplest correct approach.
 * ponytail: two statements, not a transaction; a failed insert after delete
 * loses the old template. Move to an RPC if that ever bites.
 */
export async function replaceWeeklyRules(
  supabase: SupabaseClient,
  entity: BookingEntityRef,
  weekly: WeeklyAvailability
): Promise<void> {
  const { column, id } = entityColumns(entity);
  const rows = weeklyToRules(weekly).map((r) => ({
    [column]: id,
    weekday: r.weekday,
    start_time: r.startHm,
    end_time: r.endHm,
  }));
  const { error: delError } = await supabase.from("availability_rules").delete().eq(column, id);
  if (delError) throw new Error(`Failed to clear availability: ${delError.message}`);
  if (rows.length === 0) return;
  const { error } = await supabase.from("availability_rules").insert(rows);
  if (error) throw new Error(`Failed to save availability: ${error.message}`);
}

export async function addBlockedDate(
  supabase: SupabaseClient,
  entity: BookingEntityRef,
  date: string
): Promise<AvailabilityOverride> {
  const { column, id } = entityColumns(entity);
  const { data, error } = await supabase
    .from("availability_overrides")
    .upsert({ [column]: id, date, closed: true }, { onConflict: "artist_id,studio_id,date" })
    .select()
    .single();
  if (error) throw new Error(`Failed to block date: ${error.message}`);
  return mapDbAvailabilityOverride(data as DbAvailabilityOverride);
}

export async function removeOverride(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("availability_overrides").delete().eq("id", id);
  if (error) throw new Error(`Failed to remove override: ${error.message}`);
}
