/**
 * Assert-based self-checks for the booking foundation.
 * Run: npx tsx scripts/check-booking.ts
 * No test framework by design — matches scripts/check-builder.ts.
 */
import assert from "node:assert/strict";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

// ─── time.ts ─────────────────────────────────────────────────────────────
import { hm12ToHm, hmToHm12 } from "../lib/booking/time";

check("hm12ToHm converts 12h to 24h", () => {
  assert.equal(hm12ToHm("10:00 AM"), "10:00");
  assert.equal(hm12ToHm("2:30 PM"), "14:30");
  assert.equal(hm12ToHm("12:00 AM"), "00:00");
  assert.equal(hm12ToHm("12:00 PM"), "12:00");
  assert.throws(() => hm12ToHm("25:00"));
});

check("hmToHm12 converts 24h to 12h", () => {
  assert.equal(hmToHm12("10:00"), "10:00 AM");
  assert.equal(hmToHm12("14:30"), "2:30 PM");
  assert.equal(hmToHm12("00:00"), "12:00 AM");
  assert.equal(hmToHm12("12:00"), "12:00 PM");
});

// ─── tz.ts ───────────────────────────────────────────────────────────────
import { zonedTimeToUtc, zonedParts } from "../lib/booking/tz";

check("zonedTimeToUtc: EDT is UTC-4, EST is UTC-5", () => {
  assert.equal(
    zonedTimeToUtc("2026-07-14", "09:00", "America/New_York").toISOString(),
    "2026-07-14T13:00:00.000Z"
  );
  assert.equal(
    zonedTimeToUtc("2026-01-14", "09:00", "America/New_York").toISOString(),
    "2026-01-14T14:00:00.000Z"
  );
});

check("zonedTimeToUtc: DST spring-forward day (2026-03-08) resolves post-2am to EDT", () => {
  // 09:00 local on the spring-forward day is EDT (UTC-4).
  assert.equal(
    zonedTimeToUtc("2026-03-08", "09:00", "America/New_York").toISOString(),
    "2026-03-08T13:00:00.000Z"
  );
  // 01:00 is still EST (UTC-5).
  assert.equal(
    zonedTimeToUtc("2026-03-08", "01:00", "America/New_York").toISOString(),
    "2026-03-08T06:00:00.000Z"
  );
});

check("zonedTimeToUtc: DST fall-back day (2026-11-01) post-2am is EST", () => {
  assert.equal(
    zonedTimeToUtc("2026-11-01", "09:00", "America/New_York").toISOString(),
    "2026-11-01T14:00:00.000Z"
  );
});

check("zonedParts round-trips", () => {
  const d = zonedTimeToUtc("2026-07-14", "09:30", "America/Los_Angeles");
  const p = zonedParts(d, "America/Los_Angeles");
  assert.deepEqual(
    { y: p.year, mo: p.month, d: p.day, h: p.hour, mi: p.minute },
    { y: 2026, mo: 7, d: 14, h: 9, mi: 30 }
  );
});

// ─── availability.ts ─────────────────────────────────────────────────────
import {
  computeOpenSlots,
  subtractIntervals,
  eachDate,
  type ComputeSlotsInput,
} from "../lib/booking/availability";

const NY = "America/New_York";
/** Tue 2026-07-14, 9:00-17:00 NY, 60-min slots, zero friction. */
function baseInput(): ComputeSlotsInput {
  return {
    rules: [{ weekday: 2, startHm: "09:00", endHm: "17:00" }],
    overrides: [],
    busy: [],
    settings: {
      timezone: NY,
      slotGranularityMin: 60,
      bufferMin: 0,
      minNoticeHours: 0,
      maxHorizonDays: 365,
    },
    durationMin: 60,
    fromDate: "2026-07-14",
    toDate: "2026-07-14",
    now: new Date("2026-07-01T00:00:00Z"),
  };
}

check("full open day yields hourly slots 9-5", () => {
  const slots = computeOpenSlots(baseInput());
  assert.equal(slots.length, 8);
  assert.equal(slots[0]!.startAt, "2026-07-14T13:00:00.000Z"); // 9am EDT
  assert.equal(slots[7]!.startAt, "2026-07-14T20:00:00.000Z"); // 4pm EDT
});

check("busy block with buffer removes overlapping and adjacent slots", () => {
  const input = baseInput();
  input.settings.bufferMin = 30;
  // 12:00-13:00 EDT busy; +-30min buffer blocks 11:00 and 13:00 starts too
  input.busy = [{ startAt: "2026-07-14T16:00:00.000Z", endAt: "2026-07-14T17:00:00.000Z" }];
  const starts = computeOpenSlots(input).map((s) => s.startAt);
  assert.ok(!starts.includes("2026-07-14T15:00:00.000Z")); // 11am: ends 12pm, hits front buffer
  assert.ok(!starts.includes("2026-07-14T16:00:00.000Z")); // noon: busy
  assert.ok(!starts.includes("2026-07-14T17:00:00.000Z")); // 1pm: rear buffer
  assert.ok(starts.includes("2026-07-14T18:00:00.000Z")); // 2pm: clear
});

check("slots align to window start, not to busy-block edges", () => {
  const input = baseInput();
  // busy 9:00-9:47 EDT; next slot must be 10:00, not 9:47
  input.busy = [{ startAt: "2026-07-14T13:00:00.000Z", endAt: "2026-07-14T13:47:00.000Z" }];
  const starts = computeOpenSlots(input).map((s) => s.startAt);
  assert.equal(starts[0], "2026-07-14T14:00:00.000Z");
});

check("closed override kills the day; hours override replaces template", () => {
  const closed = baseInput();
  closed.overrides = [{ date: "2026-07-14", closed: true }];
  assert.equal(computeOpenSlots(closed).length, 0);

  const custom = baseInput();
  custom.overrides = [{ date: "2026-07-14", closed: false, startHm: "12:00", endHm: "14:00" }];
  const starts = computeOpenSlots(custom).map((s) => s.startAt);
  assert.deepEqual(starts, ["2026-07-14T16:00:00.000Z", "2026-07-14T17:00:00.000Z"]);
});

check("min notice trims near slots; horizon trims far slots", () => {
  const input = baseInput();
  input.now = new Date("2026-07-14T14:30:00.000Z"); // 10:30am EDT same day
  input.settings.minNoticeHours = 2;
  const starts = computeOpenSlots(input).map((s) => s.startAt);
  assert.equal(starts[0], "2026-07-14T17:00:00.000Z"); // first >= 12:30pm EDT aligned = 1pm

  const far = baseInput();
  far.now = new Date("2026-07-10T00:00:00Z");
  far.settings.maxHorizonDays = 2; // horizon ends 2026-07-12, before the Tuesday
  assert.equal(computeOpenSlots(far).length, 0);
});

check("duration must fit inside the free interval", () => {
  const input = baseInput();
  input.durationMin = 180;
  const slots = computeOpenSlots(input);
  // 9-5 = 8h; 3h piece on 60-min grid: last start 2pm
  assert.equal(slots[slots.length - 1]!.startAt, "2026-07-14T18:00:00.000Z");
});

check("DST spring-forward day computes real UTC window", () => {
  const input = baseInput();
  input.rules = [{ weekday: 0, startHm: "09:00", endHm: "12:00" }]; // Sunday
  input.fromDate = "2026-03-08";
  input.toDate = "2026-03-08";
  input.now = new Date("2026-03-01T00:00:00Z"); // baseInput's July now is after March 8
  const slots = computeOpenSlots(input);
  assert.equal(slots[0]!.startAt, "2026-03-08T13:00:00.000Z"); // 9am EDT (post spring-forward)
  assert.equal(slots.length, 3);
});

check("split shifts produce two distinct blocks", () => {
  const input = baseInput();
  input.rules = [
    { weekday: 2, startHm: "09:00", endHm: "12:00" },
    { weekday: 2, startHm: "14:00", endHm: "17:00" },
  ];
  const starts = computeOpenSlots(input).map((s) => s.startAt);
  assert.equal(starts.length, 6);
  assert.ok(!starts.includes("2026-07-14T16:00:00.000Z")); // noon EDT
  assert.ok(!starts.includes("2026-07-14T17:00:00.000Z")); // 1pm EDT
});

check("subtractIntervals handles containment, overlap, and no-op", () => {
  const win = [{ startMs: 100, endMs: 200 }];
  assert.deepEqual(subtractIntervals(win, [{ startMs: 0, endMs: 300 }]), []);
  assert.deepEqual(subtractIntervals(win, [{ startMs: 150, endMs: 160 }]), [
    { startMs: 100, endMs: 150 },
    { startMs: 160, endMs: 200 },
  ]);
  assert.deepEqual(subtractIntervals(win, [{ startMs: 300, endMs: 400 }]), win);
});

check("eachDate is inclusive on both ends", () => {
  assert.deepEqual(eachDate("2026-01-30", "2026-02-01"), ["2026-01-30", "2026-01-31", "2026-02-01"]);
});

// ─── booking-types.ts mappers ────────────────────────────────────────────
import {
  mapDbBookingSettings,
  mapBookingSettingsToDb,
  rulesToWeekly,
  weeklyToRules,
  DAY_NAMES,
  type DbBookingSettings,
} from "../lib/supabase/booking-types";
import { getDefaultAvailability } from "../lib/data/dashboard";

const DB_SETTINGS: DbBookingSettings = {
  id: "s1", artist_id: "a1", studio_id: null,
  booking_mode: "inbuilt", external_booking_url: null,
  accepting_bookings: true, custom_requests_enabled: true,
  consultations_enabled: false, flash_enabled: false, walk_ins_enabled: false,
  consult_duration_min: 30, consult_price_cents: 0, consult_location: "in_person",
  default_deposit_cents: 5000, payment_provider: null,
  slot_granularity_min: 30, buffer_min: 15, min_notice_hours: 24, max_horizon_days: 60,
  timezone: "America/New_York", cancellation_policy_text: null, cancellation_window_hours: 48,
  created_at: "2026-07-14", updated_at: "2026-07-14",
};

check("settings map db->domain->db", () => {
  const s = mapDbBookingSettings(DB_SETTINGS);
  assert.equal(s.artistId, "a1");
  assert.equal(s.studioId, undefined);
  assert.equal(s.defaultDepositCents, 5000);
  assert.equal(s.bufferMin, 15);
  const back = mapBookingSettingsToDb({ bufferMin: 20, acceptingBookings: false });
  assert.deepEqual(back, { buffer_min: 20, accepting_bookings: false });
});

check("weeklyToRules emits 24h windows only for enabled days", () => {
  const weekly = getDefaultAvailability();
  const monday = DAY_NAMES[1]!;
  for (const day of DAY_NAMES) {
    const d = weekly[day];
    if (d) weekly[day] = { ...d, enabled: day === monday };
  }
  weekly[monday] = { enabled: true, slots: [{ start: "10:00 AM", end: "6:00 PM" }] };
  const rules = weeklyToRules(weekly);
  assert.deepEqual(rules, [{ weekday: 1, startHm: "10:00", endHm: "18:00" }]);
});

check("rulesToWeekly enables days with rows, disables the rest", () => {
  const base = getDefaultAvailability();
  const weekly = rulesToWeekly(
    [{ id: "r1", weekday: 2, startHm: "09:00", endHm: "17:00" }],
    base
  );
  const tuesday = DAY_NAMES[2]!;
  assert.equal(weekly[tuesday]!.enabled, true);
  assert.deepEqual(weekly[tuesday]!.slots, [{ start: "9:00 AM", end: "5:00 PM" }]);
  const monday = DAY_NAMES[1]!;
  assert.equal(weekly[monday]!.enabled, false);
});

// ─── validation schemas ──────────────────────────────────────────────────
import {
  SubmitBookingRequestSchema,
  RespondToRequestSchema,
  SlotsQuerySchema,
} from "../lib/validation/schemas";

check("SubmitBookingRequestSchema accepts a valid brief, rejects a thin one", () => {
  const ok = SubmitBookingRequestSchema.safeParse({
    artistId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff",
    description: "Half sleeve, japanese style dragon wrapping the forearm",
    color: "black-grey",
  });
  assert.ok(ok.success);
  assert.equal(ok.data.flexibleDates, true);
  const thin = SubmitBookingRequestSchema.safeParse({
    artistId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff",
    description: "dragon",
  });
  assert.ok(!thin.success);
});

check("RespondToRequestSchema enforces propose-times, duration, and quote order", () => {
  const base = {
    action: "accept" as const,
    requestId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff",
  };
  assert.ok(
    !RespondToRequestSchema.safeParse({ ...base, schedulingMode: "propose", proposedTimes: [] }).success
  );
  assert.ok(!RespondToRequestSchema.safeParse({ ...base, schedulingMode: "open_calendar" }).success);
  assert.ok(
    !RespondToRequestSchema.safeParse({
      ...base,
      schedulingMode: "open_calendar",
      sessionDurationMin: 180,
      quoteMinCents: 90_000,
      quoteMaxCents: 50_000,
    }).success
  );
  assert.ok(
    RespondToRequestSchema.safeParse({
      ...base,
      schedulingMode: "propose",
      proposedTimes: [{ startAt: "2026-08-01T17:00:00Z", endAt: "2026-08-01T20:00:00Z" }],
    }).success
  );
});

check("SlotsQuerySchema bounds the range", () => {
  const q = { artistId: "6f9619ff-8b86-4d01-b42d-00c04fc964ff", durationMin: "60" };
  assert.ok(SlotsQuerySchema.safeParse({ ...q, from: "2026-08-01", to: "2026-08-31" }).success);
  assert.ok(!SlotsQuerySchema.safeParse({ ...q, from: "2026-08-01", to: "2026-12-01" }).success);
  assert.ok(!SlotsQuerySchema.safeParse({ ...q, from: "2026-08-02", to: "2026-08-01" }).success);
});

// ─── scheduling.ts ───────────────────────────────────────────────────────
import { validateChosenTime } from "../lib/booking/scheduling";

const CHOSEN = { startAt: "2026-08-01T17:00:00.000Z", endAt: "2026-08-01T20:00:00.000Z" };
const SCHED_NOW = new Date("2026-07-14T00:00:00Z");

check("validateChosenTime: propose mode accepts exact match only", () => {
  const proposed = [CHOSEN, { startAt: "2026-08-02T17:00:00.000Z", endAt: "2026-08-02T20:00:00.000Z" }];
  assert.ok(
    validateChosenTime({ mode: "propose", proposedTimes: proposed, openSlots: [], chosen: CHOSEN, now: SCHED_NOW }).ok
  );
  const shifted = { startAt: "2026-08-01T17:30:00.000Z", endAt: "2026-08-01T20:30:00.000Z" };
  assert.ok(
    !validateChosenTime({ mode: "propose", proposedTimes: proposed, openSlots: [], chosen: shifted, now: SCHED_NOW }).ok
  );
});

check("validateChosenTime: rejects past and inverted times", () => {
  const past = { startAt: "2026-07-01T17:00:00.000Z", endAt: "2026-07-01T20:00:00.000Z" };
  assert.ok(
    !validateChosenTime({ mode: "propose", proposedTimes: [past], openSlots: [], chosen: past, now: SCHED_NOW }).ok
  );
  const inverted = { startAt: "2026-08-01T20:00:00.000Z", endAt: "2026-08-01T17:00:00.000Z" };
  assert.ok(
    !validateChosenTime({ mode: "propose", proposedTimes: [inverted], openSlots: [], chosen: inverted, now: SCHED_NOW }).ok
  );
});

check("validateChosenTime: open calendar requires slot membership", () => {
  assert.ok(
    validateChosenTime({ mode: "open_calendar", proposedTimes: [], openSlots: [CHOSEN], chosen: CHOSEN, now: SCHED_NOW }).ok
  );
  assert.ok(
    !validateChosenTime({ mode: "open_calendar", proposedTimes: [], openSlots: [], chosen: CHOSEN, now: SCHED_NOW }).ok
  );
});

// ─── request/appointment mappers ─────────────────────────────────────────
import {
  mapDbBookingRequest,
  mapDbAppointment,
  requestToViewModel,
  appointmentToViewModel,
  effectiveRequestStatus,
  type DbBookingRequest,
  type DbAppointment,
} from "../lib/supabase/booking-types";

const DB_REQUEST: DbBookingRequest = {
  id: "r1", customer_id: "u1", customer_name: "Jess", artist_id: "a1", studio_id: null,
  type: "custom", description: "Fine-line floral piece on the right shoulder blade",
  placement: "shoulder", size_category: "medium", budget_range: "600-1200", is_color: false,
  reference_image_urls: ["https://x/1.webp"], preferred_timing: "weekends", flexible_dates: true,
  is_multi_session: false, estimated_sessions: null,
  status: "pending", expires_at: "2026-07-28T00:00:00Z",
  response_message: null, quote_min_cents: null, quote_max_cents: null, deposit_cents: null,
  scheduling_mode: null, session_duration_min: null, proposed_times: null, conversation_id: null,
  created_at: "2026-07-14T00:00:00Z", updated_at: "2026-07-14T00:00:00Z",
  artists: { name: "Mar Delgado" }, studios: null,
};

check("booking request maps db->domain with embedded names", () => {
  const r = mapDbBookingRequest(DB_REQUEST);
  assert.equal(r.artistId, "a1");
  assert.equal(r.artistName, "Mar Delgado");
  assert.equal(r.isColor, false);
  assert.deepEqual(r.proposedTimes, []);
});

check("effectiveRequestStatus applies lazy expiry", () => {
  const base = { status: "pending" as const, expiresAt: "2026-07-28T00:00:00Z" };
  assert.equal(effectiveRequestStatus(base, new Date("2026-07-20T00:00:00Z")), "pending");
  assert.equal(effectiveRequestStatus(base, new Date("2026-08-01T00:00:00Z")), "expired");
  assert.equal(
    effectiveRequestStatus(
      { status: "accepted", expiresAt: "2026-07-28T00:00:00Z" },
      new Date("2026-08-01T00:00:00Z")
    ),
    "accepted"
  );
});

check("request view model summarizes for the legacy section", () => {
  const vm = requestToViewModel(mapDbBookingRequest(DB_REQUEST));
  assert.equal(vm.artistName, "Mar Delgado");
  assert.equal(vm.status, "pending");
  assert.ok(vm.summary.includes("Fine-line floral"));
});

const DB_APPT: DbAppointment = {
  id: "ap1", customer_id: "u1", customer_name: null, artist_id: "a1", studio_id: null,
  request_id: "r1", project_id: null, flash_item_id: null, type: "session",
  start_at: "2026-08-01T17:00:00Z", end_at: "2026-08-01T20:00:00Z", timezone: "America/New_York",
  status: "confirmed", cancelled_by: null, cancellation_reason: null,
  price_cents: 90000, deposit_cents: 10000, deposit_status: "not_required",
  deposit_provider: null, deposit_checkout_id: null, deposit_checkout_url: null,
  deposit_paid_at: null, hold_expires_at: null,
  notes: null, customer_notes: null, created_at: "2026-07-14", updated_at: "2026-07-14",
  artists: { name: "Mar Delgado" }, studios: null,
};

check("appointment maps to legacy view model with duration minutes", () => {
  const vm = appointmentToViewModel(mapDbAppointment(DB_APPT));
  assert.equal(vm.duration, 180);
  assert.equal(vm.status, "confirmed");
  assert.equal(vm.artistName, "Mar Delgado");
  assert.ok(vm.date instanceof Date);
});

// ─── phase 3: flash + flows ──────────────────────────────────────────────
import { BookConsultationSchema, BookFlashSchema } from "../lib/validation/schemas";
import { enabledBookingFlows } from "../lib/booking/flows";
import { mapDbFlashItem, type DbFlashItem } from "../lib/supabase/booking-types";

check("direct-booking schemas validate ids and datetimes", () => {
  const uuid = "6f9619ff-8b86-4d01-b42d-00c04fc964ff";
  const times = { startAt: "2026-08-01T17:00:00Z", endAt: "2026-08-01T17:30:00Z" };
  assert.ok(BookConsultationSchema.safeParse({ artistId: uuid, ...times }).success);
  assert.ok(!BookConsultationSchema.safeParse({ artistId: "nope", ...times }).success);
  assert.ok(BookFlashSchema.safeParse({ flashItemId: uuid, ...times }).success);
  assert.ok(
    !BookFlashSchema.safeParse({ flashItemId: uuid, startAt: "tomorrow", endAt: times.endAt }).success
  );
});

check("enabledBookingFlows respects master switch and per-flow toggles", () => {
  const base = {
    acceptingBookings: true,
    customRequestsEnabled: true,
    consultationsEnabled: false,
    flashEnabled: true,
  };
  assert.deepEqual(enabledBookingFlows(base), ["custom", "flash"]);
  assert.deepEqual(enabledBookingFlows({ ...base, acceptingBookings: false }), []);
  assert.deepEqual(
    enabledBookingFlows({ ...base, consultationsEnabled: true, customRequestsEnabled: false }),
    ["consultation", "flash"]
  );
});

const DB_FLASH: DbFlashItem = {
  id: "f1", artist_id: "a1", title: "Snake and dagger", image_url: "https://x/f.webp",
  price_cents: 25000, deposit_cents: 5000, duration_min: 120,
  active: true, one_off: true, created_at: "2026-07-14", updated_at: "2026-07-14",
};

check("flash item maps db->domain", () => {
  const f = mapDbFlashItem(DB_FLASH);
  assert.equal(f.artistId, "a1");
  assert.equal(f.priceCents, 25000);
  assert.equal(f.oneOff, true);
});

// ─── phase 4: deposits ───────────────────────────────────────────────────
import { createHmac } from "node:crypto";
import { verifyStripeSignature, verifySquareSignature } from "../lib/booking/deposits/signatures";
import { depositPlanFor } from "../lib/booking/deposits/plan";

check("stripe webhook signature verifies and rejects", () => {
  const secret = "whsec_test";
  const body = '{"id":"evt_1"}';
  const t = 1_800_000_000;
  const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const header = `t=${t},v1=${v1}`;
  assert.ok(verifyStripeSignature(body, header, secret, t + 60));
  assert.ok(!verifyStripeSignature(body, header, secret, t + 600)); // stale
  assert.ok(!verifyStripeSignature(body, `t=${t},v1=deadbeef`, secret, t + 60));
  assert.ok(!verifyStripeSignature(body, null, secret, t + 60));
});

check("square webhook signature verifies and rejects", () => {
  const key = "sq_sig_key";
  const url = "https://example.com/api/webhooks/square";
  const body = '{"event_id":"e1"}';
  const sig = createHmac("sha256", key).update(url + body).digest("base64");
  assert.ok(verifySquareSignature(body, sig, key, url));
  assert.ok(!verifySquareSignature(body, sig, key, "https://example.com/other"));
  assert.ok(!verifySquareSignature(body, null, key, url));
});

check("depositPlanFor picks provider, manual, or none", () => {
  const base = { depositCents: 10000, provider: "stripe" as const, connected: true, configured: true };
  assert.equal(depositPlanFor(base), "provider");
  assert.equal(depositPlanFor({ ...base, depositCents: 0 }), "none");
  assert.equal(depositPlanFor({ ...base, connected: false }), "manual");
  assert.equal(depositPlanFor({ ...base, configured: false }), "manual");
  assert.equal(depositPlanFor({ ...base, provider: null }), "manual");
});

check("appointment mapper carries deposit checkout url", () => {
  const vm = mapDbAppointment({ ...DB_APPT, deposit_checkout_url: "https://pay.example/x" });
  assert.equal(vm.depositCheckoutUrl, "https://pay.example/x");
});

// ─── phase 5: projects + lifecycle ───────────────────────────────────────
import { refundDecision } from "../lib/booking/lifecycle";
import { FrontDeskSchema } from "../lib/validation/schemas";
import { mapDbProject, type DbProject } from "../lib/supabase/booking-types";

check("refundDecision honors payer, policy window, and deposit state", () => {
  const base = {
    depositStatus: "paid" as const,
    startAt: "2026-08-01T17:00:00Z",
    cancellationWindowHours: 48,
  };
  const early = new Date("2026-07-28T17:00:00Z");
  const late = new Date("2026-07-31T12:00:00Z"); // inside 48h window
  assert.equal(refundDecision({ ...base, cancelledBy: "customer", now: early }), "refund_due");
  assert.equal(refundDecision({ ...base, cancelledBy: "customer", now: late }), "forfeit");
  assert.equal(refundDecision({ ...base, cancelledBy: "artist", now: late }), "refund_due");
  assert.equal(refundDecision({ ...base, cancelledBy: "studio", now: late }), "refund_due");
  assert.equal(
    refundDecision({ ...base, depositStatus: "pending", cancelledBy: "customer", now: early }),
    "none"
  );
});

check("FrontDeskSchema enforces target XOR and walk-in typing", () => {
  const uuid = "6f9619ff-8b86-4d01-b42d-00c04fc964ff";
  const base = { customerName: "Sam", startAt: "2026-08-01T17:00:00Z", durationMin: 60 };
  assert.ok(FrontDeskSchema.safeParse({ ...base, artistId: uuid, walkIn: false, type: "session" }).success);
  assert.ok(FrontDeskSchema.safeParse({ ...base, walkIn: true, type: "walk_in" }).success);
  assert.ok(!FrontDeskSchema.safeParse({ ...base, walkIn: false, type: "session" }).success);
  assert.ok(!FrontDeskSchema.safeParse({ ...base, artistId: uuid, walkIn: true, type: "walk_in" }).success);
  assert.ok(!FrontDeskSchema.safeParse({ ...base, artistId: uuid, walkIn: false, type: "walk_in" }).success);
  assert.ok(!FrontDeskSchema.safeParse({ ...base, walkIn: true, type: "session" }).success);
});

const DB_PROJECT: DbProject = {
  id: "p1", request_id: "r1", customer_id: "u1", artist_id: "a1", studio_id: null,
  title: "Dragon half sleeve", status: "active", estimated_sessions: 4, notes: null,
  created_at: "2026-07-14", updated_at: "2026-07-14",
};

check("project maps db->domain", () => {
  const p = mapDbProject(DB_PROJECT);
  assert.equal(p.artistId, "a1");
  assert.equal(p.estimatedSessions, 4);
  assert.equal(p.status, "active");
});

// ─── phase 6: notifications ──────────────────────────────────────────────
import { buildNotification } from "../lib/booking/notify";

check("buildNotification renders human copy per kind", () => {
  assert.ok(buildNotification("request_received", { actorName: "Jess" }).message.includes("Jess"));
  assert.ok(buildNotification("request_accepted", { otherName: "Mar" }).message.includes("Mar"));
  assert.ok(
    buildNotification("appointment_booked", {
      actorName: "Jess",
      apptType: "flash",
      whenIso: "2026-08-01T17:00:00Z",
    }).message.length > 10
  );
  assert.ok(buildNotification("deposit_paid", { actorName: "Jess" }).message.includes("deposit"));
});

// ─── booking mode + CTA resolver ─────────────────────────────────────────
import { bookingCtaFor } from "../lib/booking/flows";
import { SetBookingModeSchema } from "../lib/validation/schemas";

check("bookingCtaFor resolves inbuilt, external, and message", () => {
  const base = {
    bookingMode: "inbuilt" as const,
    acceptingBookings: true,
    customRequestsEnabled: true,
    consultationsEnabled: false,
    flashEnabled: false,
    externalBookingUrl: null,
  };
  assert.deepEqual(bookingCtaFor(base), { kind: "inbuilt" });
  assert.deepEqual(bookingCtaFor({ ...base, acceptingBookings: false }), { kind: "message" });
  assert.deepEqual(bookingCtaFor({ ...base, customRequestsEnabled: false }), { kind: "message" });
  const ext = bookingCtaFor({
    ...base,
    bookingMode: "external",
    externalBookingUrl: "https://calendly.com/mar-ink",
  });
  assert.deepEqual(ext, {
    kind: "external",
    url: "https://calendly.com/mar-ink",
    domain: "calendly.com",
  });
  assert.deepEqual(
    bookingCtaFor({ ...base, bookingMode: "external", externalBookingUrl: null }),
    { kind: "message" }
  );
  assert.deepEqual(bookingCtaFor({ ...base, bookingMode: "off" }), { kind: "message" });
  assert.deepEqual(bookingCtaFor(null), { kind: "message" });
});

check("bookingCtaFor: unchosen mode (null) never shows booking", () => {
  assert.deepEqual(
    bookingCtaFor({
      bookingMode: null,
      acceptingBookings: true,
      customRequestsEnabled: true,
      consultationsEnabled: true,
      flashEnabled: true,
      externalBookingUrl: null,
    }),
    { kind: "message" }
  );
});

check("SetBookingModeSchema requires https url for external", () => {
  assert.ok(SetBookingModeSchema.safeParse({ mode: "inbuilt" }).success);
  assert.ok(SetBookingModeSchema.safeParse({ mode: "off" }).success);
  assert.ok(
    SetBookingModeSchema.safeParse({ mode: "external", externalUrl: "https://squareup.com/book/x" })
      .success
  );
  assert.ok(!SetBookingModeSchema.safeParse({ mode: "external" }).success);
  assert.ok(
    !SetBookingModeSchema.safeParse({ mode: "external", externalUrl: "http://insecure.com" }).success
  );
});

// ─── studio booking targets ──────────────────────────────────────────────
check("SubmitBookingRequestSchema takes artist XOR studio target", () => {
  const uuid = "6f9619ff-8b86-4d01-b42d-00c04fc964ff";
  const brief = { description: "Walk-in friendly studio piece, flexible on artist" };
  assert.ok(SubmitBookingRequestSchema.safeParse({ ...brief, artistId: uuid }).success);
  assert.ok(SubmitBookingRequestSchema.safeParse({ ...brief, studioId: uuid }).success);
  assert.ok(!SubmitBookingRequestSchema.safeParse({ ...brief }).success);
  assert.ok(
    !SubmitBookingRequestSchema.safeParse({ ...brief, artistId: uuid, studioId: uuid }).success
  );
});

check("studio flows exclude flash (flash is artist-anchored)", () => {
  const flows = enabledBookingFlows({
    acceptingBookings: true,
    customRequestsEnabled: true,
    consultationsEnabled: true,
    flashEnabled: true,
  });
  assert.deepEqual(flows, ["custom", "consultation", "flash"]);
  const studioFlows = flows.filter((f) => f !== "flash");
  assert.deepEqual(studioFlows, ["custom", "consultation"]);
});

console.log(`\n${passed} checks passed`);
