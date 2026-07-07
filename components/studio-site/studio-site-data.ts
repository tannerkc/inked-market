import type { Studio } from "@/lib/types";
import type { StudioData, BusinessHours } from "@/lib/repositories/types";
import type { StudioIntegrations } from "@/lib/types/integrations";
import { getBookingLink } from "@/lib/utils/studio-content";

/** A roster artist as the artist-strips section needs it. */
export interface StudioSiteArtist {
  id: string;
  name: string;
  initials: string;
  styles: string[];
  photoCount: number;
  photos: { id: string; url?: string }[];
  profileHref?: string;
}

/** A review as the details section needs it. */
export interface StudioSiteReview {
  author: string;
  stars: number;
  text: string;
}

/**
 * The complete data contract the studio-site sections consume. Resolved upstream
 * from either a public Studio (real data) or the builder's StudioData (+ demo
 * injection), so the sections themselves are data-source agnostic.
 */
export interface StudioSiteData {
  name: string;
  bio?: string;
  city?: string;
  state?: string;
  address?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  specialties: string[];
  services: ("walk-ins" | "piercing")[];
  hours: BusinessHours;
  instagram?: string;
  website?: string;
  tiktok?: string;
  facebook?: string;
  /** Gallery photos. Empty → sections render their designed empty state. */
  images: string[];
  /** Hero cover photo URL. Unset → hero renders its designed placeholder texture. */
  coverImage?: string;
  /** Resolved booking destination (first connected booking-category integration). */
  bookingLink?: { url: string; platformName: string } | null;
  /** Studio roster. Empty → artist-strips section hides itself. */
  artists: StudioSiteArtist[];
  /** Reviews. Empty → reviews widget collapses. */
  reviews: StudioSiteReview[];
  rating?: number;
  reviewCount?: number;
  /** Pre-formatted average ("4.9") for display. */
  ratingAverage?: string;
}

interface SiteDataExtras {
  artists?: StudioSiteArtist[];
  reviews?: StudioSiteReview[];
}

/** Build site data from a public Studio (real content). */
export function studioSiteDataFromStudio(
  studio: Studio,
  extras: SiteDataExtras = {},
): StudioSiteData {
  return {
    name: studio.name,
    bio: studio.bio || undefined,
    city: studio.location.city || undefined,
    state: studio.location.state || undefined,
    address: studio.location.address || undefined,
    zipCode: studio.location.zipCode || undefined,
    phone: studio.phone || undefined,
    email: studio.email || undefined,
    specialties: studio.specialties ?? [],
    services: [],
    hours: (studio.openHours as BusinessHours) ?? {},
    instagram: studio.socialLinks?.instagram,
    website: studio.socialLinks?.website,
    facebook: studio.socialLinks?.facebook,
    images: studio.images ?? [],
    coverImage: studio.coverImage || undefined,
    bookingLink: getBookingLink(studio.integrations as StudioIntegrations | undefined),
    artists: extras.artists ?? [],
    reviews: extras.reviews ?? [],
    rating: studio.rating,
    reviewCount: studio.reviewCount,
    ratingAverage: studio.rating ? studio.rating.toFixed(1) : undefined,
  };
}

/** Build site data from the builder's editable StudioData (+ demo injection). */
export function studioSiteDataFromStudioData(
  data: StudioData | null,
  extras: SiteDataExtras = {},
): StudioSiteData {
  return {
    name: data?.name ?? "",
    bio: data?.bio,
    city: data?.city,
    state: data?.state,
    address: data?.address,
    zipCode: data?.zipCode,
    phone: data?.phone,
    email: data?.email,
    specialties: data?.specialties ?? [],
    services: data?.services ?? [],
    hours: data?.hours ?? {},
    instagram: data?.instagram,
    website: data?.website,
    tiktok: data?.tiktok,
    facebook: data?.facebook,
    images: data?.images ?? [],
    coverImage: data?.coverImage,
    bookingLink: getBookingLink(data?.integrations),
    artists: extras.artists ?? [],
    reviews: extras.reviews ?? [],
  };
}
