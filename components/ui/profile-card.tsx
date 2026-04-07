import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeColor = "sage" | "rust" | "red";

interface CardBadge {
  label: string;
  color: BadgeColor;
}

const badgeStyles: Record<BadgeColor, string> = {
  sage: "bg-ink-black/80 text-ink-sage border-ink-sage/30",
  rust: "bg-ink-black/80 text-ink-rust border-ink-rust/30",
  red: "bg-ink-black/80 text-ink-red border-ink-red/30",
};

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ProfileCardProps {
  id: string;
  type: "artist" | "studio";
  name: string;
  image: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  verified?: boolean;
  badges?: CardBadge[];
  artistCount?: number;
  /** Additional portfolio/gallery images shown as thumbnails */
  images?: string[];
  /** Avatar shown in the info overlay */
  avatar?: string;
  /** Aspect ratio — discover cards are 3/4, search cards are 3/5 */
  aspect?: "3/4" | "3/5";
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ProfileCard = React.forwardRef<HTMLAnchorElement, ProfileCardProps>(
  (
    {
      id,
      type,
      name,
      image,
      location,
      rating,
      reviewCount,
      specialties = [],
      verified = false,
      badges = [],
      artistCount,
      images = [],
      avatar,
      aspect = "3/4",
      className,
    },
    ref
  ) => {
    const href = `/${type}s/${id}`;

    // Build badge list — add verified as a badge if not already present
    const allBadges: CardBadge[] = [...badges];
    if (verified && !badges.some((b) => b.label.toLowerCase() === "verified")) {
      allBadges.unshift({ label: "Verified", color: "sage" });
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "group relative block overflow-hidden",
          aspect === "3/5" ? "aspect-[3/5]" : "aspect-[3/4]",
          className
        )}
      >
        {/* Main image — full bleed */}
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-all duration-500 saturate-[0.85] contrast-[1.05] group-hover:scale-[1.04] group-hover:saturate-100 group-hover:contrast-100"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges — top-left, inline row */}
        {allBadges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1">
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

        {/* Portfolio thumbnails — top-right (only when images provided) */}
        {images.length > 1 && (
          <div className="absolute top-2.5 right-2.5 z-10 flex gap-[2px] rounded-md overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            {images.slice(1, 4).map((src, i) => (
              <div key={i} className="relative w-9 h-9 overflow-hidden">
                <Image
                  src={src}
                  alt={`${name} work ${i + 2}`}
                  fill
                  sizes="36px"
                  className="object-cover saturate-[0.85] contrast-[1.05] group-hover:saturate-100 group-hover:contrast-100 transition-[filter] duration-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* Info overlay — always visible at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink-black/90 via-ink-black/60 to-transparent pt-16 pb-3.5 px-3.5">
          {/* Name row — with optional avatar */}
          <div className="flex items-center gap-2 mb-1">
            {avatar && (
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-ink-cream/20">
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
            )}
            <p className="font-bold text-[14px] text-ink-cream leading-tight">
              {name}
            </p>
          </div>

          {/* Location + rating row */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[9px] text-ink-cream/50 tracking-wide">
              {location}
              {artistCount ? ` · ${artistCount} artists` : ""}
            </p>
            {rating !== undefined && reviewCount !== undefined && (
              <p className="font-mono text-[9px]">
                <span className="text-ink-red">
                  &#9733; {rating.toFixed(1)}
                </span>
                <span className="text-ink-cream/35 ml-1">({reviewCount})</span>
              </p>
            )}
          </div>

          {/* Specialty tags */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full font-mono text-[8px] tracking-wide uppercase bg-ink-cream/10 text-ink-cream/60"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }
);
ProfileCard.displayName = "ProfileCard";

export { ProfileCard };
export type { CardBadge, BadgeColor };
