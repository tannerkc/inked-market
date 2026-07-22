import React from "react";
import { cn } from "@/lib/utils";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import type { InkAccentColor } from "@/lib/types";
import { accentColorMap, glowMap } from "@/lib/constants/color-maps";

type AccentColor = InkAccentColor;

interface PageHeroProps {
  headline: string;
  subtitle: string;
  accentColor?: AccentColor;
  eyebrow?: string;
  description?: string;
  statusText?: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHero = React.forwardRef<HTMLElement, PageHeroProps>(
  (
    {
      headline,
      subtitle,
      accentColor = "rust",
      eyebrow,
      description,
      statusText,
      children,
      className,
    },
    ref
  ) => (
    <header
      ref={ref}
      className={cn(
        "relative pt-28 pb-16 px-6 md:px-12 text-center overflow-hidden",
        className
      )}
    >
      <div className={cn("absolute inset-0", glowMap[accentColor])} />
      <div className="hidden dark:block">
        <FilmGrainOverlay className="opacity-[0.03] fixed" />
      </div>

      <div className="relative z-10">
        {eyebrow && <Eyebrow text={eyebrow} color={accentColor} />}

        <Headline
          variant="solid"
          text={headline}
          size="lg"
          colorClass="text-ink-black dark:text-ink-cream"
        />

        <Subtitle text={subtitle} variant="divider" />

        {description && (
          <p className="text-sm mt-4 max-w-lg mx-auto leading-relaxed text-ink-black/35 dark:text-ink-cream/30">
            {description}
          </p>
        )}

        {statusText && (
          <div className={cn(
            "mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border",
            "border-ink-black/[0.06] bg-ink-black/[0.03]",
            "dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.03]"
          )}>
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                accentColorMap[accentColor]
              )}
            />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/40 dark:text-ink-cream/40">
              {statusText}
            </span>
          </div>
        )}

        {children}
      </div>
    </header>
  )
);
PageHero.displayName = "PageHero";

export { PageHero };
export type { PageHeroProps, AccentColor };
