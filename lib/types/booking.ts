// Booking domain types (phase 1: settings + availability only).
// Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md
// Request/appointment/project types land in phase 2 alongside their flows.
// NOTE: lib/types/index.ts has legacy mock-era Appointment/BookingRequest
// shapes for the customer dashboard; they migrate here in phase 2.

/** A bookable target: exactly one of artist or studio for settings/availability. */
export interface BookingEntityRef {
  artistId?: string;
  studioId?: string;
}

export type ConsultLocation = "in_person" | "virtual";
export type PaymentProvider = "stripe" | "square";
export type SlotGranularity = 15 | 30 | 60;

export interface BookingSettings {
  id: string;
  artistId?: string;
  studioId?: string;
  acceptingBookings: boolean;
  customRequestsEnabled: boolean;
  consultationsEnabled: boolean;
  flashEnabled: boolean;
  walkInsEnabled: boolean;
  consultDurationMin: number;
  consultPriceCents: number;
  consultLocation: ConsultLocation;
  defaultDepositCents: number;
  paymentProvider: PaymentProvider | null;
  slotGranularityMin: SlotGranularity;
  bufferMin: number;
  minNoticeHours: number;
  maxHorizonDays: number;
  timezone: string;
  cancellationPolicyText: string | null;
  cancellationWindowHours: number;
}

/** Editable fields (no identity) — what the settings form manipulates. */
export type BookingSettingsInput = Omit<BookingSettings, "id" | "artistId" | "studioId">;

/** Mirrors migration 019 column defaults exactly. */
export const DEFAULT_BOOKING_SETTINGS: BookingSettingsInput = {
  acceptingBookings: true,
  customRequestsEnabled: true,
  consultationsEnabled: false,
  flashEnabled: false,
  walkInsEnabled: false,
  consultDurationMin: 30,
  consultPriceCents: 0,
  consultLocation: "in_person",
  defaultDepositCents: 0,
  paymentProvider: null,
  slotGranularityMin: 30,
  bufferMin: 0,
  minNoticeHours: 24,
  maxHorizonDays: 60,
  timezone: "America/New_York",
  cancellationPolicyText: null,
  cancellationWindowHours: 48,
};

/** One weekly-template window. startHm/endHm are 24h "HH:MM". */
export interface AvailabilityRule {
  id: string;
  weekday: number; // 0 = Sunday .. 6 = Saturday (matches Date.getUTCDay)
  startHm: string;
  endHm: string;
}

/** Date-specific exception. closed=true blocks the day; otherwise startHm/endHm replace the weekly template. */
export interface AvailabilityOverride {
  id: string;
  date: string; // "YYYY-MM-DD" in the entity's timezone
  closed: boolean;
  startHm: string | null;
  endHm: string | null;
  source: string; // 'manual' now; 'gcal' etc. later
}

// ─── Phase 2: requests + appointments ─────────────────────────────────────

export type RequestStatus = "pending" | "accepted" | "declined" | "withdrawn" | "expired";
export type SchedulingMode = "propose" | "open_calendar";
export type AppointmentType = "consultation" | "flash" | "session" | "walk_in";
export type AppointmentLifecycleStatus =
  | "pending_deposit"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type DepositStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "waived"
  | "refund_due"
  | "refunded";

export interface ProposedTime {
  startAt: string; // ISO UTC
  endAt: string;
}

export interface BookingRequestRecord {
  id: string;
  customerId: string;
  customerName: string | null;
  artistId?: string;
  studioId?: string;
  artistName?: string;
  studioName?: string;
  description: string;
  placement: string | null;
  sizeCategory: string | null;
  budgetRange: string | null;
  isColor: boolean | null;
  referenceImageUrls: string[];
  preferredTiming: string | null;
  flexibleDates: boolean;
  isMultiSession: boolean;
  estimatedSessions: number | null;
  status: RequestStatus;
  expiresAt: string;
  responseMessage: string | null;
  quoteMinCents: number | null;
  quoteMaxCents: number | null;
  depositCents: number | null;
  schedulingMode: SchedulingMode | null;
  sessionDurationMin: number | null;
  proposedTimes: ProposedTime[];
  createdAt: string;
}

export interface AppointmentRecord {
  id: string;
  customerId: string | null;
  customerName: string | null;
  artistId?: string;
  studioId?: string;
  artistName?: string;
  studioName?: string;
  requestId: string | null;
  type: AppointmentType;
  startAt: string;
  endAt: string;
  timezone: string;
  status: AppointmentLifecycleStatus;
  priceCents: number | null;
  depositCents: number;
  depositStatus: DepositStatus;
  notes: string | null;
  customerNotes: string | null;
}
