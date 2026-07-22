import { cn } from "@/lib/utils";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SHORT_DAYS: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

/** 8:00 AM to 10:00 PM in 30-minute increments (artist availability) */
export const ARTIST_TIME_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let hour = 8; hour <= 22; hour++) {
    const period = hour < 12 ? "AM" : "PM";
    const dh = hour === 12 ? 12 : hour > 12 ? hour - 12 : hour;
    const times = hour === 22 ? ["00"] : ["00", "30"];
    for (const m of times) opts.push(`${dh}:${m} ${period}`);
  }
  return opts;
})();

/** 6:00 AM to 11:00 PM in 30-minute increments (studio business hours) */
export const STUDIO_HOUR_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let h = 6; h <= 23; h++) {
    const period = h < 12 ? "AM" : "PM";
    const dh = h === 12 ? 12 : h > 12 ? h - 12 : h;
    opts.push(`${dh}:00 ${period}`);
    if (h < 23) opts.push(`${dh}:30 ${period}`);
  }
  return opts;
})();

/** Shared class for time-select dropdowns across schedule components */
export const SCHEDULE_SELECT_CLASS = cn(
  "appearance-none bg-transparent font-mono text-[10px] outline-none focus:border-ink-rust/40 rounded-lg px-2 py-1.5 flex-1 min-w-0",
  "text-ink-black/60 bg-ink-black/[0.04] border border-ink-black/[0.08]",
  "dark:text-ink-cream/60 dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08]"
);

/** @deprecated Use `SCHEDULE_SELECT_CLASS` directly. */
export const getScheduleSelectClass = (_isDark?: boolean) => SCHEDULE_SELECT_CLASS;
