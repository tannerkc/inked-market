"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { DiscoverSearch } from "@/components/discover/search-bar";
import {
  SearchResultCard,
  FilterBar,
  SearchTabs,
  SortSelect,
} from "@/components/search";
import { useTheme } from "@/components/providers/theme-provider";
import { searchArtists, searchStudios } from "@/lib/data/search";
import type { SearchFilters, SearchResultItem } from "@/lib/data/search";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { mode, setMode } = useTheme();
  const isDark = mode === "dark";

  const tab = searchParams.get("tab") || "artists";
  const filters: SearchFilters = useMemo(() => {
    const styles = searchParams.get("styles");
    const rating = searchParams.get("rating");
    return {
      q: searchParams.get("q") || undefined,
      styles: styles ? styles.split(",").filter(Boolean) : undefined,
      location: searchParams.get("location") || undefined,
      rating: rating ? parseFloat(rating) : undefined,
      exp: searchParams.get("experience") || undefined,
      verified: searchParams.get("verified") === "true" ? true : undefined,
      booking: searchParams.get("booking") === "true" ? true : undefined,
      sort:
        (searchParams.get("sort") as SearchFilters["sort"]) || "relevance",
      page: 1,
    };
  }, [searchParams]);

  const [loadedPages, setLoadedPages] = useState(1);

  const filterKey = useMemo(
    () => JSON.stringify({ ...filters, page: undefined }),
    [filters]
  );
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setLoadedPages(1);
  }

  const { allResults, total, hasMore } = useMemo(() => {
    const searchFn = tab === "studios" ? searchStudios : searchArtists;
    let all: SearchResultItem[] = [];
    let totalCount = 0;
    let more = false;

    for (let p = 1; p <= loadedPages; p++) {
      const response = searchFn({ ...filters, page: p });
      all = [...all, ...response.results];
      totalCount = response.total;
      more = response.hasMore;
    }

    return { allResults: all, total: totalCount, hasMore: more };
  }, [tab, filters, loadedPages]);

  const handleSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <>
      <div
        className={`min-h-screen pt-16 transition-colors duration-500 ${
          isDark ? "bg-ink-black" : "bg-ink-cream"
        }`}
      >
        <FilmGrainOverlay
          className={isDark ? "opacity-[0.035]" : "opacity-[0.02]"}
        />

        {/*
          Sticky header. <main> has transform:translate3d which makes IT
          the containing block for sticky, not the viewport. So top-0
          means top of <main>'s scroll area. pt-16/-mt-16 reserves space
          for the fixed nav without adding visual gap.
        */}
        <div
          className={`sticky top-0 z-40 pt-16 -mt-16 ${
            isDark ? "bg-ink-black" : "bg-ink-cream"
          }`}
        >
          <div className="max-w-4xl mx-auto px-6 pt-4 pb-3">
            <ThemeToggle mode={mode} onToggle={setMode} className="mb-3" />

            <DiscoverSearch
              variant={mode}
              defaultValue={filters.q}
              onSearch={handleSearch}
              className="mb-6"
            />

            <SearchTabs variant={mode} className="mb-1.5" />

            <FilterBar variant={mode} />
          </div>
        </div>

        {/* Results — flows directly below the sticky header, same background */}
        <div className="max-w-5xl mx-auto px-6 pt-5 pb-16">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`font-mono text-[9px] tracking-[0.15em] uppercase ${
                isDark ? "text-ink-cream/20" : "text-ink-black/40"
              }`}
            >
              Showing {allResults.length} of {total}{" "}
              {tab === "studios" ? "studios" : "artists"}
            </span>
            <SortSelect variant={mode} />
          </div>

          {allResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
              {allResults.map((item) => (
                <SearchResultCard
                  key={`${item.type}-${item.id}`}
                  type={item.type}
                  id={item.id}
                  name={item.name}
                  avatar={item.avatar}
                  images={item.images}
                  location={item.location}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  specialties={item.specialties}
                  verified={item.verified}
                  artistCount={item.artistCount}
                  variant={mode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p
                className={`font-mono text-[11px] tracking-wide ${
                  isDark ? "text-ink-cream/30" : "text-ink-black/30"
                }`}
              >
                No {tab === "studios" ? "studios" : "artists"} found matching
                your filters.
              </p>
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("tab", tab);
                  router.replace(`${pathname}?${params.toString()}`);
                }}
                className="mt-3 font-mono text-[10px] tracking-wide text-ink-red hover:text-ink-red/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-8">
              <Button
                variant={isDark ? "ink-outline" : "ink-light-outline"}
                size="sm"
                statusDot="bg-ink-red shadow-ink-red-glow"
                onClick={() => setLoadedPages((prev) => prev + 1)}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink-black flex items-center justify-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/20">
            Loading...
          </span>
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
