import type { Studio, Artist, PortfolioImage, Review, TattooStyle } from "@/lib/types";
import type { StudioData, BusinessHours } from "@/lib/repositories/types";
import type { StudioIntegrations } from "@/lib/types/integrations";
import type {
  LineupSpotlight,
  SpotlightContent,
  LineupArticle,
  LineupEvent,
  LineupEventType,
} from "@/lib/types/lineup";
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
  description: string | null;
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  hours: Record<string, { open: string; close: string; closed?: boolean }> | null;
  specialties: string[];
  services: string[];
  auto_specialties: boolean;
  integrations: StudioIntegrations | null;
  theme_config: Record<string, unknown> | null;
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
    themeConfig:
      row.theme_config && (row.theme_config as { template?: string }).template
        ? (row.theme_config as unknown as Studio["themeConfig"])
        : undefined,
  };
}

/** Map a DB row to StudioData for the repository/dashboard layer */
export function mapDbStudioToStudioData(row: DbStudio): StudioData {
  return {
    id: row.id,
    images: row.images ?? [],
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
    services: (row.services as StudioData["services"]) ?? [],
    hours: (row.hours as BusinessHours) ?? {},
    autoSpecialties: row.auto_specialties ?? false,
    instagram: row.instagram ?? undefined,
    tiktok: row.tiktok ?? undefined,
    facebook: row.facebook ?? undefined,
    website: row.website ?? undefined,
    integrations: row.integrations ?? undefined,
    themeConfig:
      row.theme_config && (row.theme_config as { template?: string }).template
        ? (row.theme_config as unknown as StudioData["themeConfig"])
        : undefined,
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
  if (data.images !== undefined) mapped.images = data.images;
  if (data.specialties !== undefined) mapped.specialties = data.specialties;
  if (data.hours !== undefined) mapped.hours = data.hours;
  if (data.website !== undefined) mapped.website = data.website;
  if (data.instagram !== undefined) mapped.instagram = data.instagram;
  if (data.tiktok !== undefined) mapped.tiktok = data.tiktok;
  if (data.facebook !== undefined) mapped.facebook = data.facebook;
  if (data.services !== undefined) mapped.services = data.services;
  if (data.autoSpecialties !== undefined) mapped.auto_specialties = data.autoSpecialties;
  if (data.integrations !== undefined) mapped.integrations = data.integrations;
  if (data.themeConfig !== undefined) mapped.theme_config = data.themeConfig;
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

// ─── Artists ─────────────────────────────────────────────────────────────────

export interface DbArtist {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  bio: string | null;
  profile_image: string | null;
  cover_image: string | null;
  studio_id: string | null;
  specialties: string[];
  styles: string[];
  instagram: string | null;
  website: string | null;
  tiktok: string | null;
  facebook: string | null;
  rating: number | null;
  review_count: number;
  verified: boolean;
  years_experience: number | null;
  certifications: string[];
  city: string | null;
  state: string | null;
  source: "google" | "organic";
  claimed_by: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbPortfolioImage {
  id: string;
  artist_id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[];
  sort_order: number;
  created_at: string;
}

/** Card columns for artist list/discover/search views */
export const ARTIST_CARD_COLUMNS =
  "id, name, slug, city, state, rating, review_count, profile_image, source, claimed_by, verified, specialties, styles, years_experience, is_visible" as const;

export const ARTIST_DETAIL_COLUMNS = "*" as const;

export function mapDbPortfolioImageToPortfolioImage(
  row: DbPortfolioImage,
): PortfolioImage {
  return {
    id: row.id,
    url: row.url,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    tags: row.tags ?? [],
    uploadedAt: new Date(row.created_at),
  };
}

/** Map a DB artist row to the app Artist type. Portfolio is fetched separately. */
export function mapDbArtistToArtist(
  row: DbArtist,
  portfolio: DbPortfolioImage[] = [],
): Artist {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio ?? "",
    profileImage: row.profile_image ?? "",
    coverImage: row.cover_image ?? undefined,
    studioId: row.studio_id ?? undefined,
    specialties: row.specialties ?? [],
    styles: (row.styles ?? []) as TattooStyle[],
    portfolioImages: portfolio.map(mapDbPortfolioImageToPortfolioImage),
    socialLinks: {
      instagram: row.instagram ?? undefined,
      website: row.website ?? undefined,
      facebook: row.facebook ?? undefined,
    },
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    verified: row.verified,
    yearsOfExperience: row.years_experience ?? 0,
    certifications: row.certifications ?? [],
    location: { city: row.city ?? "", state: row.state ?? "" },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function artistBadges(row: DbArtist): Badge[] {
  const badges: Badge[] = [];
  if (row.source === "google" && !row.claimed_by) badges.push(UNCLAIMED_BADGE);
  if (row.verified) badges.push({ label: "Verified", color: "sage" });
  return badges;
}

export function mapDbArtistToDiscoverProfile(row: DbArtist): DiscoverProfile {
  return {
    id: row.id,
    name: row.name,
    image: row.profile_image ?? "",
    location: `${row.city ?? ""}, ${row.state ?? ""}`,
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    specialties: row.specialties ?? [],
    verified: row.verified,
    badges: artistBadges(row),
  };
}

export function mapDbArtistToSearchResult(row: DbArtist): SearchResultItem {
  return {
    id: row.id,
    type: "artist",
    name: row.name,
    avatar: row.profile_image ?? "",
    images: [],
    location: `${row.city ?? ""}, ${row.state ?? ""}`,
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    specialties: row.specialties ?? [],
    verified: row.verified,
    yearsOfExperience: row.years_experience ?? undefined,
    badges: artistBadges(row),
  };
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface DbReview {
  id: string;
  target_type: "studio" | "artist";
  target_id: string;
  author_id: string | null;
  author_name: string | null;
  author_image: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  images: string[];
  verified: boolean;
  source: "inked-market" | "google" | "yelp" | "trustpilot";
  created_at: string;
  updated_at: string;
}

export const REVIEW_COLUMNS =
  "id, target_type, target_id, author_id, author_name, author_image, rating, title, content, images, verified, source, created_at, updated_at" as const;

export function mapDbReviewToReview(row: DbReview): Review {
  return {
    id: row.id,
    authorId: row.author_id ?? "",
    authorName: row.author_name ?? "",
    authorImage: row.author_image ?? undefined,
    targetId: row.target_id,
    targetType: row.target_type,
    rating: row.rating,
    title: row.title ?? "",
    content: row.content ?? "",
    images: row.images ?? [],
    verified: row.verified,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ─── Lineup (editorial) ──────────────────────────────────────────────────────

export interface DbSpotlight {
  id: string;
  slug: string;
  type: "artist" | "studio";
  name: string;
  tagline: string | null;
  image: string | null;
  location: string | null;
  specialties: string[];
  badges: Badge[] | null;
  excerpt: string | null;
  content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbLineupArticle {
  id: string;
  slug: string;
  category: string | null;
  headline: string;
  excerpt: string | null;
  body: string | null;
  read_time: string | null;
  published_date: string | null;
  created_at: string;
}

export interface DbLineupEvent {
  id: string;
  type: LineupEventType;
  title: string;
  details: string | null;
  event_date: string | null;
  location: string | null;
  studio_id: string | null;
  artist_id: string | null;
  cta_label: string | null;
  created_at: string;
}

export interface DbLineupIssue {
  id: string;
  number: number;
  issue_date: string | null;
  cover_story_id: string | null;
  studio_of_week_id: string | null;
  culture_article_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbIssueEntry {
  id: string;
  issue_id: string;
  section: "news" | "radar" | "picks" | "events";
  entry_type: "article" | "event" | "artist" | "studio" | "spotlight";
  entry_id: string;
  position: number;
}

export function mapDbSpotlightToSpotlight(row: DbSpotlight): LineupSpotlight {
  return {
    slug: row.slug,
    type: row.type,
    name: row.name,
    tagline: row.tagline ?? "",
    image: row.image ?? "",
    location: row.location ?? "",
    specialties: row.specialties ?? [],
    badges: (row.badges ?? []) as Badge[],
    excerpt: row.excerpt ?? "",
    content: (row.content ?? {
      sections: [],
      portfolioImages: [],
      profileLink: "",
    }) as unknown as SpotlightContent,
  };
}

export function mapDbArticleToArticle(row: DbLineupArticle): LineupArticle {
  return {
    slug: row.slug,
    category: row.category ?? "",
    headline: row.headline,
    excerpt: row.excerpt ?? "",
    readTime: row.read_time ?? "",
    date: row.published_date ?? "",
  };
}

export function mapDbEventToEvent(row: DbLineupEvent): LineupEvent {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    details: row.details ?? "",
    date: row.event_date ?? "",
    location: row.location ?? "",
    shopId: row.studio_id ?? undefined,
    artistId: row.artist_id ?? undefined,
    ctaLabel: row.cta_label ?? "Save Event",
  };
}
