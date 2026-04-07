"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UnsaveButton } from "./unsave-button";
import type { SavedPortfolioPiece } from "@/lib/data/saved";

export interface SavedPieceCardProps {
  piece: SavedPortfolioPiece;
  removing?: boolean;
  onUnsave?: (id: string) => void;
  /** Optional type badge for the All tab */
  typeBadge?: { label: string; className: string };
  /** Show tags on hover */
  showTags?: boolean;
  /** Override the piece's natural aspect ratio (e.g., for featured/spanning items) */
  noAspectRatio?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

const SavedPieceCard = React.forwardRef<HTMLAnchorElement, SavedPieceCardProps>(
  (
    {
      piece,
      removing = false,
      onUnsave,
      typeBadge,
      showTags = false,
      noAspectRatio = false,
      variant = "dark",
      className,
    },
    ref
  ) => {
    const isLight = variant === "light";

    return (
      <Link
        ref={ref}
        href={`/artists/${piece.artistId}`}
        className={cn(
          "relative overflow-hidden rounded group cursor-pointer transition-all duration-300",
          typeBadge && "rounded-xl border",
          typeBadge && (isLight ? "border-ink-black/[0.06]" : "border-ink-cream/[0.06]"),
          removing && "opacity-0 scale-95",
          className
        )}
        style={noAspectRatio ? undefined : { aspectRatio: piece.aspectRatio.replace(":", "/") }}
      >
        <Image
          src={piece.url}
          alt={piece.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover saturate-[0.8] contrast-[1.05] transition-all duration-500 group-hover:scale-[1.03] group-hover:saturate-100 group-hover:contrast-100"
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

        {/* Heart unsave button */}
        <UnsaveButton
          size="sm"
          onClick={() => onUnsave?.(piece.id)}
          className="absolute top-2 right-2 z-20"
        />

        {/* Gradient overlay with attribution */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-black/85 via-ink-black/40 to-transparent pt-12 pb-3 px-3">
          <span className="text-[12px] font-semibold text-ink-cream block leading-tight">
            {piece.title}
          </span>
          <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink-cream/50">
            by {piece.artistName}
          </span>
          {showTags && piece.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {piece.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-full font-mono text-[6px] tracking-wide uppercase bg-ink-cream/10 text-ink-cream/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }
);

SavedPieceCard.displayName = "SavedPieceCard";

export { SavedPieceCard };
