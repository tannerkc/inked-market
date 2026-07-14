import { NextResponse } from "next/server";
import { SlotsQuerySchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeArtistSlotsRange } from "@/lib/booking/server-slots";

/** Open slots for an artist — returns derived slots only, never busy data. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = SlotsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { artistId, durationMin, from, to } = parsed.data;

  const result = await computeArtistSlotsRange(createAdminClient(), {
    artistId,
    durationMin,
    fromDate: from,
    toDate: to,
  });
  if (!result) return NextResponse.json({ slots: [], timezone: "America/New_York" });
  return NextResponse.json({ slots: result.slots, timezone: result.timezone });
}
