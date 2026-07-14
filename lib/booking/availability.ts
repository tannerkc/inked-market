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
