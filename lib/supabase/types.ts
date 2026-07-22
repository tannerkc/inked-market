import type { Studio, Artist, PortfolioImage, Review, TattooStyle, CoverCrop, CoverFocal } from "@/lib/types";
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
  slug_customized_at: string | null;
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
  published_theme_config: Record<string, unknown> | null;
  published_at: string | null;
  rating: number | null;
  review_count: number;
  profile_image: string | null;
  cover_image: string | null;
  cover_image_original: string | null;
  cover_crop: CoverCrop | null;
  cover_focal: CoverFocal | null;
  cover_images: string[];
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
  "id, name, slug, city, state, rating, review_count, profile_image, cover_image, source, claimed_by, specialties, is_visible" as const;

/** Columns selected for detail page rendering */
export const STUDIO_DETAIL_COLUMNS = "*" as const;

// ─── Mappers ─────────────────────────────────────────────────────────────────

const UNCLAIMED_BADGE: Badge = { label: "Unclaimed", color: "sage" };

/** A theme jsonb only counts as a real config once the builder stamped a template. */
function themeFromJson<T>(json: Record<string, unknown> | null): T | undefined {
  return json && (json as { template?: string }).template
    ? (json as unknown as T)
    : undefined;
}

// DB columns are nullable; these fold nulls into the app-side defaults so each
// mapper states the convention once instead of a `??` branch per field.
const str = (v: string | null): string => v ?? "";
const opt = <T>(v: T | null): T | undefined => v ?? undefined;
const arr = <T>(v: T[] | null): T[] => v ?? [];
const dateOpt = (v: string | null): Date | undefined => (v ? new Date(v) : undefined);

/** Map a DB row to the app's Studio interface */
export function mapDbStudioToStudio(row: DbStudio): Studio {
  return {
    id: row.id,
    name: row.name,
    description: "",
    bio: str(row.bio),
    location: {
      address: str(row.address),
      city: row.city,
      state: row.state,
      zipCode: str(row.zip_code),
      country: "US",
      coordinates: row.latitude && row.longitude
        ? { lat: row.latitude, lng: row.longitude }
        : undefined,
    },
    phone: str(row.phone),
    email: str(row.email),
    socialLinks: {
      instagram: opt(row.instagram),
      tiktok: opt(row.tiktok),
      facebook: opt(row.facebook),
      website: opt(row.website),
    },
    integrations: opt(row.integrations),
    coverImage: str(row.cover_image),
    coverFocal: opt(row.cover_focal),
    coverImages: arr(row.cover_images),
    profileImage: str(row.profile_image),
    images: arr(row.images),
    specialties: arr(row.specialties),
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    verified: row.claimed_by !== null,
    artistIds: [],
    openHours: row.hours as Studio["openHours"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    slug: row.slug,
    source: row.source,
    googlePlaceId: opt(row.google_place_id),
    claimedBy: opt(row.claimed_by),
    claimedAt: dateOpt(row.claimed_at),
    latitude: opt(row.latitude),
    longitude: opt(row.longitude),
    themeConfig: themeFromJson<Studio["themeConfig"]>(row.theme_config),
    publishedThemeConfig: themeFromJson<Studio["themeConfig"]>(row.published_theme_config),
    publishedAt: dateOpt(row.published_at),
    isVisible: row.is_visible,
  };
}

/** Map a DB row to StudioData for the repository/dashboard layer */
export function mapDbStudioToStudioData(row: DbStudio): StudioData {
  return {
    id: row.id,
    images: arr(row.images),
    name: row.name,
    phone: opt(row.phone),
    email: opt(row.email),
    city: row.city,
    state: row.state,
    address: opt(row.address),
    zipCode: opt(row.zip_code),
    bio: str(row.bio),
    profileImage: opt(row.profile_image),
    coverImage: opt(row.cover_image),
    coverImageOriginal: opt(row.cover_image_original),
    coverCrop: opt(row.cover_crop),
    coverFocal: opt(row.cover_focal),
    coverImages: arr(row.cover_images),
    specialties: arr(row.specialties),
    services: (row.services as StudioData["services"]) ?? [],
    hours: (row.hours as BusinessHours) ?? {},
    autoSpecialties: row.auto_specialties ?? false,
    instagram: opt(row.instagram),
    tiktok: opt(row.tiktok),
    facebook: opt(row.facebook),
    website: opt(row.website),
    integrations: opt(row.integrations),
    googlePlaceId: opt(row.google_place_id),
    themeConfig: themeFromJson<StudioData["themeConfig"]>(row.theme_config),
    publishedThemeConfig: themeFromJson<StudioData["themeConfig"]>(row.published_theme_config),
    publishedAt: opt(row.published_at),
    source: row.source,
    claimedBy: opt(row.claimed_by),
    slug: row.slug,
    slugCustomizedAt: opt(row.slug_customized_at),
    isVisible: row.is_visible,
  };
}

/** camelCase → snake_case columns written only when defined
 *  (partial-update semantics: absent fields are left untouched). */
const STUDIO_UPDATE_COLUMNS = {
  name: "name",
  phone: "phone",
  email: "email",
  city: "city",
  state: "state",
  address: "address",
  zipCode: "zip_code",
  bio: "bio",
  profileImage: "profile_image",
  images: "images",
  coverImages: "cover_images",
  specialties: "specialties",
  hours: "hours",
  website: "website",
  instagram: "instagram",
  tiktok: "tiktok",
  facebook: "facebook",
  services: "services",
  autoSpecialties: "auto_specialties",
  integrations: "integrations",
  themeConfig: "theme_config",
  slug: "slug",
  isVisible: "is_visible",
} as const satisfies Partial<Record<keyof StudioData, string>>;

/** Columns mapped on key-PRESENCE so an explicit `field: undefined` clears the
 *  DB column (removeCover / reset-framing / un-publish must actually clear). */
const STUDIO_CLEARABLE_COLUMNS = {
  coverImage: "cover_image",
  coverImageOriginal: "cover_image_original",
  coverCrop: "cover_crop",
  coverFocal: "cover_focal",
  publishedThemeConfig: "published_theme_config",
  publishedAt: "published_at",
} as const satisfies Partial<Record<keyof StudioData, string>>;

/** Map StudioData (partial) to DB row shape for inserts/updates */
export function mapStudioDataToDbStudio(
  data: Partial<StudioData>
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(STUDIO_UPDATE_COLUMNS)) {
    const value = data[key as keyof StudioData];
    if (value !== undefined) mapped[column] = value;
  }
  for (const [key, column] of Object.entries(STUDIO_CLEARABLE_COLUMNS)) {
    if (key in data) mapped[column] = data[key as keyof StudioData] ?? null;
  }
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
    slug: row.slug,
    name: row.name,
    image: row.cover_image ?? row.profile_image ?? "",
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
    slug: row.slug,
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
  slug_customized_at: string | null;
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
    bio: str(row.bio),
    profileImage: str(row.profile_image),
    coverImage: opt(row.cover_image),
    studioId: opt(row.studio_id),
    specialties: arr(row.specialties),
    styles: (row.styles ?? []) as TattooStyle[],
    portfolioImages: portfolio.map(mapDbPortfolioImageToPortfolioImage),
    socialLinks: {
      instagram: opt(row.instagram),
      website: opt(row.website),
      facebook: opt(row.facebook),
    },
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    verified: row.verified,
    yearsOfExperience: row.years_experience ?? 0,
    certifications: arr(row.certifications),
    location: { city: str(row.city), state: str(row.state) },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    slug: row.slug,
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
    slug: row.slug,
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
    slug: row.slug,
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
