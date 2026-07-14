# Booking System Phase 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the booking system foundation: migration `019_booking`, domain types, a pure availability engine with assert-based checks, per-entity booking settings UI, and persisted artist availability.

**Architecture:** Request/Appointment split per the approved spec (`docs/superpowers/specs/2026-07-14-booking-system-design.md`). This phase builds only the substrate: all nine tables + RLS, pure slot computation (`lib/booking/`), Db mappers (`lib/supabase/booking-types.ts`), client data access (`lib/data/supabase-booking.ts`), and dashboard UI for settings + availability. No booking flows yet — those are phases 2-5.

**Tech Stack:** Next.js 16 / React 19 / TypeScript 5, Supabase (Postgres 15+, RLS, client-side writes via `@supabase/ssr` browser client), assert-based checks via `npx tsx`.

## Global Constraints

- Supabase project is `cktvpfenygxhfaodihbz` ONLY. NEVER touch `sqibczeyflarfgtnexne` (Velora — a client's project). Verify before any MCP DB call.
- No emoji anywhere in code. No `Co-Authored-By`/AI attribution in commit messages.
- Do NOT run `npm run dev` or `npm run build` — verification is `npx tsc --noEmit`, `npm run lint`, `npx tsx scripts/check-booking.ts`.
- Server Components by default; `"use client"` only where hooks/events require it.
- Mobile-first Tailwind (scale UP with `sm:`/`lg:`); touch targets ≥ 44px.
- Path alias `@/*` = project root. Every component dir gets a barrel `index.tsx`.
- All timestamps `timestamptz`; DB `time` columns are 24h `"HH:MM:SS"` (mappers slice to `"HH:MM"`); UI slot strings are 12h (`"10:00 AM"`).
- Money is integer cents everywhere.
- No new dependencies.

---

### Task 1: Booking domain types

**Files:**
- Create: `lib/types/booking.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `BookingEntityRef`, `BookingSettings`, `BookingSettingsInput`, `DEFAULT_BOOKING_SETTINGS`, `AvailabilityRule`, `AvailabilityOverride`, `ConsultLocation`, `PaymentProvider`, `SlotGranularity` — imported by Tasks 3, 5, 6, 7, 8 as `@/lib/types/booking`.

**Important:** `lib/types/index.ts` already has mock-era `Appointment`/`BookingRequest` types feeding the customer dashboard. Do NOT touch them and do NOT re-export this module from `lib/types/index.ts` (name collisions arrive in phase 2 when those screens migrate). Import directly from `@/lib/types/booking`.

- [ ] **Step 1: Write the file**

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types/booking.ts
git commit -m "feat(booking): domain types for settings and availability"
```

---

### Task 2: Time and timezone utilities

**Files:**
- Create: `lib/booking/time.ts`
- Create: `lib/booking/tz.ts`
- Create: `scripts/check-booking.ts` (started here, grown in Tasks 3 and 5)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `hm12ToHm(t: string): string` — `"2:30 PM"` → `"14:30"` (throws on malformed input)
  - `hmToHm12(hm: string): string` — `"14:30"` → `"2:30 PM"`
  - `zonedTimeToUtc(dateIso: string, hm: string, timeZone: string): Date` — wall-clock in zone → UTC instant
  - `zonedParts(date: Date, timeZone: string): { year; month; day; hour; minute }` — UTC instant → wall-clock parts

- [ ] **Step 1: Write the failing checks**

Create `scripts/check-booking.ts` (mirrors `scripts/check-builder.ts` style — assert-based, no framework):

```ts
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
```

- [ ] **Step 2: Run checks to verify they fail**

Run: `npx tsx scripts/check-booking.ts`
Expected: FAIL — `Cannot find module '../lib/booking/time'`.

- [ ] **Step 3: Implement `lib/booking/time.ts`**

```ts
/** 12h/24h clock string conversions bridging UI TimeSlot strings and DB time columns. */

export function hm12ToHm(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Invalid 12h time: ${t}`);
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export function hmToHm12(hm: string): string {
  const [h, mi] = hm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mi).padStart(2, "0")} ${period}`;
}
```

- [ ] **Step 4: Implement `lib/booking/tz.ts`**

```ts
/**
 * Minimal IANA timezone math via Intl — no dependency.
 * All booking inputs are whole minutes; precision below one minute is not handled.
 */

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Wall-clock parts of a UTC instant as seen in a zone. */
export function zonedParts(date: Date, timeZone: string) {
  const raw: Record<string, string> = {};
  for (const p of formatterFor(timeZone).formatToParts(date)) {
    if (p.type !== "literal") raw[p.type] = p.value;
  }
  return {
    year: Number(raw.year),
    month: Number(raw.month),
    day: Number(raw.day),
    hour: Number(raw.hour) % 24, // Intl may emit "24" at midnight
    minute: Number(raw.minute),
  };
}

/** Zone offset (ms to ADD to a UTC instant to get wall-clock) at a given instant. */
function offsetAt(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - date.getTime();
}

/**
 * UTC instant for a wall-clock time in a zone. Two-pass offset resolution
 * (the date-fns-tz technique) handles DST transitions; nonexistent local
 * times on spring-forward days resolve to the adjacent valid instant.
 */
export function zonedTimeToUtc(dateIso: string, hm: string, timeZone: string): Date {
  const [y, mo, d] = dateIso.split("-").map(Number);
  const [h, mi] = hm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const first = offsetAt(new Date(guess), timeZone);
  const second = offsetAt(new Date(guess - first), timeZone);
  return new Date(guess - second);
}
```

- [ ] **Step 5: Run checks to verify they pass**

Run: `npx tsx scripts/check-booking.ts`
Expected: all `ok - ...` lines, `6 checks passed`.

- [ ] **Step 6: Commit**

```bash
git add lib/booking/time.ts lib/booking/tz.ts scripts/check-booking.ts
git commit -m "feat(booking): time and timezone utilities with self-checks"
```

---

### Task 3: Availability engine

**Files:**
- Create: `lib/booking/availability.ts`
- Modify: `scripts/check-booking.ts` (append engine checks)

**Interfaces:**
- Consumes: `zonedTimeToUtc` from Task 2.
- Produces (used by phases 2-3 and the slot API):
  - `computeOpenSlots(input: ComputeSlotsInput): Slot[]`
  - `subtractIntervals(windows: Interval[], sortedBusy: Interval[]): Interval[]`
  - `eachDate(fromDate: string, toDate: string): string[]`
  - Types: `EngineRule { weekday; startHm; endHm }`, `EngineOverride { date; closed; startHm?; endHm? }`, `EngineSettings { timezone; slotGranularityMin; bufferMin; minNoticeHours; maxHorizonDays }`, `Interval { startMs; endMs }`, `Slot { startAt; endAt }` (ISO UTC strings), `ComputeSlotsInput { rules; overrides; busy; settings; durationMin; fromDate; toDate; now }`

- [ ] **Step 1: Append failing engine checks to `scripts/check-booking.ts`**

```ts
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
```

- [ ] **Step 2: Run checks to verify the new ones fail**

Run: `npx tsx scripts/check-booking.ts`
Expected: FAIL — `Cannot find module '../lib/booking/availability'`.

- [ ] **Step 3: Implement `lib/booking/availability.ts`**

```ts
/**
 * Pure slot computation — no I/O. The single availability engine behind
 * flash booking, consult booking, and open-calendar custom scheduling.
 * Slots are derived, never stored; the DB exclusion constraint is the lock.
 * Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md
 */
import { zonedTimeToUtc } from "./tz";

export interface EngineRule {
  weekday: number; // 0 = Sunday .. 6 = Saturday
  startHm: string; // 24h "HH:MM" in the entity's timezone
  endHm: string;
}

export interface EngineOverride {
  date: string; // "YYYY-MM-DD"
  closed: boolean;
  startHm?: string | null;
  endHm?: string | null;
}

export interface EngineSettings {
  timezone: string;
  slotGranularityMin: number;
  bufferMin: number;
  minNoticeHours: number;
  maxHorizonDays: number;
}

export interface Interval {
  startMs: number;
  endMs: number;
}

export interface Slot {
  startAt: string; // ISO UTC
  endAt: string;
}

export interface ComputeSlotsInput {
  rules: EngineRule[];
  overrides: EngineOverride[];
  /** Existing active appointments (and, later, external busy blocks). */
  busy: { startAt: string; endAt: string }[];
  settings: EngineSettings;
  durationMin: number;
  fromDate: string; // inclusive, local to settings.timezone
  toDate: string; // inclusive
  now: Date;
}

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Calendar dates from fromDate to toDate, both inclusive. */
export function eachDate(fromDate: string, toDate: string): string[] {
  const out: string[] = [];
  const end = Date.parse(`${toDate}T00:00:00Z`);
  for (let t = Date.parse(`${fromDate}T00:00:00Z`); t <= end; t += DAY) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Working windows for one local date as UTC intervals. Override beats template. */
function windowsForDate(
  date: string,
  rules: EngineRule[],
  overrideByDate: Map<string, EngineOverride>,
  timeZone: string
): Interval[] {
  const o = overrideByDate.get(date);
  let spans: { startHm: string; endHm: string }[];
  if (o) {
    if (o.closed || !o.startHm || !o.endHm) return [];
    spans = [{ startHm: o.startHm, endHm: o.endHm }];
  } else {
    const wd = weekdayOf(date);
    spans = rules.filter((r) => r.weekday === wd);
  }
  return spans
    .map((s) => ({
      startMs: zonedTimeToUtc(date, s.startHm, timeZone).getTime(),
      endMs: zonedTimeToUtc(date, s.endHm, timeZone).getTime(),
    }))
    .filter((w) => w.startMs < w.endMs);
}

/** Windows minus busy intervals. busy MUST be sorted by startMs. */
export function subtractIntervals(windows: Interval[], sortedBusy: Interval[]): Interval[] {
  const out: Interval[] = [];
  for (const w of windows) {
    let cursor = w.startMs;
    for (const b of sortedBusy) {
      if (b.endMs <= cursor || b.startMs >= w.endMs) continue;
      if (b.startMs > cursor) out.push({ startMs: cursor, endMs: b.startMs });
      cursor = Math.max(cursor, b.endMs);
      if (cursor >= w.endMs) break;
    }
    if (cursor < w.endMs) out.push({ startMs: cursor, endMs: w.endMs });
  }
  return out;
}

export function computeOpenSlots(input: ComputeSlotsInput): Slot[] {
  const { rules, overrides, busy, settings, durationMin, fromDate, toDate, now } = input;
  const durMs = durationMin * MIN;
  const stepMs = settings.slotGranularityMin * MIN;
  const padMs = settings.bufferMin * MIN;
  const earliestMs = now.getTime() + settings.minNoticeHours * HOUR;
  const horizonMs = now.getTime() + settings.maxHorizonDays * DAY;

  const overrideByDate = new Map(overrides.map((o) => [o.date, o]));
  const paddedBusy = busy
    .map((b) => ({ startMs: Date.parse(b.startAt) - padMs, endMs: Date.parse(b.endAt) + padMs }))
    .sort((a, b) => a.startMs - b.startMs);

  const slots: Slot[] = [];
  for (const date of eachDate(fromDate, toDate)) {
    for (const w of windowsForDate(date, rules, overrideByDate, settings.timezone)) {
      for (const free of subtractIntervals([w], paddedBusy)) {
        // Slot starts align to the WINDOW start (9:00, 9:30...), never to
        // busy-block edges, and respect min notice.
        const minStart = Math.max(free.startMs, earliestMs);
        const k = Math.max(0, Math.ceil((minStart - w.startMs) / stepMs));
        for (let t = w.startMs + k * stepMs; t + durMs <= free.endMs && t <= horizonMs; t += stepMs) {
          slots.push({
            startAt: new Date(t).toISOString(),
            endAt: new Date(t + durMs).toISOString(),
          });
        }
      }
    }
  }

  // Overlapping rules could duplicate starts; dedupe and order.
  const seen = new Set<string>();
  return slots
    .filter((s) => (seen.has(s.startAt) ? false : (seen.add(s.startAt), true)))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}
```

- [ ] **Step 4: Run checks to verify they pass**

Run: `npx tsx scripts/check-booking.ts`
Expected: all `ok`, `16 checks passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/booking/availability.ts scripts/check-booking.ts
git commit -m "feat(booking): pure availability engine with DST and race-safe semantics"
```

---

### Task 4: Migration 019_booking

**Files:**
- Create: `supabase/migrations/019_booking.sql`

**Interfaces:**
- Consumes: existing `public.artists`, `public.studios`, `public.affiliations`, `public.conversations`, `public.set_updated_at()`.
- Produces: nine tables + four RLS helper functions (`owns_artist`, `owns_studio`, `studio_reads_artist`, `studio_manages_artist`) used by every later phase; `affiliations.manage_bookings` column.

**Notes:**
- pg_cron jobs (request expiry, hold release) are NOT in this migration — they land with the phases that create expiring rows (2 and 4).
- Cascade deletes everywhere per pre-launch latitude. `-- ponytail: cascades are fine pre-launch; revisit retention before real bookings exist.`

- [ ] **Step 1: Write the migration file**

```sql
-- Booking system foundation: settings, availability, requests, appointments,
-- projects, flash, audit events, notifications.
-- Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md
-- pg_cron housekeeping jobs land in later migrations with their flows.

create extension if not exists btree_gist;

-- ─── RLS helpers (invoker rights; RLS on artists/studios/affiliations
--     already lets owners read their own rows) ─────────────────────────────
create or replace function public.owns_artist(aid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.artists a
    where a.id = aid and (a.user_id = auth.uid() or a.claimed_by = auth.uid())
  );
$$;

create or replace function public.owns_studio(sid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.studios s
    where s.id = sid and s.claimed_by = auth.uid()
  );
$$;

-- Studio owner has an active affiliation with this artist (read-only roster).
create or replace function public.studio_reads_artist(aid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.affiliations af
    join public.studios s on s.id = af.studio_id
    where af.artist_id = aid and af.status = 'active' and s.claimed_by = auth.uid()
  );
$$;

-- Artist granted this studio booking-management rights (front desk).
create or replace function public.studio_manages_artist(aid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.affiliations af
    join public.studios s on s.id = af.studio_id
    where af.artist_id = aid and af.status = 'active'
      and af.manage_bookings and s.claimed_by = auth.uid()
  );
$$;

-- Front-desk grant, given by the artist.
alter table public.affiliations
  add column if not exists manage_bookings boolean not null default false;

-- ─── booking_settings: one row per bookable entity (artist XOR studio) ────
create table if not exists public.booking_settings (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid unique references public.artists(id) on delete cascade,
  studio_id uuid unique references public.studios(id) on delete cascade,
  accepting_bookings boolean not null default true,
  custom_requests_enabled boolean not null default true,
  consultations_enabled boolean not null default false,
  flash_enabled boolean not null default false,
  walk_ins_enabled boolean not null default false,
  consult_duration_min int not null default 30,
  consult_price_cents int not null default 0,
  consult_location text not null default 'in_person'
    check (consult_location in ('in_person','virtual')),
  default_deposit_cents int not null default 0,
  payment_provider text check (payment_provider in ('stripe','square')),
  slot_granularity_min int not null default 30 check (slot_granularity_min in (15,30,60)),
  buffer_min int not null default 0 check (buffer_min between 0 and 120),
  min_notice_hours int not null default 24 check (min_notice_hours between 0 and 336),
  max_horizon_days int not null default 60 check (max_horizon_days between 1 and 365),
  timezone text not null default 'America/New_York',
  cancellation_policy_text text,
  cancellation_window_hours int not null default 48,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) = 1)
);
create trigger trg_booking_settings_updated before update on public.booking_settings
  for each row execute function public.set_updated_at();

-- ─── availability: weekly template + date exceptions (artist XOR studio) ──
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) = 1),
  check (start_time < end_time)
);
create index if not exists idx_avail_rules_artist on public.availability_rules(artist_id);
create index if not exists idx_avail_rules_studio on public.availability_rules(studio_id);

create table if not exists public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  date date not null,
  closed boolean not null default true,
  start_time time,
  end_time time,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) = 1),
  check (closed or (start_time is not null and end_time is not null and start_time < end_time)),
  unique nulls not distinct (artist_id, studio_id, date)
);
create index if not exists idx_avail_over_artist on public.availability_overrides(artist_id, date);
create index if not exists idx_avail_over_studio on public.availability_overrides(studio_id, date);

-- ─── flash_items ──────────────────────────────────────────────────────────
create table if not exists public.flash_items (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  image_url text not null,
  price_cents int not null check (price_cents >= 0),
  deposit_cents int not null default 0 check (deposit_cents >= 0),
  duration_min int not null default 60 check (duration_min between 15 and 720),
  active boolean not null default true,
  one_off boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_flash_artist_active on public.flash_items(artist_id) where active;
create trigger trg_flash_items_updated before update on public.flash_items
  for each row execute function public.set_updated_at();

-- ─── booking_requests: custom work asks awaiting artist judgment ──────────
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  type text not null default 'custom' check (type in ('custom')),
  description text not null,
  placement text,
  size_category text,
  budget_range text,
  is_color boolean,
  reference_image_urls jsonb not null default '[]',
  preferred_timing text,
  flexible_dates boolean not null default true,
  is_multi_session boolean not null default false,
  estimated_sessions int,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','withdrawn','expired')),
  expires_at timestamptz not null default now() + interval '14 days',
  response_message text,
  quote_min_cents int,
  quote_max_cents int,
  deposit_cents int,
  scheduling_mode text check (scheduling_mode in ('propose','open_calendar')),
  proposed_times jsonb,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) >= 1)
);
create index if not exists idx_breq_artist_status on public.booking_requests(artist_id, status);
create index if not exists idx_breq_studio_status on public.booking_requests(studio_id, status);
create index if not exists idx_breq_customer on public.booking_requests(customer_id);
create trigger trg_booking_requests_updated before update on public.booking_requests
  for each row execute function public.set_updated_at();

-- ─── projects: multi-session container ────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.booking_requests(id) on delete set null,
  customer_id uuid references auth.users(id) on delete set null,
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  title text not null,
  status text not null default 'active'
    check (status in ('active','completed','cancelled','paused')),
  estimated_sessions int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) >= 1)
);
create index if not exists idx_projects_artist on public.projects(artist_id);
create index if not exists idx_projects_customer on public.projects(customer_id);
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ─── appointments: everything with a concrete time ────────────────────────
-- customer_id nullable + customer_name: front-desk walk-ins may have no account.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text,
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  request_id uuid references public.booking_requests(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  flash_item_id uuid references public.flash_items(id) on delete set null,
  type text not null check (type in ('consultation','flash','session','walk_in')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null,
  status text not null default 'confirmed'
    check (status in ('pending_deposit','confirmed','completed','cancelled','no_show')),
  cancelled_by text check (cancelled_by in ('customer','artist','studio')),
  cancellation_reason text,
  price_cents int,
  deposit_cents int not null default 0,
  deposit_status text not null default 'not_required'
    check (deposit_status in ('not_required','pending','paid','waived','refund_due','refunded')),
  deposit_provider text check (deposit_provider in ('stripe','square','manual')),
  deposit_checkout_id text,
  deposit_paid_at timestamptz,
  hold_expires_at timestamptz,
  notes text,
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_at < end_at),
  check (num_nonnulls(artist_id, studio_id) >= 1),
  check (customer_id is not null or customer_name is not null),
  -- The no-double-booking guarantee: an artist's active appointments can
  -- never overlap, even under concurrent inserts. Studio-only rows (walk-ins)
  -- are exempt — studios run multiple chairs.
  constraint no_artist_overlap exclude using gist (
    artist_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (artist_id is not null and status in ('pending_deposit','confirmed'))
);
create index if not exists idx_appt_artist_start on public.appointments(artist_id, start_at);
create index if not exists idx_appt_studio_start on public.appointments(studio_id, start_at);
create index if not exists idx_appt_customer_start on public.appointments(customer_id, start_at);
create index if not exists idx_appt_active on public.appointments(artist_id, start_at)
  where status in ('pending_deposit','confirmed');
create trigger trg_appointments_updated before update on public.appointments
  for each row execute function public.set_updated_at();

-- ─── booking_events: append-only audit (service-role writes only) ─────────
create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  request_id uuid references public.booking_requests(id) on delete cascade,
  actor_id uuid,
  actor_role text,
  event_type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_bevents_appt on public.booking_events(appointment_id);
create index if not exists idx_bevents_req on public.booking_events(request_id);

-- ─── notifications: in-app bell + future reminder outbox ──────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table public.booking_settings       enable row level security;
alter table public.availability_rules     enable row level security;
alter table public.availability_overrides enable row level security;
alter table public.flash_items            enable row level security;
alter table public.booking_requests       enable row level security;
alter table public.projects               enable row level security;
alter table public.appointments           enable row level security;
alter table public.booking_events         enable row level security;
alter table public.notifications          enable row level security;

-- Settings + availability: public read (booking pages need them), owner writes.
create policy "Public read booking settings" on public.booking_settings
  for select using (true);
create policy "Owner manages booking settings" on public.booking_settings
  for all using (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

create policy "Public read availability rules" on public.availability_rules
  for select using (true);
create policy "Owner manages availability rules" on public.availability_rules
  for all using (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

create policy "Public read availability overrides" on public.availability_overrides
  for select using (true);
create policy "Owner manages availability overrides" on public.availability_overrides
  for all using (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

-- Flash: public read active items; owning artist manages.
create policy "Public read active flash" on public.flash_items
  for select using (active = true or public.owns_artist(artist_id));
create policy "Artist manages flash" on public.flash_items
  for all using (public.owns_artist(artist_id))
  with check (public.owns_artist(artist_id));

-- Requests: parties + roster studios read; customer creates; parties update.
create policy "Parties read requests" on public.booking_requests
  for select using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_reads_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Customer creates request" on public.booking_requests
  for insert to authenticated with check (customer_id = auth.uid());
create policy "Parties update request" on public.booking_requests
  for update using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

-- Projects: same party model as requests.
create policy "Parties read projects" on public.projects
  for select using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_reads_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Providers manage projects" on public.projects
  for all using (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

-- Appointments: parties + roster read; customer books own; providers manage.
create policy "Parties read appointments" on public.appointments
  for select using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_reads_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Customer books appointment" on public.appointments
  for insert to authenticated with check (customer_id = auth.uid());
create policy "Providers manage appointments" on public.appointments
  for all using (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Customer updates own appointment" on public.appointments
  for update using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- Events: parties read; writes are service-role only (no insert/update policies).
create policy "Parties read booking events" on public.booking_events
  for select using (
    (appointment_id is not null and exists (
      select 1 from public.appointments ap where ap.id = appointment_id and (
        ap.customer_id = auth.uid()
        or (ap.artist_id is not null and public.owns_artist(ap.artist_id))
        or (ap.studio_id is not null and public.owns_studio(ap.studio_id))
      )
    ))
    or (request_id is not null and exists (
      select 1 from public.booking_requests br where br.id = request_id and (
        br.customer_id = auth.uid()
        or (br.artist_id is not null and public.owns_artist(br.artist_id))
        or (br.studio_id is not null and public.owns_studio(br.studio_id))
      )
    ))
  );

-- Notifications: user reads/updates own; inserts are service-role only.
create policy "User reads own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "User marks notifications read" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
```

- [ ] **Step 2: Verify target project, then apply**

First confirm the Supabase MCP is pointed at `cktvpfenygxhfaodihbz` (get_project / compare with `.env.local` `NEXT_PUBLIC_SUPABASE_URL`). **Abort if it resolves to `sqibczeyflarfgtnexne` (Velora).**

Apply via Supabase MCP `apply_migration` with name `booking` and the file's SQL.

- [ ] **Step 3: Verify remote schema**

Via MCP `list_tables`: confirm `booking_settings`, `availability_rules`, `availability_overrides`, `flash_items`, `booking_requests`, `projects`, `appointments`, `booking_events`, `notifications` exist and `affiliations` has `manage_bookings`.

Then prove the exclusion constraint works via MCP `execute_sql`:

```sql
-- expect ERROR 23P01 on the second appointment insert; rollback cleans up.
-- Creates its own throwaway artist so the test cannot silently no-op.
begin;
insert into artists (id, name, slug)
values ('00000000-0000-4000-8000-00000000feed', 'Constraint Test', 'constraint-test-feed');
insert into appointments (artist_id, customer_name, type, start_at, end_at, timezone, status)
values ('00000000-0000-4000-8000-00000000feed', 'T1', 'session',
        '2030-01-01T17:00:00Z', '2030-01-01T19:00:00Z', 'America/New_York', 'confirmed');
insert into appointments (artist_id, customer_name, type, start_at, end_at, timezone, status)
values ('00000000-0000-4000-8000-00000000feed', 'T2', 'session',
        '2030-01-01T18:00:00Z', '2030-01-01T20:00:00Z', 'America/New_York', 'confirmed');
rollback;
```

(The `begin;` block errors out at the second insert — run `rollback;` afterwards if the tool left the transaction open.)

Expected: second insert fails with `conflicting key value violates exclusion constraint "no_artist_overlap"`; rollback leaves no rows.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/019_booking.sql
git commit -m "feat(booking): migration 019 - settings, availability, requests, appointments, projects, flash, events, notifications"
```

---

### Task 5: Db row types, mappers, and the WeeklyAvailability bridge

**Files:**
- Create: `lib/supabase/booking-types.ts`
- Modify: `scripts/check-booking.ts` (append mapper checks)

**Interfaces:**
- Consumes: Task 1 types; `WeeklyAvailability`/`TimeSlot` from `@/lib/types`; `hm12ToHm`/`hmToHm12` from Task 2; `getDefaultAvailability` from `@/lib/data/dashboard`.
- Produces (used by Task 6):
  - `DbBookingSettings`, `DbAvailabilityRule`, `DbAvailabilityOverride` row interfaces
  - `mapDbBookingSettings(row: DbBookingSettings): BookingSettings`
  - `mapBookingSettingsToDb(input: Partial<BookingSettingsInput>): Record<string, unknown>`
  - `mapDbAvailabilityRule(row: DbAvailabilityRule): AvailabilityRule`
  - `mapDbAvailabilityOverride(row: DbAvailabilityOverride): AvailabilityOverride`
  - `DAY_NAMES: string[]` (index = weekday number)
  - `rulesToWeekly(rules: AvailabilityRule[], base: WeeklyAvailability): WeeklyAvailability`
  - `weeklyToRules(weekly: WeeklyAvailability): { weekday: number; startHm: string; endHm: string }[]`

**Before writing:** open `lib/data/dashboard.ts:128` (`getDefaultAvailability`) and confirm the day-key strings. This plan assumes full names `"Monday"..."Sunday"`; if the file uses different keys (e.g. `"Mon"`), set `DAY_NAMES` to match the file — the UI's keys are the contract.

- [ ] **Step 1: Append failing mapper checks to `scripts/check-booking.ts`**

```ts
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
  const monday = DAY_NAMES[1];
  for (const day of DAY_NAMES) {
    if (weekly[day]) weekly[day] = { ...weekly[day], enabled: day === monday };
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
  const tuesday = DAY_NAMES[2];
  assert.equal(weekly[tuesday].enabled, true);
  assert.deepEqual(weekly[tuesday].slots, [{ start: "9:00 AM", end: "5:00 PM" }]);
  const monday = DAY_NAMES[1];
  assert.equal(weekly[monday].enabled, false);
});
```

- [ ] **Step 2: Run checks to verify the new ones fail**

Run: `npx tsx scripts/check-booking.ts`
Expected: FAIL — `Cannot find module '../lib/supabase/booking-types'`.

- [ ] **Step 3: Implement `lib/supabase/booking-types.ts`**

```ts
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
```

- [ ] **Step 4: Run checks to verify they pass**

Run: `npx tsx scripts/check-booking.ts`
Expected: all `ok`, `19 checks passed`. (If day-name keys differ from `getDefaultAvailability`, fix `DAY_NAMES` — not the checks.)

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/booking-types.ts scripts/check-booking.ts
git commit -m "feat(booking): db mappers and WeeklyAvailability bridge"
```

---

### Task 6: Data access module

**Files:**
- Create: `lib/data/supabase-booking.ts`

**Interfaces:**
- Consumes: Tasks 1 & 5; `SupabaseClient`.
- Produces (used by Tasks 7-8 and later phases):
  - `resolveBookingEntity(supabase): Promise<BookingEntityRef | null>`
  - `fetchBookingSettings(supabase, entity): Promise<BookingSettings | null>`
  - `saveBookingSettings(supabase, entity, input: Partial<BookingSettingsInput>): Promise<void>`
  - `fetchAvailability(supabase, entity): Promise<{ rules: AvailabilityRule[]; overrides: AvailabilityOverride[] }>`
  - `replaceWeeklyRules(supabase, entity, weekly: WeeklyAvailability): Promise<void>`
  - `addBlockedDate(supabase, entity, date: string): Promise<AvailabilityOverride>`
  - `removeOverride(supabase, id: string): Promise<void>`

No unit checks for this module — it is thin I/O over the mappers already covered in Task 5; RLS correctness was proven in Task 4. Verification is the typecheck plus Task 7/8 UI usage.

- [ ] **Step 1: Implement `lib/data/supabase-booking.ts`**

```ts
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
  const { error } = await supabase
    .from("booking_settings")
    .upsert(row, { onConflict: column });
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
  const { error: delError } = await supabase
    .from("availability_rules")
    .delete()
    .eq(column, id);
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
    .upsert({ [column]: id, date, closed: true }, { onConflict: `artist_id,studio_id,date` })
    .select()
    .single();
  if (error) throw new Error(`Failed to block date: ${error.message}`);
  return mapDbAvailabilityOverride(data as DbAvailabilityOverride);
}

export async function removeOverride(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("availability_overrides").delete().eq("id", id);
  if (error) throw new Error(`Failed to remove override: ${error.message}`);
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/data/supabase-booking.ts
git commit -m "feat(booking): client data access for settings and availability"
```

---

### Task 7: Booking settings panel + artist dashboard wiring

**Files:**
- Create: `components/booking/use-booking-settings.ts`
- Create: `components/booking/booking-settings-panel.tsx`
- Create: `components/booking/index.tsx`
- Modify: `components/dashboard/artist/artist-dashboard.tsx` (add quick action + render panel)

**Interfaces:**
- Consumes: Task 6 functions; `createClient` from `@/lib/supabase/client`; UI primitives `ToggleSwitch`, `Select`, `Input`, `Textarea`, `SlideOverPanel`, `Button` from `@/components/ui`.
- Produces: `useBookingSettings()` hook and `<BookingSettingsPanel open onClose />`, reused by the studio dashboard in phase 5.

**Before writing:** read `components/ui/slide-over-panel.tsx` and `components/ui/select.tsx` prop signatures, and mirror the field/label styling used in `components/dashboard/artist/artist-availability-panel.tsx` (font-mono labels, `text-ink-black/70 dark:text-ink-cream/70`, etc.). Adjust prop names below to the real signatures if they differ — the structure and logic stay as written.

- [ ] **Step 1: Implement `components/booking/use-booking-settings.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchBookingSettings,
  resolveBookingEntity,
  saveBookingSettings,
} from "@/lib/data/supabase-booking";
import {
  DEFAULT_BOOKING_SETTINGS,
  type BookingEntityRef,
  type BookingSettingsInput,
} from "@/lib/types/booking";

export function useBookingSettings() {
  const supabaseRef = useRef(createClient());
  const [entity, setEntity] = useState<BookingEntityRef | null>(null);
  const [settings, setSettings] = useState<BookingSettingsInput>(DEFAULT_BOOKING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const resolved = await resolveBookingEntity(supabase);
      if (cancelled || !resolved) {
        if (!cancelled) setLoading(false);
        return;
      }
      const existing = await fetchBookingSettings(supabase, resolved);
      if (cancelled) return;
      setEntity(resolved);
      if (existing) {
        const { id: _id, artistId: _a, studioId: _s, ...input } = existing;
        setSettings(input);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(<K extends keyof BookingSettingsInput>(
    key: K,
    value: BookingSettingsInput[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    if (!entity) return;
    setSaving(true);
    setError(null);
    try {
      await saveBookingSettings(supabaseRef.current, entity, settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [entity, settings]);

  return { entity, settings, update, save, loading, saving, error };
}
```

- [ ] **Step 2: Implement `components/booking/booking-settings-panel.tsx`**

A `SlideOverPanel`-based form, mobile-first, 44px touch targets. Complete structure (adapt primitive prop names to their real signatures):

```tsx
"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBookingSettings } from "./use-booking-settings";
import type { BookingSettingsInput } from "@/lib/types/booking";

const US_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

interface BookingSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
      {children}
    </p>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-[44px] items-center gap-3">
      <ToggleSwitch checked={checked} onChange={onChange} />
      <div>
        <FieldLabel>{label}</FieldLabel>
        <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">{hint}</p>
      </div>
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function BookingSettingsPanel({ open, onClose }: BookingSettingsPanelProps) {
  const { entity, settings, update, save, loading, saving, error } = useBookingSettings();
  const isStudio = Boolean(entity?.studioId);

  const set = <K extends keyof BookingSettingsInput>(key: K) =>
    (value: BookingSettingsInput[K]) => update(key, value);

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Booking Settings">
      {loading ? (
        <p className="p-4 font-mono text-[12px] text-ink-black/40 dark:text-ink-cream/40">
          Loading...
        </p>
      ) : (
        <div className="flex flex-col gap-5 p-4">
          <ToggleRow
            label="Accepting bookings"
            hint="Master switch for every booking flow"
            checked={settings.acceptingBookings}
            onChange={set("acceptingBookings")}
          />
          <ToggleRow
            label="Custom work requests"
            hint="Clients send a design brief for your review"
            checked={settings.customRequestsEnabled}
            onChange={set("customRequestsEnabled")}
          />
          <ToggleRow
            label="Consultations"
            hint="Bookable consult slots before committing"
            checked={settings.consultationsEnabled}
            onChange={set("consultationsEnabled")}
          />
          <ToggleRow
            label="Flash booking"
            hint="Pre-priced designs bookable instantly"
            checked={settings.flashEnabled}
            onChange={set("flashEnabled")}
          />
          {isStudio && (
            <ToggleRow
              label="Walk-ins"
              hint="Studio-level bookings not tied to one artist"
              checked={settings.walkInsEnabled}
              onChange={set("walkInsEnabled")}
            />
          )}

          {settings.consultationsEnabled && (
            <>
              <SelectRow
                label="Consult length"
                value={settings.consultDurationMin}
                options={[15, 30, 45, 60].map((v) => ({ value: v, label: `${v} min` }))}
                onChange={(v) => update("consultDurationMin", Number(v))}
              />
              <SelectRow
                label="Consult price"
                value={settings.consultPriceCents}
                options={[0, 2500, 5000, 10000].map((v) => ({
                  value: v,
                  label: v === 0 ? "Free" : `$${v / 100}`,
                }))}
                onChange={(v) => update("consultPriceCents", Number(v))}
              />
              <SelectRow
                label="Consult location"
                value={settings.consultLocation}
                options={[
                  { value: "in_person", label: "In person" },
                  { value: "virtual", label: "Virtual" },
                ]}
                onChange={(v) => update("consultLocation", v as "in_person" | "virtual")}
              />
            </>
          )}

          <SelectRow
            label="Default deposit"
            value={settings.defaultDepositCents}
            options={[0, 5000, 10000, 15000, 20000].map((v) => ({
              value: v,
              label: v === 0 ? "No deposit" : `$${v / 100}`,
            }))}
            onChange={(v) => update("defaultDepositCents", Number(v))}
          />
          <SelectRow
            label="Slot size"
            value={settings.slotGranularityMin}
            options={[15, 30, 60].map((v) => ({ value: v, label: `${v} min` }))}
            onChange={(v) => update("slotGranularityMin", Number(v) as 15 | 30 | 60)}
          />
          <SelectRow
            label="Buffer between appointments"
            value={settings.bufferMin}
            options={[0, 15, 30, 60].map((v) => ({ value: v, label: v ? `${v} min` : "None" }))}
            onChange={(v) => update("bufferMin", Number(v))}
          />
          <SelectRow
            label="Minimum notice"
            value={settings.minNoticeHours}
            options={[
              { value: 0, label: "None" },
              { value: 12, label: "12 hours" },
              { value: 24, label: "24 hours" },
              { value: 48, label: "2 days" },
              { value: 168, label: "1 week" },
            ]}
            onChange={(v) => update("minNoticeHours", Number(v))}
          />
          <SelectRow
            label="Booking window"
            value={settings.maxHorizonDays}
            options={[
              { value: 30, label: "30 days out" },
              { value: 60, label: "60 days out" },
              { value: 90, label: "90 days out" },
              { value: 180, label: "6 months out" },
            ]}
            onChange={(v) => update("maxHorizonDays", Number(v))}
          />
          <SelectRow
            label="Timezone"
            value={settings.timezone}
            options={US_TIMEZONES.map((tz) => ({
              value: tz,
              label: tz.split("/")[1].replace(/_/g, " "),
            }))}
            onChange={set("timezone")}
          />

          <div className="flex flex-col gap-2">
            <FieldLabel>Cancellation policy</FieldLabel>
            <Textarea
              value={settings.cancellationPolicyText ?? ""}
              onChange={(e) => update("cancellationPolicyText", e.target.value || null)}
              placeholder="Deposits are non-refundable within 48 hours of the appointment..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            onClick={async () => {
              await save();
              onClose();
            }}
            disabled={saving || !entity}
            className="min-h-[44px]"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </SlideOverPanel>
  );
}
```

- [ ] **Step 3: Create barrel `components/booking/index.tsx`**

```tsx
export { BookingSettingsPanel } from "./booking-settings-panel";
export { useBookingSettings } from "./use-booking-settings";
```

- [ ] **Step 4: Wire into `components/dashboard/artist/artist-dashboard.tsx`**

Read the file first. Then:
1. Import: `import { BookingSettingsPanel } from "@/components/booking";` and `import { useState } from "react";` (if not present).
2. Inside the component: `const [bookingSettingsOpen, setBookingSettingsOpen] = useState(false);`
3. Add a quick action to the existing `quickActions` array (match its icon pattern — inline SVG, no emoji):

```tsx
{
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  ),
  label: "Booking Settings",
  description: "Flows, deposits, and scheduling rules",
  onClick: () => setBookingSettingsOpen(true),
},
```

4. Render next to the existing `<ArtistAvailabilityPanel ... />`:

```tsx
<BookingSettingsPanel
  open={bookingSettingsOpen}
  onClose={() => setBookingSettingsOpen(false)}
/>
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. Watch for the repo's leaked-render and set-state-in-effect lint rules.

- [ ] **Step 6: Commit**

```bash
git add components/booking/ components/dashboard/artist/artist-dashboard.tsx
git commit -m "feat(booking): settings panel wired into artist dashboard"
```

---

### Task 8: Persist artist availability (weekly rules + blocked dates)

**Files:**
- Create: `components/booking/blocked-dates-editor.tsx`
- Modify: `components/dashboard/artist/hooks/use-weekly-availability.ts` (add load/save/blocked dates)
- Modify: `components/dashboard/artist/artist-availability-panel.tsx` (save wiring + blocked dates section)
- Modify: `components/booking/index.tsx` (export editor)
- Possibly modify: `components/dashboard/weekly-schedule.tsx` (only if it lacks a slot to render extra content before the save button — add an optional `footer?: React.ReactNode` prop)

**Interfaces:**
- Consumes: Task 6 (`resolveBookingEntity`, `fetchAvailability`, `fetchBookingSettings`, `replaceWeeklyRules`, `saveBookingSettings`, `addBlockedDate`, `removeOverride`); Task 5 (`rulesToWeekly`).
- Produces: `useWeeklyAvailability()` gains `{ saveAvailability, savingAvailability, blockedDates, addBlocked, removeBlocked }`; existing return shape unchanged otherwise (the dashboard spreads it).

- [ ] **Step 1: Extend `use-weekly-availability.ts`**

Replace the file with:

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDefaultAvailability } from "@/lib/data/dashboard";
import {
  addBlockedDate,
  fetchAvailability,
  fetchBookingSettings,
  removeOverride,
  replaceWeeklyRules,
  resolveBookingEntity,
  saveBookingSettings,
} from "@/lib/data/supabase-booking";
import { rulesToWeekly } from "@/lib/supabase/booking-types";
import type { WeeklyAvailability } from "@/lib/types";
import type { AvailabilityOverride, BookingEntityRef } from "@/lib/types/booking";

export function useWeeklyAvailability() {
  const supabaseRef = useRef(createClient());
  const entityRef = useRef<BookingEntityRef | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [takingBookings, setTakingBookings] = useState(true);
  const [availability, setAvailability] = useState<WeeklyAvailability>(getDefaultAvailability);
  const [blockedDates, setBlockedDates] = useState<AvailabilityOverride[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const entity = await resolveBookingEntity(supabase);
      if (cancelled || !entity) return;
      entityRef.current = entity;
      const [{ rules, overrides }, settings] = await Promise.all([
        fetchAvailability(supabase, entity),
        fetchBookingSettings(supabase, entity),
      ]);
      if (cancelled) return;
      if (rules.length > 0) {
        setAvailability(rulesToWeekly(rules, getDefaultAvailability()));
      }
      setBlockedDates(overrides.filter((o) => o.closed));
      if (settings) setTakingBookings(settings.acceptingBookings);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleDay = (day: string, enabled: boolean) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return { ...prev, [day]: { ...current, enabled } };
    });
  };

  const handleAddSlot = (day: string) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: { ...current, slots: [...current.slots, { start: "10:00 AM", end: "6:00 PM" }] },
      };
    });
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: { ...current, slots: current.slots.filter((_, i) => i !== index) },
      };
    });
  };

  const handleUpdateSlot = (day: string, index: number, field: "start" | "end", value: string) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: {
          ...current,
          slots: current.slots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
        },
      };
    });
  };

  const saveAvailability = useCallback(async () => {
    const entity = entityRef.current;
    if (!entity) return;
    setSavingAvailability(true);
    try {
      await Promise.all([
        replaceWeeklyRules(supabaseRef.current, entity, availability),
        saveBookingSettings(supabaseRef.current, entity, { acceptingBookings: takingBookings }),
      ]);
    } finally {
      setSavingAvailability(false);
    }
  }, [availability, takingBookings]);

  const addBlocked = useCallback(async (date: string) => {
    const entity = entityRef.current;
    if (!entity || !date) return;
    const created = await addBlockedDate(supabaseRef.current, entity, date);
    setBlockedDates((prev) =>
      [...prev.filter((o) => o.date !== created.date), created].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
  }, []);

  const removeBlocked = useCallback(async (id: string) => {
    await removeOverride(supabaseRef.current, id);
    setBlockedDates((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return {
    availabilityOpen,
    setAvailabilityOpen,
    takingBookings,
    setTakingBookings,
    availability,
    handleToggleDay,
    handleAddSlot,
    handleRemoveSlot,
    handleUpdateSlot,
    saveAvailability,
    savingAvailability,
    blockedDates,
    addBlocked,
    removeBlocked,
  };
}
```

- [ ] **Step 2: Implement `components/booking/blocked-dates-editor.tsx`**

Native `<input type="date">` — no picker library.

```tsx
"use client";

import { useState } from "react";
import type { AvailabilityOverride } from "@/lib/types/booking";

interface BlockedDatesEditorProps {
  blockedDates: AvailabilityOverride[];
  onAdd: (date: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
}

export function BlockedDatesEditor({ blockedDates, onAdd, onRemove }: BlockedDatesEditorProps) {
  const [date, setDate] = useState("");

  return (
    <div className="mt-4 rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
      <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
        Blocked dates
      </p>
      <p className="mb-3 text-[10px] text-ink-black/25 dark:text-ink-cream/25">
        Days off, conventions, guest spots — no bookings on these days
      </p>
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-[44px] flex-1 rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
        />
        <button
          type="button"
          onClick={() => {
            void onAdd(date);
            setDate("");
          }}
          disabled={!date}
          className="min-h-[44px] rounded-lg border border-ink-black/[0.08] px-4 font-mono text-[12px] font-medium disabled:opacity-40 dark:border-ink-cream/[0.08]"
        >
          Block
        </button>
      </div>
      {blockedDates.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {blockedDates.map((o) => (
            <li key={o.id} className="flex min-h-[44px] items-center justify-between">
              <span className="font-mono text-[12px] text-ink-black/70 dark:text-ink-cream/70">
                {o.date}
              </span>
              <button
                type="button"
                onClick={() => void onRemove(o.id)}
                aria-label={`Unblock ${o.date}`}
                className="min-h-[44px] px-3 font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Add to `components/booking/index.tsx`:

```tsx
export { BlockedDatesEditor } from "./blocked-dates-editor";
```

- [ ] **Step 3: Wire save + blocked dates into the availability panel**

In `components/dashboard/artist/artist-availability-panel.tsx`:
1. Add props: `onSave: () => Promise<void> | void`, `blockedDates`, `onAddBlocked`, `onRemoveBlocked` (types from the editor above).
2. Change `onSave={onClose}` on `WeeklySchedulePanel` to:

```tsx
onSave={async () => {
  await onSave();
  onClose();
}}
```

3. Render `<BlockedDatesEditor blockedDates={blockedDates} onAdd={onAddBlocked} onRemove={onRemoveBlocked} />` after the day list. Read `components/dashboard/weekly-schedule.tsx` first: if `WeeklySchedulePanel` has no children/footer slot, add an optional `footer?: React.ReactNode` prop rendered between the day list and the save button, and pass the editor through it.

4. In `artist-dashboard.tsx`, pass the new props from the hook's return (`dashboard.saveAvailability`, `dashboard.blockedDates`, `dashboard.addBlocked`, `dashboard.removeBlocked`).

- [ ] **Step 4: Run all checks, typecheck, lint**

Run: `npx tsx scripts/check-booking.ts && npx tsc --noEmit && npm run lint`
Expected: 19 checks pass; tsc and lint clean.

- [ ] **Step 5: Commit**

```bash
git add components/booking/ components/dashboard/artist/ components/dashboard/weekly-schedule.tsx
git commit -m "feat(booking): persist weekly availability and blocked dates"
```

---

### Task 9: Final verification sweep

**Files:**
- None new. Fix anything the sweep surfaces.

- [ ] **Step 1: Full check run**

```bash
npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint
```

Expected: everything green. `check-builder.ts` guards against regressions in shared types.

- [ ] **Step 2: Manual verification note for Tanner**

Do NOT start the dev server. Report to the user that manual verification needs: artist dashboard → Booking Settings quick action → edit + save; availability panel → edit days + block a date + save; reload page → values persist.

- [ ] **Step 3: Commit any fixes**

```bash
git add <the specific files you fixed> && git commit -m "fix(booking): verification sweep fixes"
```

(Skip if the sweep was already clean.)
