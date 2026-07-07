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
  coverImage?: string;
  /** Gallery photo URLs (studios.images), display order = array order. */
  images?: string[];

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
  slug?: string;

  // Builder — the whole studio website template config (persisted as theme_config jsonb).
  themeConfig?: StudioThemeConfig;
}
