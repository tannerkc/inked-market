import type { TierSlug } from "@/lib/types";

// ─── Integration categories ─────────────────────────────────────────────────

export type IntegrationCategory = "reviews" | "booking" | "business-profile" | "pos";

// ─── Platform identifiers ───────────────────────────────────────────────────

export type IntegrationPlatform =
  | "google"
  | "yelp"
  | "trustpilot"
  | "facebook"
  | "square"
  | "acuity"
  | "calendly"
  | "booksy"
  | "fresha"
  | "daysmart"
  | "vagaro"
  | "other-booking"
  | "square-pos"
  | "clover"
  | "shopify-pos"
  | "sumup";

// ─── Integration modes ──────────────────────────────────────────────────────

export type IntegrationMode = "integrate" | "import";

// ─── Connection states ──────────────────────────────────────────────────────

export type IntegrationStatus =
  | "not-connected"
  | "connected"   // Active integration/import
  | "syncing"     // Data import in progress
  | "error";      // Last sync failed

// ─── Per-integration record ─────────────────────────────────────────────────

export interface IntegrationRecord {
  status: IntegrationStatus;
  /** Which mode is active for this integration. */
  mode?: IntegrationMode;

  // Connection
  linkUrl?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;

  // Import summary
  importedCount?: number;
  importedLabel?: string;
}

// ─── Integrations map ───────────────────────────────────────────────────────

export type StudioIntegrations = Partial<Record<IntegrationPlatform, IntegrationRecord>>;

// ─── Platform metadata (static registry) ────────────────────────────────────

export interface IntegrationPlatformMeta {
  id: IntegrationPlatform;
  category: IntegrationCategory;
  name: string;
  description: string;
  /** What "Integrate" mode does for this platform. null = not available. */
  integrateLabel: string | null;
  /** What "Import" mode does for this platform. null = not available. */
  importLabel: string | null;
  /** URL placeholder for link/connect input. */
  urlPlaceholder: string;
  urlPattern: RegExp;
  /** Minimum tier required. null = available to all. */
  minTier: TierSlug | null;
}

// ─── Category display metadata ──────────────────────────────────────────────

export interface IntegrationCategoryMeta {
  id: IntegrationCategory;
  label: string;
  description: string;
}
