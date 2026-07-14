/** 12h/24h clock string conversions bridging UI TimeSlot strings and DB time columns. */

export function hm12ToHm(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Invalid 12h time: ${t}`);
  const [, hh = "", mm = "", period = ""] = m;
  let h = Number(hh) % 12;
  if (/pm/i.test(period)) h += 12;
  return `${String(h).padStart(2, "0")}:${mm}`;
}

export function hmToHm12(hm: string): string {
  const [h = 0, mi = 0] = hm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mi).padStart(2, "0")} ${period}`;
}
