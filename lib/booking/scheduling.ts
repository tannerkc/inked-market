/**
 * Pure validation for turning an accepted request into an appointment.
 * The DB exclusion constraint is the final race arbiter; this layer stops
 * clients from booking outside what the artist offered.
 */
import type { ProposedTime, SchedulingMode } from "@/lib/types/booking";
import type { Slot } from "./availability";

export type ScheduleValidation = { ok: true } | { ok: false; error: string };

const sameInterval = (a: { startAt: string; endAt: string }, startMs: number, endMs: number) =>
  Date.parse(a.startAt) === startMs && Date.parse(a.endAt) === endMs;

export function validateChosenTime(input: {
  mode: SchedulingMode;
  proposedTimes: ProposedTime[];
  openSlots: Slot[];
  chosen: { startAt: string; endAt: string };
  now: Date;
}): ScheduleValidation {
  const startMs = Date.parse(input.chosen.startAt);
  const endMs = Date.parse(input.chosen.endAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
    return { ok: false, error: "That time is not valid." };
  }
  if (startMs <= input.now.getTime()) {
    return { ok: false, error: "That time is in the past." };
  }
  if (input.mode === "propose") {
    return input.proposedTimes.some((t) => sameInterval(t, startMs, endMs))
      ? { ok: true }
      : { ok: false, error: "Pick one of the offered times." };
  }
  return input.openSlots.some((s) => sameInterval(s, startMs, endMs))
    ? { ok: true }
    : { ok: false, error: "That slot is no longer available." };
}
