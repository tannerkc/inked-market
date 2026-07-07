import type { StudioThemeConfig, TemplateSlug } from "@/lib/types/builder";

/**
 * Retired template slugs → surviving templates (9 → 7 consolidation).
 * Applied at every config-read boundary so saved theme_config jsonb,
 * localStorage drafts, and per-template draft caches keep working.
 */
export const LEGACY_TEMPLATE_MAP: Record<string, TemplateSlug> = {
  "immersive-dark": "dark-cinematic",
  "clean-minimal": "studio-minimal",
};

/** Rewrite a config whose template slug was retired. Returns input unchanged when current. */
export function remapLegacyTemplate(config: StudioThemeConfig): StudioThemeConfig {
  const mapped = LEGACY_TEMPLATE_MAP[config.template as string];
  if (!mapped) return config;
  if (process.env.NODE_ENV === "development") {
    console.info(`[builder] remapped legacy template "${config.template}" → "${mapped}"`);
  }
  return { ...config, template: mapped };
}
