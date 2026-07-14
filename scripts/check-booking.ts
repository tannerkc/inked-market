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

console.log(`\n${passed} checks passed`);
