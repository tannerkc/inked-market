import React from "react";
import Link from "next/link";
import { cn, formatRating } from "@/lib/utils";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { Button } from "@/components/ui/button";
import { badgeColorMap } from "@/lib/data/discover";
import type { Badge } from "@/lib/data/discover";

interface ZineSpreadProps {
  id: string;
  type: "studio" | "artist";
  name: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  specialties: string[];
  badges?: Badge[];
  reverse?: boolean;
  panelVariant: "light" | "dark";
  sectionLabel: string;
  /** Font className for the name heading (e.g., Abril Fatface) */
  nameFont?: string;
  /** Font className for the section label (e.g., Permanent Marker) */
  labelFont?: string;
  className?: string;
}

const ZineSpread = React.forwardRef<HTMLDivElement, ZineSpreadProps>(
  (
    {
      id,
      type,
      name,
      image,
      location,
      rating,
      reviewCount,
      description,
      specialties,
      badges = [],
      reverse = false,
      panelVariant,
      sectionLabel,
      nameFont = "",
      labelFont = "",
      className,
    },
    ref
  ) => {
    const isDark = panelVariant === "dark";
    const href = `/${type}s/${id}`;

    const imagePanel = (
      <div
        className="relative min-h-[300px] md:min-h-[380px] bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        {badges.map((badge, i) => (
          <span
            key={badge.label}
            className={cn(
              "absolute z-10 px-2.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] uppercase text-white",
              badgeColorMap[badge.color],
              i === 0 ? "top-3 left-3" : "bottom-3 right-3"
            )}
          >
            {badge.label}
          </span>
        ))}
      </div>
    );

    const textPanel = (
      <div
        className={cn(
          "relative p-8 md:p-10 flex flex-col justify-center",
          isDark ? "bg-ink-black" : "bg-ink-cream"
        )}
      >
        {isDark && <FilmGrainOverlay />}
        <div className="relative z-[2]">
          <p
            className={cn(
              "text-[10px] tracking-[0.18em] uppercase mb-1.5",
              isDark ? "text-ink-red" : "text-ink-rust",
              labelFont
            )}
          >
            {sectionLabel}
          </p>
          <h3
            className={cn(
              "text-3xl md:text-4xl leading-tight",
              isDark ? "text-ink-cream" : "text-ink-black",
              nameFont
            )}
          >
            {name}
          </h3>
          <p
            className={cn(
              "font-mono text-[10px] tracking-[0.06em] mt-1.5",
              isDark ? "text-ink-cream/35" : "text-ink-black/40"
            )}
          >
            {location} &middot; &#9733; {formatRating(rating)} &middot;{" "}
            {reviewCount} reviews
          </p>
          <p
            className={cn(
              "text-sm leading-relaxed mt-4",
              isDark ? "text-ink-cream/50" : "text-ink-black/60"
            )}
          >
            {description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {specialties.map((s) => (
              <span
                key={s}
                className={cn(
                  "px-3 py-1 rounded-full font-mono text-[9px] tracking-wide",
                  isDark
                    ? "bg-ink-cream/[0.06] text-ink-cream/45"
                    : "bg-ink-black/[0.05] text-ink-black/50"
                )}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-5">
            <Button
              as={Link}
              href={href}
              variant={isDark ? "ink-light-outline" : "ink"}
              size="sm"
              statusDot={isDark ? undefined : true}
              rightIcon={isDark ? "arrow-right" : undefined}
            >
              {type === "artist" ? "View Portfolio" : "View Studio"}
            </Button>
          </div>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 md:grid-cols-[1.5fr_1fr]",
          reverse && "md:grid-cols-[1fr_1.5fr]",
          className
        )}
      >
        {reverse ? (
          <>
            {textPanel}
            {imagePanel}
          </>
        ) : (
          <>
            {imagePanel}
            {textPanel}
          </>
        )}
      </div>
    );
  }
);
ZineSpread.displayName = "ZineSpread";

export { ZineSpread };
