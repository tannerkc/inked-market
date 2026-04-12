import type { TierSlug } from "@/lib/types";

// ─── Integration categories ─────────────────────────────────────────────────

export type IntegrationCategory = "business-profile" | "reviews" | "booking" | "pos";

// ─── Platform identifiers ───────────────────────────────────────────────────

export type BusinessProfilePlatform = "google-business" | "yelp" | "facebook";
export type ReviewPlatform = "google-reviews" | "yelp-reviews";
export type BookingPlatform =
  | "square"
  | "acuity"
  | "calendly"
  | "booksy"
  | "fresha"
  | "daysmart"
  | "vagaro"
  | "other-booking";
export type PosPlatform = "square-pos" | "clover" | "shopify-pos" | "sumup";

export type IntegrationPlatform =
  | BusinessProfilePlatform
  | ReviewPlatform
  | BookingPlatform
  | PosPlatform;

// ─── Connection states ──────────────────────────────────────────────────────

export type IntegrationStatus =
  | "not-connected"
  | "linked"      // URL pasted (all tiers)
  | "connected"   // OAuth complete (tier-gated, future)
  | "syncing"     // Data import in progress (future)
  | "error";      // Last sync or connection failed (future)

// ─── Per-integration record ─────────────────────────────────────────────────

export interface IntegrationRecord {
  status: IntegrationStatus;

  // Link mode
  linkUrl?: string;
  linkedAt?: string;

  // Connect mode (future OAuth)
  accountName?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;

  // Display data (rating badge, sync summary)
  displayRating?: number;
  displayReviewCount?: number;
  displayValue?: string;
}

// ─── Integrations map ───────────────────────────────────────────────────────

export type StudioIntegrations = Partial<Record<IntegrationPlatform, IntegrationRecord>>;

// ─── Platform metadata (static registry) ────────────────────────────────────

export interface IntegrationPlatformMeta {
  id: IntegrationPlatform;
  category: IntegrationCategory;
  name: string;
  description: string;
  urlPlaceholder: string;
  urlPattern: RegExp;
  /** Whether OAuth connect mode is supported (future). Link mode always works. */
  supportsConnect: boolean;
  /** Minimum tier for connect mode. null = link-only. */
  connectMinTier: TierSlug | null;
}

// ─── Category display metadata ──────────────────────────────────────────────

export interface IntegrationCategoryMeta {
  id: IntegrationCategory;
  label: string;
  description: string;
}

// ─── Tier gating ────────────────────────────────────────────────────────────

export type IntegrationFeature =
  | "link"
  | "google-autofill"
  | "review-badges"
  | "booking-connect"
  | "client-import"
  | "pos-connect";
