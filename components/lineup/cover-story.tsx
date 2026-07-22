import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { permanentMarker, bebasNeue } from "@/lib/fonts";
import { badgeColorMap } from "@/lib/data/discover";
import type { LineupSpotlight } from "@/lib/types/lineup";

export interface CoverStoryProps {
  spotlight: LineupSpotlight;
  issueLabel?: string;
  className?: string;
}

const CoverStory = React.forwardRef<HTMLDivElement, CoverStoryProps>(
  ({ spotlight, issueLabel = "This Week's Feature", className }, ref) => {
    const { slug, name, tagline, image, specialties, badges, excerpt } = spotlight;

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl overflow-hidden border transition-colors duration-500",
          "border-ink-black/[0.08] dark:border-ink-cream/[0.06]",
          className
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          {/* Image Panel */}
          <div className="relative min-h-[260px] md:min-h-[360px] overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-600 group-hover:scale-[1.03]"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-black/40 to-transparent" />
            {badges.length > 0 && (
              <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] uppercase text-white backdrop-blur-md",
                      badgeColorMap[badge.color]
                    )}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Text Panel */}
          <div className="p-8 md:p-10 flex flex-col justify-center border-t md:border-t-0 md:border-l transition-colors duration-500 bg-ink-cream/50 border-ink-black/[0.06] dark:bg-ink-cream/[0.02] dark:border-ink-cream/[0.04]">
            <p className={`${permanentMarker.className} text-xs text-ink-red tracking-[0.15em] -rotate-1 inline-block mb-3`}>
              {issueLabel}
            </p>
            <h3 className={`${bebasNeue.className} text-3xl md:text-4xl tracking-wider leading-[1.1] transition-colors duration-500 text-ink-black dark:text-ink-cream`}>
              {name}:
              <br />
              <span className="text-ink-black/50 dark:text-ink-cream/60">
                {tagline}
              </span>
            </h3>
            <p className="text-sm leading-relaxed mt-4 transition-colors duration-500 text-ink-black/50 dark:text-ink-cream/45">
              {excerpt}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full font-mono text-[9px] tracking-wide transition-colors duration-500 bg-ink-black/[0.05] text-ink-black/50 dark:bg-ink-cream/[0.06] dark:text-ink-cream/45"
                >
                  {s}
                </span>
              ))}
            </div>
            <Link
              href={`/lineup/spotlights/${slug}`}
              className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-ink-red hover:text-ink-red/80 transition-colors"
            >
              Read Feature
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
);

CoverStory.displayName = "CoverStory";

export { CoverStory };
