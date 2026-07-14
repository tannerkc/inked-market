// Client-side data access for booking settings + availability (RLS enforced),
// following the lib/data/supabase-artists.ts pattern.
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppointmentRecord,
  AvailabilityOverride,
  AvailabilityRule,
  BookingEntityRef,
  BookingRequestRecord,
  BookingSettings,
  BookingSettingsInput,
  FlashItem,
  ProjectRecord,
} from "@/lib/types/booking";
import type { WeeklyAvailability } from "@/lib/types";
import {
  type DbAppointment,
  type DbAvailabilityOverride,
  type DbAvailabilityRule,
  type DbBookingRequest,
  type DbBookingSettings,
  type DbFlashItem,
  type DbProject,
  mapBookingSettingsToDb,
  mapDbAppointment,
  mapDbFlashItem,
  mapDbProject,
  mapDbAvailabilityOverride,
  mapDbAvailabilityRule,
  mapDbBookingRequest,
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

// ─── Phase 2: requests + appointments ─────────────────────────────────────

export const REQUEST_SELECT = "*, artists(name), studios(name)";

export async function fetchCustomerRequests(
  supabase: SupabaseClient,
  customerId: string
): Promise<BookingRequestRecord[]> {
  const { data } = await supabase
    .from("booking_requests")
    .select(REQUEST_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbBookingRequest[]).map(mapDbBookingRequest);
}

export async function fetchArtistRequests(
  supabase: SupabaseClient,
  artistId: string
): Promise<BookingRequestRecord[]> {
  const { data } = await supabase
    .from("booking_requests")
    .select(REQUEST_SELECT)
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbBookingRequest[]).map(mapDbBookingRequest);
}

export async function fetchRequestById(
  supabase: SupabaseClient,
  id: string
): Promise<BookingRequestRecord | null> {
  const { data } = await supabase
    .from("booking_requests")
    .select(REQUEST_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapDbBookingRequest(data as DbBookingRequest) : null;
}

export async function fetchCustomerAppointments(
  supabase: SupabaseClient,
  customerId: string
): Promise<AppointmentRecord[]> {
  const { data } = await supabase
    .from("appointments")
    .select(REQUEST_SELECT)
    .eq("customer_id", customerId)
    .order("start_at", { ascending: true });
  return ((data ?? []) as DbAppointment[]).map(mapDbAppointment);
}

// ─── Phase 3: flash + direct booking ──────────────────────────────────────

export async function fetchActiveFlashItems(
  supabase: SupabaseClient,
  artistId: string
): Promise<FlashItem[]> {
  const { data } = await supabase
    .from("flash_items")
    .select("*")
    .eq("artist_id", artistId)
    .eq("active", true)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbFlashItem[]).map(mapDbFlashItem);
}

export async function fetchOwnFlashItems(
  supabase: SupabaseClient,
  artistId: string
): Promise<FlashItem[]> {
  const { data } = await supabase
    .from("flash_items")
    .select("*")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DbFlashItem[]).map(mapDbFlashItem);
}

export async function insertFlashItem(
  supabase: SupabaseClient,
  artistId: string,
  input: {
    title: string;
    imageUrl: string;
    priceCents: number;
    depositCents: number;
    durationMin: number;
    oneOff: boolean;
  }
): Promise<FlashItem> {
  const { data, error } = await supabase
    .from("flash_items")
    .insert({
      artist_id: artistId,
      title: input.title,
      image_url: input.imageUrl,
      price_cents: input.priceCents,
      deposit_cents: input.depositCents,
      duration_min: input.durationMin,
      one_off: input.oneOff,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to add flash: ${error.message}`);
  return mapDbFlashItem(data as DbFlashItem);
}

export async function setFlashItemActive(
  supabase: SupabaseClient,
  id: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase.from("flash_items").update({ active }).eq("id", id);
  if (error) throw new Error(`Failed to update flash: ${error.message}`);
}

export async function deleteFlashItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("flash_items").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete flash: ${error.message}`);
}

export async function fetchArtistUpcomingAppointments(
  supabase: SupabaseClient,
  artistId: string,
  limit = 5
): Promise<AppointmentRecord[]> {
  const { data } = await supabase
    .from("appointments")
    .select(REQUEST_SELECT)
    .eq("artist_id", artistId)
    .in("status", ["pending_deposit", "confirmed"])
    .gte("end_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(limit);
  return ((data ?? []) as DbAppointment[]).map(mapDbAppointment);
}

// ─── Phase 5: roster, grants, projects ────────────────────────────────────

/** Active appointments across a studio's roster + its own walk-ins, next-up first. */
export async function fetchRosterAppointments(
  supabase: SupabaseClient,
  studioId: string,
  artistIds: string[]
): Promise<AppointmentRecord[]> {
  let query = supabase
    .from("appointments")
    .select(REQUEST_SELECT)
    .in("status", ["pending_deposit", "confirmed"])
    .gte("end_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(30);
  query =
    artistIds.length > 0
      ? query.or(`artist_id.in.(${artistIds.join(",")}),studio_id.eq.${studioId}`)
      : query.eq("studio_id", studioId);
  const { data } = await query;
  return ((data ?? []) as DbAppointment[]).map(mapDbAppointment);
}

/** The artist's active affiliations with their front-desk grant state. */
export async function fetchOwnGrantRows(
  supabase: SupabaseClient,
  artistId: string
): Promise<{ id: string; manageBookings: boolean; studioName: string }[]> {
  const { data } = await supabase
    .from("affiliations")
    .select("id, manage_bookings, studios(name)")
    .eq("artist_id", artistId)
    .eq("status", "active");
  const rows = (data ?? []) as unknown as {
    id: string;
    manage_bookings: boolean;
    studios: { name: string } | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    manageBookings: r.manage_bookings,
    studioName: r.studios?.name ?? "Studio",
  }));
}

export async function setManageBookings(
  supabase: SupabaseClient,
  affiliationId: string,
  value: boolean
): Promise<void> {
  const { error } = await supabase
    .from("affiliations")
    .update({ manage_bookings: value })
    .eq("id", affiliationId);
  if (error) throw new Error(`Failed to update front-desk grant: ${error.message}`);
}

export async function fetchProjectByRequest(
  supabase: SupabaseClient,
  requestId: string
): Promise<ProjectRecord | null> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();
  return data ? mapDbProject(data as DbProject) : null;
}

/** Non-cancelled sessions booked against a request (multi-session progress). */
export async function countRequestSessions(
  supabase: SupabaseClient,
  requestId: string
): Promise<number> {
  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("request_id", requestId)
    .in("status", ["pending_deposit", "confirmed", "completed"]);
  return count ?? 0;
}
