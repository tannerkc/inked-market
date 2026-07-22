import type { Studio, CoverFocal } from "@/lib/types";
import type { StudioData, BusinessHours } from "@/lib/repositories/types";
import {
  getBookingLink,
  getBookingEmbed,
  getReviewProfileLinks,
  type ReviewProfileLink,
} from "@/lib/utils/studio-content";

/** A roster artist as the artist-strips section needs it. */
export interface StudioSiteArtist {
  id: string;
  name: string;
  initials: string;
  styles: string[];
  photoCount: number;
  photos: { id: string; url?: string }[];
  profileHref?: string;
  /** Booking entry (/book/[id]) — live artists only; the /book page is authoritative. */
  bookHref?: string;
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
  /** Cover focal point — heroes keep this spot in frame via background-position. */
  coverFocal?: CoverFocal;
  /** Dedicated cover photos — multi-photo heroes lead with these in heroCoverMode "multi". */
  coverImages: string[];
  /** Resolved booking destination (first connected booking-category integration). */
  bookingLink?: { url: string; platformName: string } | null;
  /** Official iframe src for the active booking platform (Calendly/Acuity only) — null for link-out vendors. */
  bookingEmbed?: { src: string; platformName: string } | null;
  /** Connected review-platform profiles (Google/Yelp/Trustpilot/Facebook) with write-review deep links. */
  reviewLinks: ReviewProfileLink[];
  /** Google place id — powers keyless review/maps deep links for Google-seeded studios. */
  googlePlaceId?: string;
  /** True only when the builder's Sample Data toggle is on. Never set for live/public data. */
  isSample?: boolean;
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
  /** booking_mode-aware override: null suppresses the integrations-derived
   * link (mode chosen, not external); undefined keeps legacy behavior. */
  bookingLink?: { url: string; platformName: string } | null;
}

/** Empty-string Studio fields render as absent on the public site. */
const blank = (v: string): string | undefined => v || undefined;

/** Build site data from a public Studio (real content). */
export function studioSiteDataFromStudio(
  studio: Studio,
  extras: SiteDataExtras = {},
): StudioSiteData {
  return {
    name: studio.name,
    bio: blank(studio.bio),
    city: blank(studio.location.city),
    state: blank(studio.location.state),
    address: blank(studio.location.address),
    zipCode: blank(studio.location.zipCode),
    phone: blank(studio.phone),
    email: blank(studio.email),
    specialties: studio.specialties ?? [],
    services: [],
    hours: (studio.openHours as BusinessHours) ?? {},
    instagram: studio.socialLinks?.instagram,
    website: studio.socialLinks?.website,
    facebook: studio.socialLinks?.facebook,
    tiktok: studio.socialLinks?.tiktok,
    images: studio.images ?? [],
    coverImage: blank(studio.coverImage),
    coverFocal: studio.coverFocal,
    coverImages: studio.coverImages ?? [],
    bookingLink:
      extras.bookingLink !== undefined ? extras.bookingLink : getBookingLink(studio.integrations),
    bookingEmbed:
      extras.bookingLink !== undefined ? null : getBookingEmbed(studio.integrations),
    reviewLinks: getReviewProfileLinks(studio.integrations, studio.googlePlaceId),
    googlePlaceId: studio.googlePlaceId,
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
  const d: Partial<StudioData> = data ?? {};
  return {
    name: d.name ?? "",
    bio: d.bio,
    city: d.city,
    state: d.state,
    address: d.address,
    zipCode: d.zipCode,
    phone: d.phone,
    email: d.email,
    specialties: d.specialties ?? [],
    services: d.services ?? [],
    hours: d.hours ?? {},
    instagram: d.instagram,
    website: d.website,
    tiktok: d.tiktok,
    facebook: d.facebook,
    images: d.images ?? [],
    coverImage: d.coverImage,
    coverFocal: d.coverFocal,
    coverImages: d.coverImages ?? [],
    bookingLink: getBookingLink(d.integrations),
    bookingEmbed: getBookingEmbed(d.integrations),
    reviewLinks: getReviewProfileLinks(d.integrations, d.googlePlaceId),
    googlePlaceId: d.googlePlaceId,
    artists: extras.artists ?? [],
    reviews: extras.reviews ?? [],
  };
}
