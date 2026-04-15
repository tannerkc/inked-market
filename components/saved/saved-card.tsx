"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatRating } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/data/saved";
import { UnsaveButton } from "./unsave-button";
import type { CardBadge, BadgeColor } from "@/components/ui/profile-card";

// ─── Badge styles (canonical source: profile-card.tsx) ──────────────────────

const badgeStyles: Record<BadgeColor, string> = {
  sage: "bg-ink-black/80 text-ink-sage border-ink-sage/30",
  rust: "bg-ink-black/80 text-ink-rust border-ink-rust/30",
  red: "bg-ink-black/80 text-ink-red border-ink-red/30",
};

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SavedCardProps {
  id: string;
  type: "artist" | "studio";
  name: string;
  image: string;
  avatar?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  verified?: boolean;
  badges?: CardBadge[];
  savedAt: string;
  removing?: boolean;
  onUnsave?: (id: string, type: "artist" | "studio") => void;
  /** Optional type badge overlay for the All tab */
  typeBadge?: { label: string; className: string };
  variant?: "light" | "dark";
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

const SavedCard = React.forwardRef<HTMLDivElement, SavedCardProps>(
  (
    {
      id,
      type,
      name,
      image,
      avatar,
      location,
      rating,
      reviewCount,
      specialties = [],
      verified = false,
      badges = [],
      savedAt,
      removing = false,
      onUnsave,
      typeBadge,
      variant = "dark",
      className,
    },
    ref
  ) => {
    const isLight = variant === "light";
    const href = type === "studio" ? `/studios/${id}` : `/artists/${id}`;

    const allBadges: CardBadge[] = [...badges];
    if (verified && !badges.some((b) => b.label.toLowerCase() === "verified")) {
      allBadges.unshift({ label: "Verified", color: "sage" });
    }

    const handleUnsave = () => {
      onUnsave?.(id, type);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden border transition-all duration-300 group",
          isLight
            ? "bg-ink-parchment-dark border-ink-black/[0.06] hover:border-ink-black/[0.12] hover:shadow-md"
            : "bg-[#161616] border-ink-cream/[0.06] hover:border-ink-cream/[0.12] hover:shadow-md",
          removing && "opacity-0 scale-95",
          className
        )}
      >
        <Link href={href} className="block">
          {/* Image area */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-all duration-500 saturate-[0.85] contrast-[1.05] group-hover:scale-[1.03] group-hover:saturate-100 group-hover:contrast-100"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Type badge (All tab only) */}
            {typeBadge && (
              <div className="absolute top-2.5 left-2.5 z-20">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-[3px] font-mono text-[7px] tracking-[0.12em] uppercase leading-none backdrop-blur-md border border-white/10",
                    typeBadge.className
                  )}
                >
                  {typeBadge.label}
                </span>
              </div>
            )}

            {/* Entity badges */}
            {allBadges.length > 0 && (
              <div
                className={cn(
                  "absolute z-10 flex flex-wrap gap-1",
                  typeBadge ? "top-8 left-2.5" : "top-2.5 left-2.5"
                )}
              >
                {allBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-[3px] font-mono text-[7px] tracking-[0.12em] uppercase leading-none backdrop-blur-md border",
                      badgeStyles[badge.color]
                    )}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Heart unsave button */}
            <UnsaveButton
              onClick={handleUnsave}
              className="absolute top-2.5 right-2.5 z-20"
            />
          </div>

          {/* Info footer */}
          <div className="p-3.5">
            {/* Name + avatar + location + rating */}
            <div className="flex items-center gap-2 mb-1.5">
              {avatar && (
                <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-ink-cream/20">
                  <Image
                    src={avatar}
                    alt={name}
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-bold text-[13px] leading-tight truncate",
                    isLight ? "text-ink-black" : "text-ink-cream"
                  )}
                >
                  {name}
                </p>
                <div className="flex items-center gap-1.5">
                  {location && (
                    <span
                      className={cn(
                        "font-mono text-[8px] tracking-wide",
                        isLight ? "text-ink-black/40" : "text-ink-cream/40"
                      )}
                    >
                      {location}
                    </span>
                  )}
                  {rating !== undefined && (
                    <>
                      <span
                        className={cn(
                          "text-[8px]",
                          isLight ? "text-ink-black/20" : "text-ink-cream/20"
                        )}
                      >
                        &middot;
                      </span>
                      <span className="font-mono text-[8px] text-ink-red">
                        &#9733; {formatRating(rating)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Specialty tags */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2.5">
                {specialties.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "px-2 py-0.5 rounded-full font-mono text-[7px] tracking-wide uppercase",
                      isLight
                        ? "bg-ink-black/5 text-ink-black/50"
                        : "bg-ink-cream/[0.06] text-ink-cream/50"
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Footer: save date + CTA */}
            <div
              className={cn(
                "flex justify-between items-center pt-2.5 border-t",
                isLight
                  ? "border-ink-black/[0.06]"
                  : "border-ink-cream/[0.05]"
              )}
            >
              <span
                className={cn(
                  "font-mono text-[8px] tracking-wide",
                  isLight ? "text-ink-black/25" : "text-ink-cream/25"
                )}
              >
                Saved {formatTimeAgo(savedAt)}
              </span>
              <span className="font-mono text-[8px] tracking-wide text-ink-red">
                {type === "artist" ? "Book" : "View"} &rarr;
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

SavedCard.displayName = "SavedCard";

export { SavedCard };
