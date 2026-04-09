import type { StudioThemeConfig, ResolvedThemeVars } from "@/lib/types/builder";
import { themePresets } from "@/lib/data/theme-presets";
import { hexToRgba, lighten, darken, contrastText } from "@/lib/utils/color-utils";

export function resolveTheme(config: StudioThemeConfig): ResolvedThemeVars {
  const preset = themePresets[config.preset];
  const vars = { ...preset.vars };

  // Apply heading/body font overrides
  vars["--heading-font"] = `'${config.headingFont}', sans-serif`;
  vars["--body-font"] = `'${config.bodyFont}', sans-serif`;

  // Apply accent color override
  if (config.accentColor) {
    const accent = config.accentColor;
    vars["--accent"] = accent;
    vars["--accent-bg"] = hexToRgba(accent, 0.1);
    vars["--accent-text"] = contrastText(accent);
    vars["--tag-bg"] = hexToRgba(accent, 0.1);
    vars["--tag-text"] = accent;
    vars["--footer-glow"] = accent;
    vars["--widget-label"] = accent;
  }

  // Apply background override
  if (config.backgroundColor) {
    const bg = config.backgroundColor;
    const mode = config.backgroundMode ?? preset.mode;
    vars["--bg-primary"] = bg;
    vars["--hero-bg"] = bg;

    if (mode === "light") {
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
    } else {
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
  }

  // Secondary accent
  vars["--accent-secondary"] = config.secondaryAccentColor ?? vars["--accent"];

  // Gradient direction
  const gradientMap: Record<string, string> = {
    diagonal: "135deg",
    horizontal: "90deg",
    radial: "radial",
    none: "none",
  };
  vars["--gradient-direction"] = gradientMap[config.gradientDirection ?? "none"] ?? "none";

  // Glow intensity
  const glowMap: Record<string, string> = {
    none: "0",
    subtle: "0.15",
    medium: "0.25",
    intense: "0.4",
  };
  vars["--glow-intensity"] = glowMap[config.glowIntensity ?? "none"] ?? "0";

  // Heading letter spacing
  const spacingMap: Record<string, string> = {
    tight: "-0.02em",
    normal: "0.05em",
    wide: "0.15em",
  };
  vars["--heading-letter-spacing"] = spacingMap[config.headingLetterSpacing ?? "normal"] ?? "0.05em";

  // Heading text transform
  const transformMap: Record<string, string> = {
    uppercase: "uppercase",
    mixed: "none",
    title: "capitalize",
  };
  vars["--heading-text-transform"] = transformMap[config.headingTextTransform ?? "uppercase"] ?? "uppercase";

  // Heading font weight
  const weightMap: Record<string, string> = {
    light: "300",
    regular: "400",
    bold: "700",
    black: "900",
  };
  vars["--heading-font-weight"] = weightMap[config.headingFontWeight ?? "bold"] ?? "700";

  // Density: section padding and element gap
  const paddingMap: Record<string, string> = { compact: "2rem", balanced: "4rem", luxe: "6rem" };
  const gapMap: Record<string, string> = { compact: "0.5rem", balanced: "1rem", luxe: "1.5rem" };
  vars["--section-padding"] = paddingMap[config.density ?? "balanced"] ?? "4rem";
  vars["--element-gap"] = gapMap[config.density ?? "balanced"] ?? "1rem";

  // Border shape
  const radiusMap: Record<string, string> = { sharp: "0", rounded: "0.75rem", editorial: "0.125rem" };
  const radiusLgMap: Record<string, string> = { sharp: "0", rounded: "1rem", editorial: "0.25rem" };
  vars["--border-radius"] = radiusMap[config.borderShape ?? "sharp"] ?? "0";
  vars["--border-radius-lg"] = radiusLgMap[config.borderShape ?? "sharp"] ?? "0";

  // Divider, animation, surface texture (pass through)
  vars["--divider-style"] = config.dividerStyle ?? "solid";
  vars["--animation-style"] = config.animationStyle ?? "none";
  vars["--surface-texture"] = config.surfaceTexture ?? "none";
  vars["--texture-opacity"] = config.textureOpacity?.toString() ?? "0.5";

  // Texture background
  const textureBgMap: Record<string, string> = {
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
  vars["--texture-bg"] =
    textureBgMap[config.surfaceTexture ?? "none"] ?? "none";

  // Image treatment
  const filterMap: Record<string, string> = {
    none: "none",
    bw: "grayscale(1) contrast(1.4) brightness(0.9)",
    duotone: "grayscale(1) contrast(1.1)",
    film: "contrast(0.95) saturate(0.7) sepia(0.15)",
    desat: "saturate(0.2) contrast(1.1)",
    vignette: "saturate(1.1) contrast(1.05)",
  };
  vars["--image-filter"] = filterMap[config.imageTreatment ?? "none"] ?? "none";

  const overlayMap: Record<string, string> = {
    duotone: hexToRgba(vars["--accent"], 0.3),
    desat: hexToRgba(vars["--accent"], 0.1),
    vignette: "radial-gradient(ellipse, transparent 50%, rgba(0,0,0,0.4) 100%)",
  };
  vars["--image-overlay"] = overlayMap[config.imageTreatment ?? "none"] ?? "none";

  return vars;
}
