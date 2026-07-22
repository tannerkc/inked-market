import type { CoverCrop, CoverFocal } from "@/lib/types";
import type { StudioIntegrations } from "@/lib/types/integrations";
import type { StudioThemeConfig } from "@/lib/types/builder";

// ─── Repository base interface ────────────────────────────────────────────────
// All methods are async (Promise-returning) so LocalStorage and API
// implementations are drop-in swaps — callers never change.

export interface Repository<T> {
  get(): Promise<T | null>;
  /** Merge-patch: merges partial into existing data, never wipes unset fields. */
  set(partial: Partial<T>): Promise<void>;
  clear(): Promise<void>;
}

// ─── Business hours ───────────────────────────────────────────────────────────

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export type BusinessHours = Record<string, DayHours>;

// ─── StudioData ───────────────────────────────────────────────────────────────
// Canonical schema for all non-auth studio fields.
// Auth fields (id, email, role, token) stay in AuthUser.
// This type is the single source of truth for the repository layer —
// shape it to match the future API response and the migration is trivial.

export interface StudioData {
  // Identity
  name: string;
  /** Studio row uuid (studios.id). Read-only — populated by the Supabase repo, never written back. */
  id?: string;

  // Contact & Location
  phone?: string;
  /** Studio public contact email — may differ from auth login email. */
  email?: string;
  city?: string;
  state?: string;
  /** Street address line 1. */
  address?: string;
  zipCode?: string;

  // Content
  /** About / story text shown in the About section. */
  bio?: string;
  profileImage?: string;
  /** Displayed cover — a derived (cropped) asset once framing has been applied. */
  coverImage?: string;
  /** Pristine cover upload, kept for non-destructive re-editing. */
  coverImageOriginal?: string;
  /** Crop rect normalized against the original (restores the framing editor). */
  coverCrop?: CoverCrop;
  /** Focal point within the displayed cover (drives background-position). */
  coverFocal?: CoverFocal;
  /** Gallery photo URLs (studios.images), display order = array order. */
  images?: string[];
  /** Dedicated cover photos for multi-photo heroes (studios.cover_images). */
  coverImages?: string[];

  // Business
  specialties: string[];
  services: ("walk-ins" | "piercing")[];
  hours: BusinessHours;
  autoSpecialties: boolean;

  // Social
  instagram?: string;
  website?: string;
  tiktok?: string;
  facebook?: string;

  // Integrations
  integrations?: StudioIntegrations;

  // Source tracking (populated by Supabase, optional for backwards compat)
  source?: "google" | "organic";
  claimedBy?: string;
  /** Listed on the marketplace (studios.is_visible). False = draft — the
   *  public page 404s and the studio is excluded from discover/search. */
  isVisible?: boolean;
  /** Public URL path (/studios/[slug]). Writable — owners can customize it ONCE
   *  (LinkedIn-style; DB trigger enforces); generated as name-city-state on
   *  first save (see lib/utils/studio-slug). */
  slug?: string;
  /** ISO timestamp of the one-shot slug customization (slug_customized_at).
   *  Read-only — the DB trigger stamps it; set = URL is locked. */
  slugCustomizedAt?: string;
  /** Google place id (studios.google_place_id). Read-only — powers review/maps deep links, never written back. */
  googlePlaceId?: string;

  // Builder — the whole studio website template config (persisted as theme_config jsonb).
  themeConfig?: StudioThemeConfig;
  /** Live site theme (published_theme_config) — Publish copies the draft here. */
  publishedThemeConfig?: StudioThemeConfig;
  /** ISO timestamp of the last publish (published_at). */
  publishedAt?: string;
}
