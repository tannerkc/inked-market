// Db row shapes + mappers for booking tables (migration 019), following
// the DbStudio/mapDbStudioToStudioData pattern in lib/supabase/types.ts.
import type {
  AvailabilityOverride,
  AvailabilityRule,
  BookingSettings,
  BookingSettingsInput,
  ConsultLocation,
  PaymentProvider,
  SlotGranularity,
} from "@/lib/types/booking";
import type { WeeklyAvailability } from "@/lib/types";
import { hm12ToHm, hmToHm12 } from "@/lib/booking/time";

export interface DbBookingSettings {
  id: string;
  artist_id: string | null;
  studio_id: string | null;
  accepting_bookings: boolean;
  custom_requests_enabled: boolean;
  consultations_enabled: boolean;
  flash_enabled: boolean;
  walk_ins_enabled: boolean;
  consult_duration_min: number;
  consult_price_cents: number;
  consult_location: ConsultLocation;
  default_deposit_cents: number;
  payment_provider: PaymentProvider | null;
  slot_granularity_min: number;
  buffer_min: number;
  min_notice_hours: number;
  max_horizon_days: number;
  timezone: string;
  cancellation_policy_text: string | null;
  cancellation_window_hours: number;
  created_at: string;
  updated_at: string;
}

export interface DbAvailabilityRule {
  id: string;
  artist_id: string | null;
  studio_id: string | null;
  weekday: number;
  start_time: string; // "HH:MM:SS"
  end_time: string;
}

export interface DbAvailabilityOverride {
  id: string;
  artist_id: string | null;
  studio_id: string | null;
  date: string;
  closed: boolean;
  start_time: string | null;
  end_time: string | null;
  source: string;
}

export function mapDbBookingSettings(row: DbBookingSettings): BookingSettings {
  return {
    id: row.id,
    artistId: row.artist_id ?? undefined,
    studioId: row.studio_id ?? undefined,
    acceptingBookings: row.accepting_bookings,
    customRequestsEnabled: row.custom_requests_enabled,
    consultationsEnabled: row.consultations_enabled,
    flashEnabled: row.flash_enabled,
    walkInsEnabled: row.walk_ins_enabled,
    consultDurationMin: row.consult_duration_min,
    consultPriceCents: row.consult_price_cents,
    consultLocation: row.consult_location,
    defaultDepositCents: row.default_deposit_cents,
    paymentProvider: row.payment_provider,
    slotGranularityMin: row.slot_granularity_min as SlotGranularity,
    bufferMin: row.buffer_min,
    minNoticeHours: row.min_notice_hours,
    maxHorizonDays: row.max_horizon_days,
    timezone: row.timezone,
    cancellationPolicyText: row.cancellation_policy_text,
    cancellationWindowHours: row.cancellation_window_hours,
  };
}

const SETTINGS_COLUMN: Record<keyof BookingSettingsInput, string> = {
  acceptingBookings: "accepting_bookings",
  customRequestsEnabled: "custom_requests_enabled",
  consultationsEnabled: "consultations_enabled",
  flashEnabled: "flash_enabled",
  walkInsEnabled: "walk_ins_enabled",
  consultDurationMin: "consult_duration_min",
  consultPriceCents: "consult_price_cents",
  consultLocation: "consult_location",
  defaultDepositCents: "default_deposit_cents",
  paymentProvider: "payment_provider",
  slotGranularityMin: "slot_granularity_min",
  bufferMin: "buffer_min",
  minNoticeHours: "min_notice_hours",
  maxHorizonDays: "max_horizon_days",
  timezone: "timezone",
  cancellationPolicyText: "cancellation_policy_text",
  cancellationWindowHours: "cancellation_window_hours",
};

/** Only defined fields, snake_cased — safe for partial upserts. */
export function mapBookingSettingsToDb(
  input: Partial<BookingSettingsInput>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(SETTINGS_COLUMN)) {
    const value = input[key as keyof BookingSettingsInput];
    if (value !== undefined) out[column] = value;
  }
  return out;
}

const hmFromDb = (t: string) => t.slice(0, 5);

export function mapDbAvailabilityRule(row: DbAvailabilityRule): AvailabilityRule {
  return {
    id: row.id,
    weekday: row.weekday,
    startHm: hmFromDb(row.start_time),
    endHm: hmFromDb(row.end_time),
  };
}

export function mapDbAvailabilityOverride(row: DbAvailabilityOverride): AvailabilityOverride {
  return {
    id: row.id,
    date: row.date,
    closed: row.closed,
    startHm: row.start_time ? hmFromDb(row.start_time) : null,
    endHm: row.end_time ? hmFromDb(row.end_time) : null,
    source: row.source,
  };
}

// ─── WeeklyAvailability (UI, 12h strings, day-name keys) bridge ───────────
// Index = weekday number (0 = Sunday), matching availability_rules.weekday.
// Keys MUST match getDefaultAvailability() in lib/data/dashboard.ts.
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Enabled days' slots become weekly rule rows (24h). */
export function weeklyToRules(
  weekly: WeeklyAvailability
): { weekday: number; startHm: string; endHm: string }[] {
  const rows: { weekday: number; startHm: string; endHm: string }[] = [];
  DAY_NAMES.forEach((day, weekday) => {
    const d = weekly[day];
    if (!d?.enabled) return;
    for (const slot of d.slots) {
      rows.push({ weekday, startHm: hm12ToHm(slot.start), endHm: hm12ToHm(slot.end) });
    }
  });
  return rows;
}

/** Rule rows onto a base weekly shape: days with rows enabled, others disabled. */
export function rulesToWeekly(
  rules: AvailabilityRule[],
  base: WeeklyAvailability
): WeeklyAvailability {
  const out: WeeklyAvailability = {};
  DAY_NAMES.forEach((day, weekday) => {
    const dayRules = rules.filter((r) => r.weekday === weekday);
    const baseDay = base[day] ?? { enabled: false, slots: [] };
    out[day] = dayRules.length
      ? {
          enabled: true,
          slots: dayRules.map((r) => ({ start: hmToHm12(r.startHm), end: hmToHm12(r.endHm) })),
        }
      : { ...baseDay, enabled: false };
  });
  return out;
}
