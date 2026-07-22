"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatStarRating, profilePath } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/data/saved";
import { UnsaveButton } from "./unsave-button";
import { OverlayBadge, withVerifiedBadge } from "@/components/ui/profile-card";
import type { CardBadge } from "@/components/ui/profile-card";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SavedCardProps {
  id: string;
  /** Pretty URL slug — used for the profile link when present. */
  slug?: string;
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
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

const SavedCard = React.forwardRef<HTMLDivElement, SavedCardProps>(
  (
    {
      id,
      slug,
      type,
      name,
      image,
      avatar,
      location,
      rating,
      specialties = [],
      verified = false,
      badges = [],
      savedAt,
      removing = false,
      onUnsave,
      typeBadge,
      className,
    },
    ref
  ) => {
    const href = profilePath(type, { id, slug });
    const allBadges: CardBadge[] = withVerifiedBadge(badges, verified);

    const handleUnsave = () => {
      onUnsave?.(id, type);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden border transition-all duration-300 group",
          "bg-ink-parchment-dark border-ink-black/[0.06] hover:border-ink-black/[0.12] hover:shadow-md",
          "dark:bg-[#161616] dark:border-ink-cream/[0.06] dark:hover:border-ink-cream/[0.12] dark:hover:shadow-md",
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
                <OverlayBadge
                  label={typeBadge.label}
                  className={cn("border-white/10", typeBadge.className)}
                />
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
                  <OverlayBadge key={badge.label} label={badge.label} color={badge.color} />
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
                <p className="font-bold text-[13px] leading-tight truncate text-ink-black dark:text-ink-cream">
                  {name}
                </p>
                <div className="flex items-center gap-1.5">
                  {location && (
                    <span className="font-mono text-[8px] tracking-wide text-ink-black/40 dark:text-ink-cream/40">
                      {location}
                    </span>
                  )}
                  {rating !== undefined && (
                    <>
                      <span className="text-[8px] text-ink-black/20 dark:text-ink-cream/20">
                        &middot;
                      </span>
                      <span className="font-mono text-[8px] text-ink-red">
                        {formatStarRating(rating)}
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
                    className="px-2 py-0.5 rounded-full font-mono text-[7px] tracking-wide uppercase bg-ink-black/5 text-ink-black/50 dark:bg-ink-cream/[0.06] dark:text-ink-cream/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Footer: save date + CTA */}
            <div className="flex justify-between items-center pt-2.5 border-t border-ink-black/[0.06] dark:border-ink-cream/[0.05]">
              <span className="font-mono text-[8px] tracking-wide text-ink-black/25 dark:text-ink-cream/25">
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
