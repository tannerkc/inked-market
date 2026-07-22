import { mockArtists } from "@/lib/data/artists";
import { mockStudios } from "@/lib/data/shops";
import type { TattooStyle } from "@/lib/types";
import type { Badge } from "@/lib/data/discover";

type ArtistWithLocation = (typeof mockArtists)[string]  & {
  location?: { city: string; state: string };
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchFilters {
  q?: string;
  styles?: string[];
  location?: string;
  rating?: number;
  exp?: string; // "1-3" | "3-5" | "5-10" | "10+"
  verified?: boolean;
  booking?: boolean;
  sort?: "relevance" | "rating" | "reviews" | "newest";
  page?: number;
}

export interface SearchResultItem {
  id: string;
  /** Pretty URL slug — present on DB rows; links fall back to id without it. */
  slug?: string;
  type: "artist" | "studio";
  name: string;
  avatar: string;
  images: string[];
  location: string; // "City, State"
  rating: number;
  reviewCount: number;
  specialties: string[];
  verified: boolean;
  artistCount?: number;
  yearsOfExperience?: number;
  badges?: Badge[];
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  hasMore: boolean;
  /** True when results came from mock fallback (Supabase unavailable). */
  isSample?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function slugifyLocation(city: string, state: string): string {
  return `${city}-${state}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function parseExpRange(exp: string): { min: number; max: number } {
  switch (exp) {
    case "1-3":
      return { min: 1, max: 3 };
    case "3-5":
      return { min: 3, max: 5 };
    case "5-10":
      return { min: 5, max: 10 };
    case "10+":
      return { min: 10, max: Infinity };
    default:
      return { min: 0, max: Infinity };
  }
}

function parseTeamSizeRange(exp: string): { min: number; max: number } {
  switch (exp) {
    case "1-3":
      return { min: 1, max: 3 };
    case "4-8":
      return { min: 4, max: 8 };
    case "8+":
      return { min: 8, max: Infinity };
    default:
      return { min: 0, max: Infinity };
  }
}

function paginate(items: SearchResultItem[], page: number): SearchResponse {
  const start = (page - 1) * PAGE_SIZE;
  const paged = items.slice(start, start + PAGE_SIZE);
  return {
    results: paged,
    total: items.length,
    page,
    hasMore: start + PAGE_SIZE < items.length,
  };
}

// ---------------------------------------------------------------------------
// Artist Search
// ---------------------------------------------------------------------------

export function searchArtists(filters: SearchFilters = {}): SearchResponse {
  const { q, styles, location, rating, exp, verified, sort = "relevance", page = 1 } = filters;

  let items: SearchResultItem[] = Object.values(mockArtists).map((a) => {
    const artist = a as ArtistWithLocation;
    return {
    id: artist.id,
    type: "artist" as const,
    name: artist.name,
    avatar: artist.profileImage,
    images: artist.portfolioImages.slice(0, 4).map((img) => img.url),
    location: artist.location
      ? `${artist.location.city}, ${artist.location.state}`
      : "",
    rating: artist.rating,
    reviewCount: artist.reviewCount,
    specialties: artist.specialties,
    verified: artist.verified,
    yearsOfExperience: artist.yearsOfExperience,
  };
  });

  // --- Filters ---

  if (q) {
    items = items.filter((item) => {
      const artist = mockArtists[item.id];
      if (!artist) return false;
      const searchable = [
        artist.name,
        artist.bio,
        artist.specialties.join(" "),
      ].join(" ");
      return matchesQuery(searchable, q);
    });
  }

  if (styles && styles.length > 0) {
    const lowered = styles.map((s) => s.toLowerCase());
    items = items.filter((item) => {
      const artist = mockArtists[item.id];
      if (!artist) return false;
      return artist.styles.some((s: TattooStyle) =>
        lowered.includes(s.toLowerCase())
      );
    });
  }

  if (location) {
    items = items.filter((item) => {
      const artist = mockArtists[item.id] as ArtistWithLocation;
      if (!artist.location) return false;
      const slug = slugifyLocation(artist.location.city, artist.location.state);
      return slug === location.toLowerCase().replace(/\s+/g, "-");
    });
  }

  if (rating !== undefined) {
    items = items.filter((item) => item.rating >= rating);
  }

  if (exp) {
    const { min, max } = parseExpRange(exp);
    items = items.filter((item) => {
      const yoe = item.yearsOfExperience ?? 0;
      return yoe >= min && yoe <= max;
    });
  }

  if (verified !== undefined) {
    items = items.filter((item) => item.verified === verified);
  }

  // --- Sort ---

  switch (sort) {
    case "relevance":
      items.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return b.rating - a.rating;
      });
      break;
    case "rating":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      items.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
      items.sort((a, b) => {
        const aDate = mockArtists[a.id]?.createdAt?.getTime() ?? 0;
        const bDate = mockArtists[b.id]?.createdAt?.getTime() ?? 0;
        return bDate - aDate;
      });
      break;
  }

  return paginate(items, page);
}

// ---------------------------------------------------------------------------
// Studio Search
// ---------------------------------------------------------------------------

export function searchStudios(filters: SearchFilters = {}): SearchResponse {
  const { q, styles, location, rating, exp, verified, sort = "relevance", page = 1 } = filters;

  let items: SearchResultItem[] = Object.values(mockStudios).map((studio) => ({
    id: studio.id,
    type: "studio" as const,
    name: studio.name,
    avatar: studio.profileImage,
    images: studio.images.slice(0, 4),
    location: `${studio.location.city}, ${studio.location.state}`,
    rating: studio.rating,
    reviewCount: studio.reviewCount,
    specialties: studio.specialties,
    verified: studio.verified,
    artistCount: studio.artistIds.length,
  }));

  // --- Filters ---

  if (q) {
    items = items.filter((item) => {
      const studio = mockStudios[item.id];
      if (!studio) return false;
      const searchable = [
        studio.name,
        studio.description,
        studio.bio,
        studio.specialties.join(" "),
      ].join(" ");
      return matchesQuery(searchable, q);
    });
  }

  if (styles && styles.length > 0) {
    const lowered = styles.map((s) => s.toLowerCase());
    items = items.filter((item) => {
      const studio = mockStudios[item.id];
      if (!studio) return false;
      return studio.specialties.some((s) => lowered.includes(s.toLowerCase()));
    });
  }

  if (location) {
    const target = location.toLowerCase().replace(/\s+/g, "-");
    items = items.filter((item) => {
      const studio = mockStudios[item.id];
      if (!studio) return false;
      return slugifyLocation(studio.location.city, studio.location.state) === target;
    });
  }

  if (rating !== undefined) {
    items = items.filter((item) => item.rating >= rating);
  }

  if (exp) {
    const { min, max } = parseTeamSizeRange(exp);
    items = items.filter((item) => {
      const count = item.artistCount ?? 0;
      return count >= min && count <= max;
    });
  }

  if (verified !== undefined) {
    items = items.filter((item) => item.verified === verified);
  }

  // --- Sort ---

  switch (sort) {
    case "relevance":
      items.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return b.rating - a.rating;
      });
      break;
    case "rating":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      items.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
      items.sort((a, b) => {
        const aDate = mockStudios[a.id]?.createdAt?.getTime() ?? 0;
        const bDate = mockStudios[b.id]?.createdAt?.getTime() ?? 0;
        return bDate - aDate;
      });
      break;
  }

  return paginate(items, page);
}
