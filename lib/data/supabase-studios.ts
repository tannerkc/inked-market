import type { SupabaseClient } from "@supabase/supabase-js";
import type { Studio } from "@/lib/types";
import type { DiscoverProfile } from "@/lib/data/discover";
import type { SearchFilters, SearchResponse, SearchResultItem } from "@/lib/data/search";
import {
  type DbStudio,
  STUDIO_CARD_COLUMNS,
  mapDbStudioToStudio,
  mapDbStudioToDiscoverProfile,
  mapDbStudioToSearchResult,
} from "@/lib/supabase/types";
import { isSeededListingsEnabled } from "@/lib/utils/feature-flags";

// ─── Constants ──────────────────────────────────────────────────────────────

const DISCOVER_LIMIT = 12;
const SEARCH_PAGE_SIZE = 6;

// ─── Discover page ──────────────────────────────────────────────────────────

/** Fetch featured studios for the discover page. Returns DiscoverProfile[]. */
export async function getDiscoverStudios(
  supabase: SupabaseClient
): Promise<DiscoverProfile[]> {
  try {
    let query = supabase
      .from("studios")
      .select(STUDIO_CARD_COLUMNS)
      .eq("is_visible", true)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(DISCOVER_LIMIT);

    // If seeded listings are disabled via env var, only show organic
    if (!isSeededListingsEnabled()) {
      query = query.eq("source", "organic");
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as DbStudio[]).map(mapDbStudioToDiscoverProfile);
  } catch {
    return [];
  }
}

// ─── Search ─────────────────────────────────────────────────────────────────

/** Search studios with filters. Returns same SearchResponse shape as mock. */
export async function searchStudiosFromDb(
  supabase: SupabaseClient,
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const {
    q,
    styles,
    location,
    rating,
    verified,
    sort = "relevance",
    page = 1,
  } = filters;

  try {
    let query = supabase
      .from("studios")
      .select(STUDIO_CARD_COLUMNS, { count: "exact" })
      .eq("is_visible", true);

    // Env var kill switch for seeded listings
    if (!isSeededListingsEnabled()) {
      query = query.eq("source", "organic");
    }

    // Text search — use chained filters to avoid PostgREST filter injection
    if (q) {
      const sanitized = q.replace(/[%_]/g, "");
      query = query.ilike("name", `%${sanitized}%`);
    }

    // Style filter
    if (styles && styles.length > 0) {
      query = query.overlaps("specialties", styles);
    }

    // Location filter
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

    // Rating filter
    if (rating !== undefined) {
      query = query.gte("rating", rating);
    }

    // Verified = claimed
    if (verified) {
      query = query.not("claimed_by", "is", null);
    }

    // Sort
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
          .order("claimed_by", { ascending: true, nullsFirst: false })
          .order("rating", { ascending: false, nullsFirst: false });
        break;
    }

    // Pagination
    const from = (page - 1) * SEARCH_PAGE_SIZE;
    const to = from + SEARCH_PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error || !data) {
      return { results: [], total: 0, page, hasMore: false };
    }

    const results: SearchResultItem[] = (data as DbStudio[]).map(
      mapDbStudioToSearchResult
    );
    const total = count ?? 0;

    return {
      results,
      total,
      page,
      hasMore: from + SEARCH_PAGE_SIZE < total,
    };
  } catch {
    return { results: [], total: 0, page, hasMore: false };
  }
}

// ─── Single studio ──────────────────────────────────────────────────────────

/** Fetch a single studio by ID. Returns full Studio object. */
export async function getStudioByIdFromDb(
  supabase: SupabaseClient,
  id: string
): Promise<Studio | null> {
  try {
    const { data, error } = await supabase
      .from("studios")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapDbStudioToStudio(data as DbStudio);
  } catch {
    return null;
  }
}

/** Fetch a single studio by slug. Returns full Studio object. */
export async function getStudioBySlugFromDb(
  supabase: SupabaseClient,
  slug: string
): Promise<Studio | null> {
  try {
    const { data, error } = await supabase
      .from("studios")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return mapDbStudioToStudio(data as DbStudio);
  } catch {
    return null;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if a studio has been claimed */
export function isStudioClaimed(studio: Studio): boolean {
  return studio.claimedBy !== undefined && studio.claimedBy !== null;
}
