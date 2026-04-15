import React from "react";
import { cn } from "@/lib/utils";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import type { InkAccentColor } from "@/lib/types";

type AccentColor = InkAccentColor;

interface PageHeroProps {
  headline: string;
  subtitle: string;
  accentColor?: AccentColor;
  variant?: "light" | "dark";
  eyebrow?: string;
  description?: string;
  statusText?: string;
  children?: React.ReactNode;
  className?: string;
}

const accentColorMap: Record<AccentColor, string> = {
  sage: "bg-ink-sage shadow-[0_0_6px_rgba(107,124,94,0.4)]",
  rust: "bg-ink-rust shadow-[0_0_6px_rgba(193,68,14,0.4)]",
  red: "bg-ink-red shadow-[0_0_6px_color-mix(in_srgb,var(--ink-red)_40%,transparent)]",
};

const glowMap: Record<AccentColor, string> = {
  sage: "bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-sage)_6%,transparent),transparent_60%)]",
  rust: "bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-rust)_8%,transparent),transparent_60%)]",
  red: "bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-red)_8%,transparent),transparent_60%)]",
};

const PageHero = React.forwardRef<HTMLElement, PageHeroProps>(
  (
    {
      headline,
      subtitle,
      accentColor = "rust",
      variant = "dark",
      eyebrow,
      description,
      statusText,
      children,
      className,
    },
    ref
  ) => {
    const isDark = variant === "dark";

    return (
      <header
        ref={ref}
        className={cn(
          "relative pt-28 pb-16 px-6 md:px-12 text-center overflow-hidden",
          className
        )}
      >
        <div className={cn("absolute inset-0", glowMap[accentColor])} />
        {isDark && <FilmGrainOverlay className="opacity-[0.03] fixed" />}

        <div className="relative z-10">
          {eyebrow && (
            <Eyebrow text={eyebrow} color={accentColor} />
          )}

          <Headline
            variant="solid"
            text={headline}
            size="lg"
            colorClass={isDark ? "text-ink-cream" : "text-ink-black"}
          />

          <Subtitle
            text={subtitle}
            variant="divider"
            colorClass={isDark ? "dark" : "light"}
          />

          {description && (
            <p className={cn(
              "text-sm mt-4 max-w-lg mx-auto leading-relaxed",
              isDark ? "text-ink-cream/30" : "text-ink-black/35"
            )}>
              {description}
            </p>
          )}

          {statusText && (
            <div className={cn(
              "mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border",
              isDark
                ? "border-ink-cream/[0.06] bg-ink-cream/[0.03]"
                : "border-ink-black/[0.06] bg-ink-black/[0.03]"
            )}>
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  accentColorMap[accentColor]
                )}
              />
              <span className={cn(
                "font-mono text-[10px] tracking-[0.15em] uppercase",
                isDark ? "text-ink-cream/40" : "text-ink-black/40"
              )}>
                {statusText}
              </span>
            </div>
          )}

          {children}
        </div>
      </header>
    );
  }
);
PageHero.displayName = "PageHero";

export { PageHero };
export type { PageHeroProps, AccentColor };
