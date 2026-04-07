"use client";

import React, { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { bebasNeue } from "@/lib/fonts";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/providers/theme-provider";
import {
  SavedTabs,
  SavedCardGrid,
  SavedMasonryGrid,
  SavedEmptyState,
  SavedAllGrid,
} from "@/components/saved";
import type { SavedTabValue, SavedAllItem } from "@/components/saved";
import {
  savedStudios as initialStudios,
  savedArtists as initialArtists,
  savedPortfolio as initialPortfolio,
} from "@/lib/data/saved";

export default function SavedPage() {
  const { mode, setMode } = useTheme();
  const isLight = mode === "light";

  const [activeTab, setActiveTab] = useState<SavedTabValue>("all");
  const [studios, setStudios] = useState(initialStudios);
  const [artists, setArtists] = useState(initialArtists);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // ─── Counts ───────────────────────────────────────────────────────────

  const counts = useMemo(
    () => ({
      all: studios.length + artists.length + portfolio.length,
      studios: studios.length,
      artists: artists.length,
      portfolio: portfolio.length,
    }),
    [studios.length, artists.length, portfolio.length]
  );

  // ─── All items (sorted by savedAt desc) ───────────────────────────────

  const allItems: SavedAllItem[] = useMemo(() => {
    const items: SavedAllItem[] = [
      ...studios.map((s) => ({ entityType: "studio" as const, data: s })),
      ...artists.map((a) => ({ entityType: "artist" as const, data: a })),
      ...portfolio.map((p) => ({ entityType: "design" as const, data: p })),
    ];
    return items.sort(
      (a, b) =>
        new Date(b.data.savedAt).getTime() -
        new Date(a.data.savedAt).getTime()
    );
  }, [studios, artists, portfolio]);

  // ─── Unsave handlers ──────────────────────────────────────────────────

  const animateAndRemove = useCallback(
    (id: string, removeFn: () => void) => {
      setRemovingIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        removeFn();
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300);
    },
    []
  );

  const handleUnsaveStudio = useCallback(
    (id: string) => {
      animateAndRemove(`studio-${id}`, () =>
        setStudios((prev) => prev.filter((s) => s.id !== id))
      );
    },
    [animateAndRemove]
  );

  const handleUnsaveArtist = useCallback(
    (id: string) => {
      animateAndRemove(`artist-${id}`, () =>
        setArtists((prev) => prev.filter((a) => a.id !== id))
      );
    },
    [animateAndRemove]
  );

  const handleUnsavePortfolio = useCallback(
    (id: string) => {
      animateAndRemove(id, () =>
        setPortfolio((prev) => prev.filter((p) => p.id !== id))
      );
    },
    [animateAndRemove]
  );

  const handleUnsaveAll = useCallback(
    (id: string, type: "studio" | "artist" | "design") => {
      if (type === "studio") handleUnsaveStudio(id);
      else if (type === "artist") handleUnsaveArtist(id);
      else handleUnsavePortfolio(id);
    },
    [handleUnsaveStudio, handleUnsaveArtist, handleUnsavePortfolio]
  );

  // ─── Tab change ───────────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: SavedTabValue) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "min-h-screen relative transition-colors duration-500",
        isLight
          ? "bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark text-ink-black"
          : "bg-ink-black text-ink-cream"
      )}
    >
      <FilmGrainOverlay
        className={isLight ? "opacity-[0.03]" : "opacity-[0.035]"}
      />

      {/* Red glow (dark mode only) */}
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[250px] bg-ink-red-glow-top pointer-events-none z-[1] transition-opacity duration-500",
          isLight ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Theme toggle */}
      <ThemeToggle mode={mode} onToggle={setMode} className="pt-24" />

      {/* ─── Header ─── */}
      <div className="relative text-center pt-6 pb-8 px-4 z-[5]">
        <p
          className={cn(
            "font-mono text-[10px] tracking-[0.25em] uppercase transition-colors duration-500",
            isLight ? "text-ink-black/40" : "text-ink-cream/30"
          )}
        >
          Your Collection
        </p>
        <h1
          className={cn(
            bebasNeue.className,
            "text-5xl sm:text-6xl tracking-[0.08em] leading-none mt-2 transition-colors duration-500",
            isLight ? "text-ink-black" : "text-ink-cream"
          )}
        >
          SAVED
        </h1>
        <p
          className={cn(
            "font-mono text-[10px] tracking-[0.15em] mt-2 transition-colors duration-500",
            isLight ? "text-ink-black/30" : "text-ink-cream/25"
          )}
        >
          {counts.all} {counts.all === 1 ? "item" : "items"} saved
        </p>
      </div>

      {/* ─── Tabs ─── */}
      <div className="relative z-[5] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SavedTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={counts}
          variant={mode}
        />

        {/* ─── Tab Content ─── */}
        <div className="py-8">
          {/* All tab */}
          {activeTab === "all" && (
            allItems.length > 0 ? (
              <SavedAllGrid
                items={allItems}
                removingIds={removingIds}
                onUnsave={handleUnsaveAll}
                onNavigateTab={handleTabChange}
                variant={mode}
              />
            ) : (
              <SavedEmptyState tab="all" variant={mode} />
            )
          )}

          {/* Studios tab */}
          {activeTab === "studios" && (
            studios.length > 0 ? (
              <SavedCardGrid
                items={studios}
                type="studio"
                removingIds={removingIds}
                onUnsave={handleUnsaveStudio}
                variant={mode}
              />
            ) : (
              <SavedEmptyState tab="studios" variant={mode} />
            )
          )}

          {/* Artists tab */}
          {activeTab === "artists" && (
            artists.length > 0 ? (
              <SavedCardGrid
                items={artists}
                type="artist"
                removingIds={removingIds}
                onUnsave={handleUnsaveArtist}
                variant={mode}
              />
            ) : (
              <SavedEmptyState tab="artists" variant={mode} />
            )
          )}

          {/* Portfolio tab */}
          {activeTab === "portfolio" && (
            portfolio.length > 0 ? (
              <SavedMasonryGrid
                pieces={portfolio}
                removingIds={removingIds}
                onUnsave={handleUnsavePortfolio}
                variant={mode}
              />
            ) : (
              <SavedEmptyState tab="portfolio" variant={mode} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
