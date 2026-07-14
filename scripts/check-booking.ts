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
  assert.equal(slots[0].startAt, "2026-07-14T13:00:00.000Z"); // 9am EDT
  assert.equal(slots[7].startAt, "2026-07-14T20:00:00.000Z"); // 4pm EDT
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
  assert.equal(slots[slots.length - 1].startAt, "2026-07-14T18:00:00.000Z");
});

check("DST spring-forward day computes real UTC window", () => {
  const input = baseInput();
  input.rules = [{ weekday: 0, startHm: "09:00", endHm: "12:00" }]; // Sunday
  input.fromDate = "2026-03-08";
  input.toDate = "2026-03-08";
  input.now = new Date("2026-03-01T00:00:00Z"); // baseInput's July now is after March 8
  const slots = computeOpenSlots(input);
  assert.equal(slots[0].startAt, "2026-03-08T13:00:00.000Z"); // 9am EDT (post spring-forward)
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

console.log(`\n${passed} checks passed`);
