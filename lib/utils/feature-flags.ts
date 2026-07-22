import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Seed config cache ──────────────────────────────────────────────────────
// Cache seed_config reads for 60s to avoid hitting Supabase on every request.
// NOTE: In serverless environments (Vercel), this cache is per-instance and
// best-effort. After toggling a flag, some instances may serve stale data
// for up to 60s until their cache expires or they cold-start.

interface CacheEntry {
  data: Record<string, boolean>;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
let configCache: CacheEntry | null = null;

async function getSeedConfigMap(
  supabase: SupabaseClient
): Promise<Record<string, boolean>> {
  if (configCache && Date.now() < configCache.expiresAt) {
    return configCache.data;
  }

  const { data, error } = await supabase
    .from("seed_config")
    .select("key, enabled");

  if (error || !data) return {};

  const map: Record<string, boolean> = {};
  for (const row of data) {
    map[row.key] = row.enabled;
  }

  configCache = { data: map, expiresAt: Date.now() + CACHE_TTL_MS };
  return map;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Level 1: Env var kill switch. If false, all seeded listings are hidden. */
export function isSeededListingsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SEEDED_LISTINGS_ENABLED !== "false";
}

/** Build a city key for seed_config lookup. e.g. "Austin", "TX" → "city:austin_tx" */
export function cityConfigKey(city: string, state: string): string {
  return `city:${city.toLowerCase().replace(/\s+/g, "_")}_${state.toLowerCase()}`;
}

/**
 * Full 4-level visibility check for a single seeded studio.
 * Organic studios always return true.
 */
export async function isSeededVisible(
  studio: { source?: string; isVisible?: boolean; city: string; state: string },
  supabase: SupabaseClient
): Promise<boolean> {
  // Organic listings are always visible (flag system doesn't apply)
  if (studio.source !== "google") return true;

  // Level 1: Env var
  if (!isSeededListingsEnabled()) return false;

  // Level 4: Per-listing (checked first since it's cheapest — no DB call)
  if (studio.isVisible === false) return false;

  const config = await getSeedConfigMap(supabase);

  // Level 2: Global toggle
  if (config["global_seeded_visible"] === false) return false;

  // Level 3: Per-city toggle
  const key = cityConfigKey(studio.city, studio.state);
  if (config[key] === false) return false;

  return true;
}

/**
 * Get list of enabled city config keys for efficient query-level filtering.
 * Returns null if all cities are enabled (no restriction needed).
 */
export async function getDisabledCityKeys(
  supabase: SupabaseClient
): Promise<string[] | null> {
  const config = await getSeedConfigMap(supabase);

  // If global is off, no cities are enabled
  if (config["global_seeded_visible"] === false) return [];

  // Collect disabled cities
  const disabledCities: string[] = [];
  for (const [key, enabled] of Object.entries(config)) {
    if (key.startsWith("city:") && !enabled) {
      disabledCities.push(key);
    }
  }

  // If no cities are disabled, return null (no filtering needed)
  if (disabledCities.length === 0) return null;

  return disabledCities;
}

/** Invalidate the seed config cache (call after admin changes) */
export function invalidateSeedConfigCache(): void {
  configCache = null;
}
