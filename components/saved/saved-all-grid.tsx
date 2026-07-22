"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { bebasNeue } from "@/lib/fonts";
import { SavedCard } from "./saved-card";
import { SavedPieceCard } from "./saved-piece-card";
import type { SavedArtist, SavedStudio, SavedPortfolioPiece } from "@/lib/data/saved";
import type { SavedTabValue } from "./saved-tabs";

// ─── Props ──────────────────────────────────────────────────────────────────

export type SavedAllItem =
  | { entityType: "studio"; data: SavedStudio }
  | { entityType: "artist"; data: SavedArtist }
  | { entityType: "design"; data: SavedPortfolioPiece };

export interface SavedAllGridProps {
  items: SavedAllItem[];
  removingIds?: Set<string>;
  onUnsave?: (id: string, type: "studio" | "artist" | "design") => void;
  onNavigateTab?: (tab: SavedTabValue) => void;
  className?: string;
}

// ─── Row preview limit ─────────────────────────────────────────────────────

const ROW_LIMIT = 3;

// ─── Section row ───────────────────────────────────────────────────────────

interface SectionRowProps {
  title: string;
  count: number;
  tab: SavedTabValue;
  onNavigateTab?: (tab: SavedTabValue) => void;
  children: React.ReactNode;
}

function SectionRow({ title, count, tab, onNavigateTab, children }: SectionRowProps) {
  const hasMore = count > ROW_LIMIT;

  return (
    <section className="mb-10 last:mb-0">
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <h2 className={`${bebasNeue.className} text-xl sm:text-2xl tracking-[0.06em] leading-none transition-colors duration-500 text-ink-black dark:text-ink-cream`}>
            {title}
          </h2>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase transition-colors duration-500 text-ink-black/30 dark:text-ink-cream/25">
            {count}
          </span>
        </div>

        {hasMore && (
          <button
            onClick={() => onNavigateTab?.(tab)}
            className="font-mono text-[9px] tracking-[0.12em] uppercase transition-colors duration-200 cursor-pointer text-ink-black/40 hover:text-ink-red dark:text-ink-cream/30 dark:hover:text-ink-red"
          >
            View all &rarr;
          </button>
        )}
      </div>

      {/* Row content */}
      {children}
    </section>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

const SavedAllGrid = React.forwardRef<HTMLDivElement, SavedAllGridProps>(
  ({ items, removingIds, onUnsave, onNavigateTab, className }, ref) => {
    // Split items by type
    const studios = items.filter((i): i is Extract<SavedAllItem, { entityType: "studio" }> => i.entityType === "studio");
    const artists = items.filter((i): i is Extract<SavedAllItem, { entityType: "artist" }> => i.entityType === "artist");
    const designs = items.filter((i): i is Extract<SavedAllItem, { entityType: "design" }> => i.entityType === "design");

    return (
      <div ref={ref} className={cn("space-y-0", className)}>
        {/* Studios row */}
        {studios.length > 0 && (
          <SectionRow title="Studios" count={studios.length} tab="studios" onNavigateTab={onNavigateTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {studios.slice(0, ROW_LIMIT).map(({ data: s }) => (
                <SavedCard
                  key={`studio-${s.id}`}
                  id={s.id}
                  slug={s.slug}
                  type="studio"
                  name={s.name}
                  image={s.image}
                  avatar={s.avatar}
                  location={s.location}
                  rating={s.rating}
                  reviewCount={s.reviewCount}
                  specialties={s.specialties}
                  verified={s.verified}
                  badges={s.badges}
                  savedAt={s.savedAt}
                  removing={removingIds?.has(`studio-${s.id}`)}
                  onUnsave={(id) => onUnsave?.(id, "studio")}
                />
              ))}
            </div>
          </SectionRow>
        )}

        {/* Artists row */}
        {artists.length > 0 && (
          <SectionRow title="Artists" count={artists.length} tab="artists" onNavigateTab={onNavigateTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {artists.slice(0, ROW_LIMIT).map(({ data: a }) => (
                <SavedCard
                  key={`artist-${a.id}`}
                  id={a.id}
                  slug={a.slug}
                  type="artist"
                  name={a.name}
                  image={a.image}
                  avatar={a.avatar}
                  location={a.location}
                  rating={a.rating}
                  reviewCount={a.reviewCount}
                  specialties={a.specialties}
                  verified={a.verified}
                  badges={a.badges}
                  savedAt={a.savedAt}
                  removing={removingIds?.has(`artist-${a.id}`)}
                  onUnsave={(id) => onUnsave?.(id, "artist")}
                />
              ))}
            </div>
          </SectionRow>
        )}

        {/* Designs row */}
        {designs.length > 0 && (
          <SectionRow title="Designs" count={designs.length} tab="portfolio" onNavigateTab={onNavigateTab}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {designs.slice(0, ROW_LIMIT).map(({ data: p }) => (
                <SavedPieceCard
                  key={`piece-${p.id}`}
                  piece={p}
                  removing={removingIds?.has(p.id)}
                  onUnsave={(id) => onUnsave?.(id, "design")}
                />
              ))}
            </div>
          </SectionRow>
        )}
      </div>
    );
  }
);

SavedAllGrid.displayName = "SavedAllGrid";

export { SavedAllGrid };
