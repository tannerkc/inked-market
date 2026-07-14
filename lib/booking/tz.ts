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
  const [y = 0, mo = 1, d = 1] = dateIso.split("-").map(Number);
  const [h = 0, mi = 0] = hm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const first = offsetAt(new Date(guess), timeZone);
  const second = offsetAt(new Date(guess - first), timeZone);
  return new Date(guess - second);
}
