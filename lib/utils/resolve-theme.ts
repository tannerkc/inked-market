import type { StudioThemeConfig, ResolvedThemeVars } from "@/lib/types/builder";
import { themePresets } from "@/lib/data/theme-presets";
import { hexToRgba, lighten, darken, contrastText } from "@/lib/utils/color-utils";

const GRADIENT_DIRECTION: Record<string, string> = {
  diagonal: "135deg",
  horizontal: "90deg",
  radial: "radial",
  none: "none",
};

const GLOW_INTENSITY: Record<string, string> = {
  none: "0",
  subtle: "0.15",
  medium: "0.25",
  intense: "0.4",
};

const HEADING_LETTER_SPACING: Record<string, string> = {
  tight: "-0.02em",
  normal: "0.05em",
  wide: "0.15em",
};

const HEADING_TEXT_TRANSFORM: Record<string, string> = {
  uppercase: "uppercase",
  mixed: "none",
  title: "capitalize",
};

const HEADING_FONT_WEIGHT: Record<string, string> = {
  light: "300",
  regular: "400",
  bold: "700",
  black: "900",
};

const SECTION_PADDING: Record<string, string> = {
  compact: "2rem",
  balanced: "4rem",
  luxe: "6rem",
};

const ELEMENT_GAP: Record<string, string> = {
  compact: "0.5rem",
  balanced: "1rem",
  luxe: "1.5rem",
};

const BORDER_RADIUS: Record<string, string> = {
  sharp: "0",
  rounded: "0.75rem",
  editorial: "0.125rem",
};

const BORDER_RADIUS_LG: Record<string, string> = {
  sharp: "0",
  rounded: "1rem",
  editorial: "0.25rem",
};

const TEXTURE_BG: Record<string, string> = {
  none: "none",
  "film-grain": `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  parchment:
    "repeating-radial-gradient(circle at 40% 30%, rgba(180,160,120,0.08) 0px, transparent 1px), repeating-radial-gradient(circle at 60% 70%, rgba(180,160,120,0.06) 0px, transparent 1px)",
  concrete: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
  leather:
    "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139,90,43,0.05) 2px, rgba(139,90,43,0.05) 4px), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(139,90,43,0.04) 2px, rgba(139,90,43,0.04) 4px)",
  geometric:
    "repeating-linear-gradient(60deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px), repeating-linear-gradient(-60deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)",
};

const IMAGE_FILTER: Record<string, string> = {
  none: "none",
  bw: "grayscale(1) contrast(1.4) brightness(0.9)",
  duotone: "grayscale(1) contrast(1.1)",
  film: "contrast(0.95) saturate(0.7) sepia(0.15)",
  desat: "saturate(0.2) contrast(1.1)",
  vignette: "saturate(1.1) contrast(1.05)",
};

function lookup<T extends string>(map: Record<string, T>, key: string | undefined, fallback: T): T {
  if (key === undefined) return fallback;
  const value = map[key];
  return value === undefined ? fallback : value;
}

function applyFonts(vars: ResolvedThemeVars, config: StudioThemeConfig): void {
  vars["--heading-font"] = `'${config.headingFont}', sans-serif`;
  vars["--body-font"] = `'${config.bodyFont}', sans-serif`;
}

function applyAccent(vars: ResolvedThemeVars, accent: string): void {
  vars["--accent"] = accent;
  vars["--accent-bg"] = hexToRgba(accent, 0.1);
  vars["--accent-text"] = contrastText(accent);
  vars["--tag-bg"] = hexToRgba(accent, 0.1);
  vars["--tag-text"] = accent;
  vars["--footer-glow"] = accent;
  vars["--widget-label"] = accent;
}

function applyLightBackground(vars: ResolvedThemeVars, bg: string): void {
  vars["--bg-raised"] = darken(bg, 3);
  vars["--bg-sunken"] = darken(bg, 6);
  vars["--bg-deep"] = darken(bg, 10);
  vars["--text-primary"] = "#1a1a1a";
  vars["--text-secondary"] = "#666666";
  vars["--text-muted"] = "#999999";
  vars["--border"] = darken(bg, 10);
  vars["--widget-1"] = bg;
  vars["--widget-2"] = darken(bg, 3);
  vars["--widget-3"] = darken(bg, 6);
  vars["--widget-border"] = darken(bg, 10);
}

function applyDarkBackground(vars: ResolvedThemeVars, bg: string): void {
  vars["--bg-raised"] = lighten(bg, 3);
  vars["--bg-sunken"] = lighten(bg, 1);
  vars["--bg-deep"] = darken(bg, 1);
  vars["--text-primary"] = "#ededed";
  vars["--text-secondary"] = "#888888";
  vars["--text-muted"] = "#555555";
  vars["--border"] = "#222222";
  vars["--widget-1"] = lighten(bg, 3);
  vars["--widget-2"] = lighten(bg, 1);
  vars["--widget-3"] = bg;
  vars["--widget-border"] = "transparent";
}

function applyBackground(
  vars: ResolvedThemeVars,
  bg: string,
  mode: "light" | "dark"
): void {
  vars["--bg-primary"] = bg;
  vars["--hero-bg"] = bg;
  if (mode === "light") applyLightBackground(vars, bg);
  else applyDarkBackground(vars, bg);
}

function applyTypographyTokens(vars: ResolvedThemeVars, config: StudioThemeConfig): void {
  vars["--heading-letter-spacing"] = lookup(HEADING_LETTER_SPACING, config.headingLetterSpacing, "0.05em");
  vars["--heading-text-transform"] = lookup(HEADING_TEXT_TRANSFORM, config.headingTextTransform, "uppercase");
  vars["--heading-font-weight"] = lookup(HEADING_FONT_WEIGHT, config.headingFontWeight, "700");
}

function applyDensity(vars: ResolvedThemeVars, config: StudioThemeConfig): void {
  vars["--section-padding"] = lookup(SECTION_PADDING, config.density, "4rem");
  vars["--element-gap"] = lookup(ELEMENT_GAP, config.density, "1rem");
}

function applyBorders(vars: ResolvedThemeVars, config: StudioThemeConfig): void {
  vars["--border-radius"] = lookup(BORDER_RADIUS, config.borderShape, "0");
  vars["--border-radius-lg"] = lookup(BORDER_RADIUS_LG, config.borderShape, "0");
}

function applySurface(vars: ResolvedThemeVars, config: StudioThemeConfig): void {
  vars["--divider-style"] = config.dividerStyle ?? "solid";
  vars["--animation-style"] = config.animationStyle ?? "none";
  vars["--surface-texture"] = config.surfaceTexture ?? "none";
  vars["--texture-opacity"] = config.textureOpacity?.toString() ?? "0.5";
  vars["--texture-bg"] = lookup(TEXTURE_BG, config.surfaceTexture, "none");
}

function applyImageTreatment(vars: ResolvedThemeVars, config: StudioThemeConfig): void {
  const treatment = config.imageTreatment ?? "none";
  vars["--image-filter"] = lookup(IMAGE_FILTER, treatment, "none");

  const accent = vars["--accent"];
  if (treatment === "duotone") vars["--image-overlay"] = hexToRgba(accent, 0.3);
  else if (treatment === "desat") vars["--image-overlay"] = hexToRgba(accent, 0.1);
  else if (treatment === "vignette") vars["--image-overlay"] = "radial-gradient(ellipse, transparent 50%, rgba(0,0,0,0.4) 100%)";
  else vars["--image-overlay"] = "none";
}

export function resolveTheme(config: StudioThemeConfig): ResolvedThemeVars {
  const preset = themePresets[config.preset];
  const vars: ResolvedThemeVars = { ...preset.vars };

  applyFonts(vars, config);

  if (config.accentColor) applyAccent(vars, config.accentColor);

  if (config.backgroundColor) {
    applyBackground(vars, config.backgroundColor, config.backgroundMode ?? preset.mode);
  }

  vars["--accent-secondary"] = config.secondaryAccentColor ?? vars["--accent"];
  vars["--gradient-direction"] = lookup(GRADIENT_DIRECTION, config.gradientDirection, "none");
  vars["--glow-intensity"] = lookup(GLOW_INTENSITY, config.glowIntensity, "0");

  applyTypographyTokens(vars, config);
  applyDensity(vars, config);
  applyBorders(vars, config);
  applySurface(vars, config);
  applyImageTreatment(vars, config);

  return vars;
}
