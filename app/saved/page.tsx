"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { bebasNeue } from "@/lib/fonts";
import { ThemedPageWrapper } from "@/components/layout/themed-page-wrapper";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getSaved, unsaveItem } from "@/lib/data/supabase-saved";
import { SampleBadge } from "@/components/ui/sample-badge";
import {
  SavedTabs,
  SavedCardGrid,
  SavedMasonryGrid,
  SavedEmptyState,
  SavedAllGrid,
} from "@/components/saved";
import type { SavedTabValue, SavedAllItem } from "@/components/saved";
import type {
  SavedStudio,
  SavedArtist,
  SavedPortfolioPiece,
} from "@/lib/data/saved";
import {
  savedStudios as sampleStudios,
  savedArtists as sampleArtists,
  savedPortfolio as samplePortfolio,
} from "@/lib/data/saved";

export default function SavedPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const [supabase] = useState(() => createClient());

  const [activeTab, setActiveTab] = useState<SavedTabValue>("all");
  const [studios, setStudios] = useState<SavedStudio[]>([]);
  const [artists, setArtists] = useState<SavedArtist[]>([]);
  const [portfolio, setPortfolio] = useState<SavedPortfolioPiece[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Load saved items once auth has hydrated. Logged-out visitors see a sample
  // collection (badged); signed-in users see their real saves (empty if none).
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    void (async () => {
      // Logged out → sample collection (badged). Signed in → real saves.
      if (!isAuthenticated) {
        if (cancelled) return;
        setStudios(sampleStudios);
        setArtists(sampleArtists);
        setPortfolio(samplePortfolio);
        setIsSample(true);
        setLoaded(true);
        return;
      }
      const res = await getSaved(supabase);
      if (cancelled) return;
      setStudios(res.studios);
      setArtists(res.artists);
      setPortfolio(res.portfolio);
      setIsSample(false);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, supabase]);

  const counts = useMemo(
    () => ({
      all: studios.length + artists.length + portfolio.length,
      studios: studios.length,
      artists: artists.length,
      portfolio: portfolio.length,
    }),
    [studios.length, artists.length, portfolio.length],
  );

  const allItems: SavedAllItem[] = useMemo(() => {
    const items: SavedAllItem[] = [
      ...studios.map((s) => ({ entityType: "studio" as const, data: s })),
      ...artists.map((a) => ({ entityType: "artist" as const, data: a })),
      ...portfolio.map((p) => ({ entityType: "design" as const, data: p })),
    ];
    return items.sort(
      (a, b) =>
        new Date(b.data.savedAt).getTime() - new Date(a.data.savedAt).getTime(),
    );
  }, [studios, artists, portfolio]);

  const animateAndRemove = useCallback((id: string, removeFn: () => void) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeFn();
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const handleUnsaveStudio = useCallback(
    (id: string) => {
      animateAndRemove(`studio-${id}`, () =>
        setStudios((prev) => prev.filter((s) => s.id !== id)),
      );
      if (!isSample) void unsaveItem(supabase, "studio", id);
    },
    [animateAndRemove, isSample, supabase],
  );

  const handleUnsaveArtist = useCallback(
    (id: string) => {
      animateAndRemove(`artist-${id}`, () =>
        setArtists((prev) => prev.filter((a) => a.id !== id)),
      );
      if (!isSample) void unsaveItem(supabase, "artist", id);
    },
    [animateAndRemove, isSample, supabase],
  );

  const handleUnsavePortfolio = useCallback(
    (id: string) => {
      animateAndRemove(id, () =>
        setPortfolio((prev) => prev.filter((p) => p.id !== id)),
      );
      if (!isSample) void unsaveItem(supabase, "design", id);
    },
    [animateAndRemove, isSample, supabase],
  );

  const handleUnsaveAll = useCallback(
    (id: string, type: "studio" | "artist" | "design") => {
      if (type === "studio") handleUnsaveStudio(id);
      else if (type === "artist") handleUnsaveArtist(id);
      else handleUnsavePortfolio(id);
    },
    [handleUnsaveStudio, handleUnsaveArtist, handleUnsavePortfolio],
  );

  const handleTabChange = useCallback((tab: SavedTabValue) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <ThemedPageWrapper withTextColor>
      {/* Header */}
      <div className="relative text-center pt-6 pb-8 px-4 z-[5]">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase transition-colors duration-500 text-ink-black/40 dark:text-ink-cream/30">
          Your Collection
        </p>
        <h1 className={`${bebasNeue.className} text-5xl sm:text-6xl tracking-[0.08em] leading-none mt-2 transition-colors duration-500 text-ink-black dark:text-ink-cream`}>
          SAVED
        </h1>
        <p className="font-mono text-[10px] tracking-[0.15em] mt-2 transition-colors duration-500 text-ink-black/30 dark:text-ink-cream/25">
          {counts.all} {counts.all === 1 ? "item" : "items"} saved
        </p>
        {isSample && (
          <div className="mt-3 flex justify-center">
            <SampleBadge label="Sample — sign in to save your own" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="relative z-[5] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SavedTabs activeTab={activeTab} onTabChange={handleTabChange} counts={counts} />

        <div className="py-8">
          {!loaded ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <>
              {activeTab === "all" &&
                (allItems.length > 0 ? (
                  <SavedAllGrid
                    items={allItems}
                    removingIds={removingIds}
                    onUnsave={handleUnsaveAll}
                    onNavigateTab={handleTabChange}
                  />
                ) : (
                  <SavedEmptyState tab="all" />
                ))}

              {activeTab === "studios" &&
                (studios.length > 0 ? (
                  <SavedCardGrid
                    items={studios}
                    type="studio"
                    removingIds={removingIds}
                    onUnsave={handleUnsaveStudio}
                  />
                ) : (
                  <SavedEmptyState tab="studios" />
                ))}

              {activeTab === "artists" &&
                (artists.length > 0 ? (
                  <SavedCardGrid
                    items={artists}
                    type="artist"
                    removingIds={removingIds}
                    onUnsave={handleUnsaveArtist}
                  />
                ) : (
                  <SavedEmptyState tab="artists" />
                ))}

              {activeTab === "portfolio" &&
                (portfolio.length > 0 ? (
                  <SavedMasonryGrid
                    pieces={portfolio}
                    removingIds={removingIds}
                    onUnsave={handleUnsavePortfolio}
                  />
                ) : (
                  <SavedEmptyState tab="portfolio" />
                ))}
            </>
          )}
        </div>
      </div>
    </ThemedPageWrapper>
  );
}
