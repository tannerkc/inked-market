import type { Studio } from "@/lib/types";
import type { StudioData, BusinessHours } from "@/lib/repositories/types";
import type { Badge, DiscoverProfile } from "@/lib/data/discover";
import type { SearchResultItem } from "@/lib/data/search";

// ─── Database row types (snake_case, matching Postgres schema) ───────────────

export interface DbStudio {
  id: string;
  name: string;
  slug: string;
  source: "google" | "organic";
  google_place_id: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  address: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bio: string | null;
  hours: Record<string, { open: string; close: string; closed?: boolean }> | null;
  specialties: string[];
  rating: number | null;
  review_count: number;
  profile_image: string | null;
  cover_image: string | null;
  images: string[];
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSeedConfig {
  id: string;
  key: string;
  enabled: boolean;
  updated_at: string;
}

// ─── Card-level columns (lightweight query for list views) ───────────────────

/** Columns selected for card rendering — avoids fetching full images[] array */
export const STUDIO_CARD_COLUMNS =
  "id, name, slug, city, state, rating, review_count, profile_image, source, claimed_by, specialties, is_visible" as const;

/** Columns selected for detail page rendering */
export const STUDIO_DETAIL_COLUMNS = "*" as const;

// ─── Mappers ─────────────────────────────────────────────────────────────────

const UNCLAIMED_BADGE: Badge = { label: "Unclaimed", color: "sage" };

/** Map a DB row to the app's Studio interface */
export function mapDbStudioToStudio(row: DbStudio): Studio {
  return {
    id: row.id,
    name: row.name,
    description: "",
    bio: row.bio ?? "",
    location: {
      address: row.address ?? "",
      city: row.city,
      state: row.state,
      zipCode: row.zip_code ?? "",
      country: "US",
      coordinates: row.latitude && row.longitude
        ? { lat: row.latitude, lng: row.longitude }
        : undefined,
    },
    phone: row.phone ?? "",
    email: row.email ?? "",
    socialLinks: {
      website: row.website ?? undefined,
    },
    coverImage: row.cover_image ?? "",
    profileImage: row.profile_image ?? "",
    images: row.images ?? [],
    specialties: row.specialties ?? [],
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    verified: row.claimed_by !== null,
    artistIds: [],
    openHours: row.hours as Studio["openHours"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    slug: row.slug,
    source: row.source,
    googlePlaceId: row.google_place_id ?? undefined,
    claimedBy: row.claimed_by ?? undefined,
    claimedAt: row.claimed_at ? new Date(row.claimed_at) : undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

/** Map a DB row to StudioData for the repository/dashboard layer */
export function mapDbStudioToStudioData(row: DbStudio): StudioData {
  return {
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    city: row.city,
    state: row.state,
    address: row.address ?? undefined,
    zipCode: row.zip_code ?? undefined,
    bio: row.bio ?? "",
    profileImage: row.profile_image ?? undefined,
    coverImage: row.cover_image ?? undefined,
    specialties: row.specialties ?? [],
    services: [],
    hours: (row.hours as BusinessHours) ?? {},
    autoSpecialties: false,
    website: row.website ?? undefined,
    source: row.source,
    claimedBy: row.claimed_by ?? undefined,
    slug: row.slug,
  };
}

/** Map StudioData (partial) to DB row shape for inserts/updates */
export function mapStudioDataToDbStudio(
  data: Partial<StudioData>
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  if (data.name !== undefined) mapped.name = data.name;
  if (data.phone !== undefined) mapped.phone = data.phone;
  if (data.email !== undefined) mapped.email = data.email;
  if (data.city !== undefined) mapped.city = data.city;
  if (data.state !== undefined) mapped.state = data.state;
  if (data.address !== undefined) mapped.address = data.address;
  if (data.zipCode !== undefined) mapped.zip_code = data.zipCode;
  if (data.bio !== undefined) mapped.bio = data.bio;
  if (data.profileImage !== undefined) mapped.profile_image = data.profileImage;
  if (data.coverImage !== undefined) mapped.cover_image = data.coverImage;
  if (data.specialties !== undefined) mapped.specialties = data.specialties;
  if (data.hours !== undefined) mapped.hours = data.hours;
  if (data.website !== undefined) mapped.website = data.website;
  mapped.updated_at = new Date().toISOString();

  return mapped;
}

/** Map a DB row to a DiscoverProfile for the discover page cards */
export function mapDbStudioToDiscoverProfile(row: DbStudio): DiscoverProfile {
  const badges: Badge[] = [];
  if (row.source === "google" && !row.claimed_by) {
    badges.push(UNCLAIMED_BADGE);
  }
  if (row.claimed_by) {
    badges.push({ label: "Verified", color: "sage" });
  }

  return {
    id: row.id,
    name: row.name,
    image: row.profile_image ?? "",
    location: `${row.city}, ${row.state}`,
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    specialties: row.specialties ?? [],
    verified: row.claimed_by !== null,
    badges,
    artistCount: 0,
  };
}

/** Map a DB row to a SearchResultItem for the search page cards */
export function mapDbStudioToSearchResult(row: DbStudio): SearchResultItem {
  const badges: Badge[] = [];
  if (row.source === "google" && !row.claimed_by) {
    badges.push(UNCLAIMED_BADGE);
  }

  return {
    id: row.id,
    type: "studio",
    name: row.name,
    avatar: row.profile_image ?? "",
    images: (row.images ?? []).slice(0, 4),
    location: `${row.city}, ${row.state}`,
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    specialties: row.specialties ?? [],
    verified: row.claimed_by !== null,
    artistCount: 0,
    badges,
  };
}
