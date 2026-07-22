import type { InkAccentColor } from "@/lib/types";

export const accentColorMap: Record<InkAccentColor, string> = {
  sage: "bg-ink-sage shadow-[0_0_6px_rgba(107,124,94,0.4)]",
  rust: "bg-ink-rust shadow-[0_0_6px_rgba(193,68,14,0.4)]",
  red: "bg-ink-red shadow-[0_0_6px_color-mix(in_srgb,var(--ink-red)_40%,transparent)]",
};

export const dotColorMap: Record<InkAccentColor, string> = {
  red: "bg-ink-red shadow-[0_0_5px_color-mix(in_srgb,var(--ink-red)_30%,transparent)]",
  rust: "bg-ink-rust shadow-[0_0_5px_rgba(183,118,74,0.3)]",
  sage: "bg-ink-sage shadow-[0_0_5px_rgba(122,140,110,0.3)]",
};

export const glowMap: Record<InkAccentColor, string> = {
  sage: "bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-sage)_6%,transparent),transparent_60%)]",
  rust: "bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-rust)_8%,transparent),transparent_60%)]",
  red: "bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-red)_8%,transparent),transparent_60%)]",
};
