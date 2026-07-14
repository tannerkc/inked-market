import type { SupabaseClient } from "@supabase/supabase-js";
import type { Affiliation, Artist } from "@/lib/types";
import type { DiscoverProfile } from "@/lib/data/discover";
import type {
  SearchFilters,
  SearchResponse,
  SearchResultItem,
} from "@/lib/data/search";
import {
  type DbArtist,
  type DbPortfolioImage,
  ARTIST_CARD_COLUMNS,
  mapDbArtistToArtist,
  mapDbArtistToDiscoverProfile,
  mapDbArtistToSearchResult,
} from "@/lib/supabase/types";
import { isSeededListingsEnabled } from "@/lib/utils/feature-flags";

const DISCOVER_LIMIT = 12;
const SEARCH_PAGE_SIZE = 6;

const EXP_RANGES: Record<string, [number, number]> = {
  "1-3": [1, 3],
  "3-5": [3, 5],
  "5-10": [5, 10],
  "10+": [10, Infinity],
};

/** Artist enriched with its primary studio's display name (for the detail page). */
export type ArtistWithStudio = Artist & { studioName?: string };

// ─── Discover ─────────────────────────────────────────────────────────────────

/** Featured artists for the discover page. */
export async function getDiscoverArtists(
  supabase: SupabaseClient,
): Promise<DiscoverProfile[]> {
  try {
    let query = supabase
      .from("artists")
      .select(ARTIST_CARD_COLUMNS)
      .eq("is_visible", true)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(DISCOVER_LIMIT);

    if (!isSeededListingsEnabled()) query = query.eq("source", "organic");

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as DbArtist[]).map(mapDbArtistToDiscoverProfile);
  } catch {
    return [];
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchArtistsFromDb(
  supabase: SupabaseClient,
  filters: SearchFilters = {},
): Promise<SearchResponse> {
  const {
    q,
    styles,
    location,
    rating,
    exp,
    verified,
    sort = "relevance",
    page = 1,
  } = filters;

  try {
    let query = supabase
      .from("artists")
      .select(ARTIST_CARD_COLUMNS, { count: "exact" })
      .eq("is_visible", true);

    if (!isSeededListingsEnabled()) query = query.eq("source", "organic");

    if (q) {
      const sanitized = q.replace(/[%_]/g, "");
      query = query.ilike("name", `%${sanitized}%`);
    }

    // Artists filter on the style enum (not free-text specialties)
    if (styles && styles.length > 0) {
      query = query.overlaps("styles", styles);
    }

    if (location) {
      const parts = location.split("-");
      const last = parts[parts.length - 1];
      if (parts.length >= 2 && last) {
        const state = last.toUpperCase();
        const city = parts
          .slice(0, -1)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" ");
        query = query.ilike("city", city).ilike("state", state);
      }
    }

    if (rating !== undefined) query = query.gte("rating", rating);

    if (exp && EXP_RANGES[exp]) {
      const [min, max] = EXP_RANGES[exp];
      query = query.gte("years_experience", min);
      if (max !== Infinity) query = query.lte("years_experience", max);
    }

    if (verified) query = query.eq("verified", true);

    switch (sort) {
      case "rating":
        query = query.order("rating", { ascending: false, nullsFirst: false });
        break;
      case "reviews":
        query = query.order("review_count", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "relevance":
      default:
        query = query
          .order("verified", { ascending: false })
          .order("rating", { ascending: false, nullsFirst: false });
        break;
    }

    const from = (page - 1) * SEARCH_PAGE_SIZE;
    const to = from + SEARCH_PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error || !data) {
      return { results: [], total: 0, page, hasMore: false };
    }

    const results: SearchResultItem[] = (data as DbArtist[]).map(
      mapDbArtistToSearchResult,
    );
    const total = count ?? 0;
    return { results, total, page, hasMore: from + SEARCH_PAGE_SIZE < total };
  } catch {
    return { results: [], total: 0, page, hasMore: false };
  }
}

// ─── Single artist ────────────────────────────────────────────────────────────

async function loadArtist(
  supabase: SupabaseClient,
  column: "id" | "slug",
  value: string,
): Promise<ArtistWithStudio | null> {
  try {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq(column, value)
      .single();
    if (error || !data) return null;
    const row = data as DbArtist;

    const { data: portfolio } = await supabase
      .from("portfolio_images")
      .select("*")
      .eq("artist_id", row.id)
      .order("sort_order", { ascending: true });

    const artist = mapDbArtistToArtist(row, (portfolio as DbPortfolioImage[]) ?? []);

    let studioName: string | undefined;
    if (row.studio_id) {
      const { data: studio } = await supabase
        .from("studios")
        .select("name")
        .eq("id", row.studio_id)
        .single();
      studioName = (studio as { name?: string } | null)?.name ?? undefined;
    }

    return { ...artist, studioName };
  } catch {
    return null;
  }
}

export function getArtistByIdFromDb(supabase: SupabaseClient, id: string) {
  return loadArtist(supabase, "id", id);
}

export function getArtistBySlugFromDb(supabase: SupabaseClient, slug: string) {
  return loadArtist(supabase, "slug", slug);
}

/**
 * Artist rows on a studio's public roster: linked via artists.studio_id
 * (artist chose the studio at signup) OR joined via an active affiliation
 * (studio invited / accepted a request). Single source for the public page,
 * the builder preview, and the dashboard — keep them in lockstep.
 */
export async function getRosterArtistRows(
  supabase: SupabaseClient,
  studioId: string,
): Promise<DbArtist[]> {
  const { data: aff } = await supabase
    .from("affiliations")
    .select("artist_id")
    .eq("studio_id", studioId)
    .eq("status", "active");
  const activeIds = ((aff ?? []) as { artist_id: string }[]).map((r) => r.artist_id);

  let query = supabase
    .from("artists")
    .select(ARTIST_CARD_COLUMNS)
    .eq("is_visible", true)
    .order("rating", { ascending: false, nullsFirst: false });
  query =
    activeIds.length > 0
      ? query.or(`studio_id.eq.${studioId},id.in.(${activeIds.join(",")})`)
      : query.eq("studio_id", studioId);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as DbArtist[];
}

/** Artists affiliated with a studio (for the studio's public roster). */
export async function getArtistsForStudio(
  supabase: SupabaseClient,
  studioId: string,
): Promise<DiscoverProfile[]> {
  try {
    const rows = await getRosterArtistRows(supabase, studioId);
    return rows.map(mapDbArtistToDiscoverProfile);
  } catch {
    return [];
  }
}

// ─── Studio roster management (dashboard) ─────────────────────────────────────

type RosterArtistRow = Pick<DbArtist, "id" | "name" | "profile_image" | "styles" | "specialties">;
const ROSTER_ARTIST_COLUMNS = "id, name, profile_image, styles, specialties";

function toRosterEntry(
  artist: RosterArtistRow,
  status: Affiliation["status"],
  affiliationId?: string,
): Affiliation {
  return {
    id: affiliationId ?? artist.id,
    artistId: artist.id,
    name: artist.name,
    avatarUrl: artist.profile_image ?? undefined,
    styles: artist.styles.length > 0 ? artist.styles : artist.specialties,
    status,
    role: "artist",
    linked: !affiliationId,
  };
}

/**
 * Full roster for the dashboard: every affiliation row (any status) plus
 * artists linked via artists.studio_id without one (shown active, read-only —
 * that link is artist-managed and RLS blocks the studio from editing it).
 */
export async function getStudioRosterFromDb(
  supabase: SupabaseClient,
  studioId: string,
): Promise<Affiliation[]> {
  try {
    const [affRes, linkedRes] = await Promise.all([
      supabase
        .from("affiliations")
        .select(`id, status, artist:artists(${ROSTER_ARTIST_COLUMNS})`)
        .eq("studio_id", studioId)
        .order("created_at", { ascending: true }),
      supabase
        .from("artists")
        .select(ROSTER_ARTIST_COLUMNS)
        .eq("studio_id", studioId)
        .eq("is_visible", true),
    ]);

    const entries: Affiliation[] = [];
    for (const row of (affRes.data ?? []) as unknown as {
      id: string;
      status: Affiliation["status"];
      artist: RosterArtistRow | null;
    }[]) {
      if (row.artist) entries.push(toRosterEntry(row.artist, row.status, row.id));
    }
    for (const artist of (linkedRes.data ?? []) as RosterArtistRow[]) {
      if (!entries.some((e) => e.artistId === artist.id)) {
        entries.push(toRosterEntry(artist, "active"));
      }
    }
    return entries;
  } catch {
    return [];
  }
}

/** Search visible artists to invite (name match; empty query = recent artists). */
export async function searchArtistsForInvite(
  supabase: SupabaseClient,
  q: string,
  limit = 8,
): Promise<Array<{ id: string; name: string; avatarUrl?: string; styles: string[] }>> {
  try {
    let query = supabase
      .from("artists")
      .select(ROSTER_ARTIST_COLUMNS)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!isSeededListingsEnabled()) query = query.eq("source", "organic");
    const sanitized = q.trim().replace(/[%_]/g, "");
    if (sanitized) query = query.ilike("name", `%${sanitized}%`);

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as RosterArtistRow[]).map((a) => ({
      id: a.id,
      name: a.name,
      avatarUrl: a.profile_image ?? undefined,
      styles: a.styles.length > 0 ? a.styles : a.specialties,
    }));
  } catch {
    return [];
  }
}

/** Invite an artist — creates a pending affiliation. Returns the new row id. */
export async function inviteArtistToStudio(
  supabase: SupabaseClient,
  artistId: string,
  studioId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("affiliations")
    .insert({ artist_id: artistId, studio_id: studioId, status: "pending-invite" })
    .select("id")
    .single();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function setAffiliationStatus(
  supabase: SupabaseClient,
  affiliationId: string,
  status: Affiliation["status"],
): Promise<boolean> {
  const { error } = await supabase
    .from("affiliations")
    .update({ status })
    .eq("id", affiliationId);
  return !error;
}

export async function removeAffiliation(
  supabase: SupabaseClient,
  affiliationId: string,
): Promise<boolean> {
  const { error } = await supabase.from("affiliations").delete().eq("id", affiliationId);
  return !error;
}
