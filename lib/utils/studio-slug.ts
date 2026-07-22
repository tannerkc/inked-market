import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/utils";

/** Minimum length for a custom URL path (studios and artists). */
export const MIN_SLUG_LENGTH = 3;

/** Tables with a public slug namespace (/studios/*, /artists/*). */
export type SluggedTable = "studios" | "artists";

/**
 * Pretty, human URL path: name-city-state
 * (e.g. /studios/drunken-regurts-raleigh-nc). Numbers are only appended
 * on conflict — see ensureUniqueSlug.
 */
export function buildStudioSlug(name: string, city?: string, state?: string): string {
  return slugify([name, city, state].filter(Boolean).join(" "));
}

/** Normalize user-typed slug input: lowercase, a-z 0-9 and hyphens only. */
export function sanitizeSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "");
}

/** True when no OTHER row in the table already owns this slug. */
export async function isSlugAvailable(
  supabase: SupabaseClient,
  table: SluggedTable,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const { data } = await supabase
    .from(table)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return !data || data.id === excludeId;
}

/**
 * Returns `desired` when free, otherwise the first free numeric variant
 * (desired-2, desired-3, …). The DB unique constraint is the backstop for
 * the race window between check and insert.
 */
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const { data } = await supabase
    .from("studios")
    .select("id, slug")
    .like("slug", `${desired}%`);
  const taken = new Set(
    (data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug as string),
  );
  if (!taken.has(desired)) return desired;
  for (let n = 2; n < 100; n++) {
    if (!taken.has(`${desired}-${n}`)) return `${desired}-${n}`;
  }
  // ponytail: 100 same-named studios in one city won't happen; timestamp saves the day if it does
  return `${desired}-${Date.now().toString(36)}`;
}
