import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchStudiosFromDb } from "@/lib/data/supabase-studios";
import { searchArtistsFromDb } from "@/lib/data/supabase-artists";
import { searchStudios, searchArtists } from "@/lib/data/search";
import type { SearchFilters } from "@/lib/data/search";
import { SearchParamsSchema } from "@/lib/validation/schemas";

const CACHE_HEADERS = { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" };

export async function GET(request: NextRequest) {
  const parsed = SearchParamsSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search parameters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { tab, q, styles, location, rating, experience, verified, booking, sort, page } =
    parsed.data;

  const filters: SearchFilters = {
    q,
    styles,
    location,
    rating,
    exp: experience,
    verified,
    booking,
    sort,
    page,
  };

  if (tab === "artists") {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabase = await createClient();
        const results = await searchArtistsFromDb(supabase, filters);
        return NextResponse.json(
          { ...results, isSample: false },
          { headers: CACHE_HEADERS },
        );
      }
    } catch {
      // Fall through to mock data
    }
    const results = searchArtists(filters);
    return NextResponse.json(
      { ...results, isSample: true },
      { headers: CACHE_HEADERS },
    );
  }

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const results = await searchStudiosFromDb(supabase, filters);
      return NextResponse.json(
        { ...results, isSample: false },
        { headers: CACHE_HEADERS },
      );
    }
  } catch {
    // Fall through to mock data
  }

  const results = searchStudios(filters);
  return NextResponse.json(
    { ...results, isSample: true },
    { headers: CACHE_HEADERS },
  );
}
