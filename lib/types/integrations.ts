import type { TierSlug } from "@/lib/types";

// ─── Integration categories ─────────────────────────────────────────────────

export type IntegrationCategory = "reviews" | "booking" | "business-profile" | "pos";

// ─── Platform identifiers ───────────────────────────────────────────────────

export type IntegrationPlatform =
  | "google"
  | "yelp"
  | "trustpilot"
  | "facebook"
  | "instagram"
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
  /** Display name of the linked external account (OAuth connections only). */
  accountName?: string;

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
  /**
   * Official no-JS iframe embedding, for the few vendors that document it
   * (Calendly, Acuity). `hosts` is the allowlist of registrable domains a
   * stored URL must resolve to before it is ever used as an iframe src —
   * re-checked at render time, never trusted from storage.
   */
  embed?: { hosts: string[] };
  /**
   * True when the platform supports linking an account via OAuth
   * (server routes at /api/integrations/[platform]/...). Tokens live in the
   * service-role-only studio_connections table; the client only ever sees
   * the IntegrationRecord projection.
   */
  oauth?: boolean;
  /** Label for the post-connect data pull button (platforms with an import route). */
  oauthImportLabel?: string;
}

// ─── Category display metadata ──────────────────────────────────────────────

export interface IntegrationCategoryMeta {
  id: IntegrationCategory;
  label: string;
  description: string;
}
