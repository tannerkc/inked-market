import type { StudioThemeConfig, ResolvedThemeVars } from "@/lib/types/builder";
import { themePresets } from "@/lib/data/theme-presets";
import { hexToRgba, lighten, darken } from "@/lib/utils/color-utils";

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
      vars["--border"] = "#d4c5b0";
      vars["--widget-1"] = bg;
      vars["--widget-2"] = darken(bg, 3);
      vars["--widget-3"] = darken(bg, 6);
      vars["--widget-border"] = "#d4c5b0";
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

  return vars;
}
