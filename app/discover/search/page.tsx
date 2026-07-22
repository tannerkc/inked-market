"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
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
import type { SearchFilters, SearchResultItem, SearchResponse } from "@/lib/data/search";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // useTheme is required here for the inline ThemeToggle UI (mode + setMode).
  const { mode, setMode } = useTheme();

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

  const [allResults, setAllResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const buildSearchUrl = useCallback(
    (page: number): string => {
      const params = new URLSearchParams();
      params.set("tab", tab);
      params.set("page", String(page));
      if (filters.q) params.set("q", filters.q);
      if (filters.styles?.length) params.set("styles", filters.styles.join(","));
      if (filters.location) params.set("location", filters.location);
      if (filters.rating !== undefined) params.set("rating", String(filters.rating));
      if (filters.exp) params.set("experience", filters.exp);
      if (filters.verified) params.set("verified", "true");
      if (filters.booking) params.set("booking", "true");
      if (filters.sort) params.set("sort", filters.sort);
      return `/api/search?${params.toString()}`;
    },
    [tab, filters]
  );

  const filterKey = useMemo(
    () => JSON.stringify({ tab, ...filters, page: undefined }),
    [tab, filters]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCurrentPage(1);

    fetch(buildSearchUrl(1))
      .then((res) => res.json())
      .then((data: SearchResponse) => {
        if (cancelled) return;
        setAllResults(data.results);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAllResults([]);
        setTotal(0);
        setHasMore(false);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filterKey, buildSearchUrl]);

  const handleLoadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setLoading(true);

    fetch(buildSearchUrl(nextPage))
      .then((res) => res.json())
      .then((data: SearchResponse) => {
        setAllResults((prev) => [...prev, ...data.results]);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setCurrentPage(nextPage);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentPage, buildSearchUrl]);

  const handleSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <div className="min-h-screen pt-16 transition-colors duration-500 bg-ink-cream dark:bg-ink-black">
      <FilmGrainOverlay className="opacity-[0.02] dark:opacity-[0.035]" />

      <div className="sticky top-0 z-40 pt-16 -mt-16 bg-ink-cream dark:bg-ink-black">
        <div className="max-w-4xl mx-auto px-6 pt-4 pb-3">
          <ThemeToggle mode={mode} onToggle={setMode} className="mb-3" />

          <DiscoverSearch
            defaultValue={filters.q}
            onSearch={handleSearch}
            className="mb-6"
          />

          <SearchTabs className="mb-1.5" />

          <FilterBar />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 pt-5 pb-16">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/40 dark:text-ink-cream/20">
            Showing {allResults.length} of {total}{" "}
            {tab === "studios" ? "studios" : "artists"}
          </span>
          <SortSelect />
        </div>

        {allResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
            {allResults.map((item) => (
              <SearchResultCard
                key={`${item.type}-${item.id}`}
                type={item.type}
                id={item.id}
                slug={item.slug}
                name={item.name}
                avatar={item.avatar}
                images={item.images}
                location={item.location}
                rating={item.rating}
                reviewCount={item.reviewCount}
                specialties={item.specialties}
                verified={item.verified}
                artistCount={item.artistCount}
                badges={item.badges}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-20">
            <p className="font-mono text-[11px] tracking-wide text-ink-black/30 dark:text-ink-cream/30">
              No {tab === "studios" ? "studios" : "artists"} found matching your filters.
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
        ) : null}

        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="ink-outline"
              size="sm"
              statusDot="bg-ink-red shadow-ink-red-glow"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
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
