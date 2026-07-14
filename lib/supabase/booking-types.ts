// Db row shapes + mappers for booking tables (migration 019), following
// the DbStudio/mapDbStudioToStudioData pattern in lib/supabase/types.ts.
import type {
  AppointmentLifecycleStatus,
  AppointmentRecord,
  AppointmentType,
  AvailabilityOverride,
  AvailabilityRule,
  BookingRequestRecord,
  BookingSettings,
  BookingSettingsInput,
  ConsultLocation,
  DepositStatus,
  FlashItem,
  PaymentProvider,
  ProjectRecord,
  ProjectStatus,
  ProposedTime,
  RequestStatus,
  SchedulingMode,
  SlotGranularity,
} from "@/lib/types/booking";
import type { Appointment, BookingRequest, WeeklyAvailability } from "@/lib/types";
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

// ─── Phase 2: requests + appointments ─────────────────────────────────────

interface EmbeddedName {
  name: string;
}

export interface DbBookingRequest {
  id: string;
  customer_id: string;
  customer_name: string | null;
  artist_id: string | null;
  studio_id: string | null;
  type: string;
  description: string;
  placement: string | null;
  size_category: string | null;
  budget_range: string | null;
  is_color: boolean | null;
  reference_image_urls: string[] | null;
  preferred_timing: string | null;
  flexible_dates: boolean;
  is_multi_session: boolean;
  estimated_sessions: number | null;
  status: RequestStatus;
  expires_at: string;
  response_message: string | null;
  quote_min_cents: number | null;
  quote_max_cents: number | null;
  deposit_cents: number | null;
  scheduling_mode: SchedulingMode | null;
  session_duration_min: number | null;
  proposed_times: ProposedTime[] | null;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
  artists?: EmbeddedName | null;
  studios?: EmbeddedName | null;
}

export interface DbAppointment {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  artist_id: string | null;
  studio_id: string | null;
  request_id: string | null;
  project_id: string | null;
  flash_item_id: string | null;
  type: AppointmentType;
  start_at: string;
  end_at: string;
  timezone: string;
  status: AppointmentLifecycleStatus;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  price_cents: number | null;
  deposit_cents: number;
  deposit_status: DepositStatus;
  deposit_provider: string | null;
  deposit_checkout_id: string | null;
  deposit_checkout_url: string | null;
  deposit_paid_at: string | null;
  hold_expires_at: string | null;
  notes: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
  artists?: EmbeddedName | null;
  studios?: EmbeddedName | null;
}

export function mapDbBookingRequest(row: DbBookingRequest): BookingRequestRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    artistId: row.artist_id ?? undefined,
    studioId: row.studio_id ?? undefined,
    artistName: row.artists?.name,
    studioName: row.studios?.name,
    description: row.description,
    placement: row.placement,
    sizeCategory: row.size_category,
    budgetRange: row.budget_range,
    isColor: row.is_color,
    referenceImageUrls: row.reference_image_urls ?? [],
    preferredTiming: row.preferred_timing,
    flexibleDates: row.flexible_dates,
    isMultiSession: row.is_multi_session,
    estimatedSessions: row.estimated_sessions,
    status: row.status,
    expiresAt: row.expires_at,
    responseMessage: row.response_message,
    quoteMinCents: row.quote_min_cents,
    quoteMaxCents: row.quote_max_cents,
    depositCents: row.deposit_cents,
    schedulingMode: row.scheduling_mode,
    sessionDurationMin: row.session_duration_min,
    proposedTimes: row.proposed_times ?? [],
    createdAt: row.created_at,
  };
}

export function mapDbAppointment(row: DbAppointment): AppointmentRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    artistId: row.artist_id ?? undefined,
    studioId: row.studio_id ?? undefined,
    artistName: row.artists?.name,
    studioName: row.studios?.name,
    requestId: row.request_id,
    type: row.type,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone,
    status: row.status,
    priceCents: row.price_cents,
    depositCents: row.deposit_cents,
    depositStatus: row.deposit_status,
    depositCheckoutUrl: row.deposit_checkout_url,
    notes: row.notes,
    customerNotes: row.customer_notes,
  };
}

export interface DbFlashItem {
  id: string;
  artist_id: string;
  title: string;
  image_url: string;
  price_cents: number;
  deposit_cents: number;
  duration_min: number;
  active: boolean;
  one_off: boolean;
  created_at: string;
  updated_at: string;
}

export function mapDbFlashItem(row: DbFlashItem): FlashItem {
  return {
    id: row.id,
    artistId: row.artist_id,
    title: row.title,
    imageUrl: row.image_url,
    priceCents: row.price_cents,
    depositCents: row.deposit_cents,
    durationMin: row.duration_min,
    active: row.active,
    oneOff: row.one_off,
  };
}

export interface DbProject {
  id: string;
  request_id: string | null;
  customer_id: string | null;
  artist_id: string | null;
  studio_id: string | null;
  title: string;
  status: ProjectStatus;
  estimated_sessions: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function mapDbProject(row: DbProject): ProjectRecord {
  return {
    id: row.id,
    requestId: row.request_id,
    customerId: row.customer_id,
    artistId: row.artist_id ?? undefined,
    title: row.title,
    status: row.status,
    estimatedSessions: row.estimated_sessions,
    notes: row.notes,
  };
}

/** Lazy expiry: a pending request past its window reads as expired between cron runs. */
export function effectiveRequestStatus(
  r: { status: RequestStatus; expiresAt: string },
  now: Date
): RequestStatus {
  if (r.status === "pending" && Date.parse(r.expiresAt) < now.getTime()) return "expired";
  return r.status;
}

// ─── Legacy view-model bridges (customer dashboard sections) ──────────────

export function requestToViewModel(r: BookingRequestRecord): BookingRequest {
  const summary = r.description.length > 140 ? `${r.description.slice(0, 140)}...` : r.description;
  return {
    id: r.id,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.createdAt),
    customerId: r.customerId,
    artistId: r.artistId ?? "",
    artistName: r.artistName ?? "Artist",
    studioId: r.studioId,
    studioName: r.studioName,
    flexibleDates: r.flexibleDates,
    status: effectiveRequestStatus(r, new Date()),
    summary,
  };
}

export function appointmentToViewModel(a: AppointmentRecord): Appointment {
  const legacyStatus =
    a.status === "pending_deposit" ? "pending" : a.status === "no_show" ? "cancelled" : a.status;
  return {
    id: a.id,
    createdAt: new Date(a.startAt),
    updatedAt: new Date(a.startAt),
    customerId: a.customerId ?? "",
    artistId: a.artistId ?? "",
    artistName: a.artistName ?? "Artist",
    studioId: a.studioId,
    studioName: a.studioName,
    date: new Date(a.startAt),
    duration: Math.round((Date.parse(a.endAt) - Date.parse(a.startAt)) / 60_000),
    status: legacyStatus,
  };
}
