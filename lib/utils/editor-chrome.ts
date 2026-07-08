import type { BuilderMode, BuilderTier, StudioThemeConfig } from "@/lib/types/builder";

/**
 * Editor-chrome preference resolution (inline/split mode, flash/custom tier).
 *
 * These are EDITOR preferences, not site content: the user's freshest explicit
 * choice (localStorage — written by the dashboard card, settings page, and the
 * builder itself) always wins. The DB-saved theme_config value is only a seed
 * for brand-new devices where no local preference exists yet.
 *
 * Root cause this encodes: the hydrate previously preferred the DB config's
 * captured builderMode over localStorage, so the mode toggles were silently
 * ignored once a studio had ever saved (always, in the live-data flow).
 */
export function resolveEditorChrome(
  stored: { mode: BuilderMode | null; tier: BuilderTier | null },
  config: Pick<StudioThemeConfig, "builderMode" | "builderTier"> | null,
): { mode: BuilderMode; tier: BuilderTier } {
  return {
    mode: stored.mode ?? config?.builderMode ?? "inline",
    tier: stored.tier ?? config?.builderTier ?? "flash",
  };
}
