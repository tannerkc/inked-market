"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlashCard } from "@/components/ui/flash-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SampleBadge } from "@/components/ui/sample-badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DiscoverSearch } from "@/components/discover/search-bar";
import { FilterPills } from "@/components/discover/filter-pills";
import { ThemedPageWrapper } from "@/components/layout/themed-page-wrapper";
import { discoverFilters, type DiscoverProfile } from "@/lib/data/discover";
import { bebasNeue, permanentMarker, unifrakturCook } from "@/lib/fonts";

interface DiscoverPageContentProps {
  studios: DiscoverProfile[];
  artists: DiscoverProfile[];
  studiosAreSample?: boolean;
  artistsAreSample?: boolean;
}

export function DiscoverPageContent({
  studios,
  artists,
  studiosAreSample = false,
  artistsAreSample = false,
}: DiscoverPageContentProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All Styles");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter !== "All Styles") {
      const slug = filter.toLowerCase().replace(/\s+/g, "-");
      router.push(`/discover/search?tab=artists&styles=${slug}`);
    }
  };

  return (
    <ThemedPageWrapper>
      {/* Hero */}
      <div className="text-center px-4 sm:px-10 pt-5 relative z-[5]">
        <Eyebrow text="The Lineup" color="rust" />
        <h1>
          <span className={`${bebasNeue.className} text-4xl sm:text-5xl lg:text-[52px] leading-none tracking-wide transition-colors duration-500 text-ink-black dark:text-ink-cream`}>
            FIND YOUR{" "}
          </span>
          <span className={`${unifrakturCook.className} text-4xl sm:text-5xl lg:text-[52px] leading-none transition-colors duration-500 text-ink-black dark:text-ink-cream`}>
            Artist
          </span>
        </h1>
        <p className="font-mono text-[11px] tracking-[0.06em] mt-2 transition-colors duration-500 text-ink-black/40 dark:text-ink-cream/35">
          curated talent&ensp;/&ensp;verified portfolios&ensp;/&ensp;walk-ins welcome
        </p>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-10 mt-5 relative z-[5]">
        <DiscoverSearch
          onSearch={(q) => router.push(`/discover/search?q=${encodeURIComponent(q)}`)}
        />
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-10 mt-4 relative z-[5]">
        <FilterPills
          filters={discoverFilters}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Featured Studios */}
      <div className="px-4 sm:px-10 mt-8 relative z-[5]">
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <SectionLabel label="Featured Studios" variant="muted" stretch />
          </div>
          {studiosAreSample && <SampleBadge />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
          {studios.map((studio) => (
            <FlashCard
              key={studio.id}
              id={studio.id}
              slug={studio.slug}
              type="studio"
              name={studio.name}
              image={studio.image}
              location={studio.location}
              rating={studio.rating}
              reviewCount={studio.reviewCount}
              specialties={studio.specialties}
              badges={studio.badges}
              artistCount={studio.artistCount}
            />
          ))}
        </div>
      </div>

      {/* Featured Artists */}
      <div className="px-4 sm:px-10 mt-8 relative z-[5]">
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <SectionLabel label="Featured Artists" variant="muted" stretch />
          </div>
          {artistsAreSample && <SampleBadge />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[3px]">
          {artists.map((artist) => (
            <FlashCard
              key={artist.id}
              id={artist.id}
              slug={artist.slug}
              type="artist"
              name={artist.name}
              image={artist.image}
              location={artist.location}
              rating={artist.rating}
              reviewCount={artist.reviewCount}
              specialties={artist.specialties}
              badges={artist.badges}
            />
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center px-4 sm:px-10 py-10 relative z-[5]">
        <Link
          href={`/discover/search`}
          className="font-mono text-[10px] tracking-[0.15em] uppercase transition-colors text-ink-black/30 hover:text-ink-black/50 dark:text-ink-cream/25 dark:hover:text-ink-cream/40"
        >
          VIEW ALL ARTISTS & STUDIOS &rarr;
        </Link>
        <p className={`${permanentMarker.className} text-sm mt-4 transition-colors duration-500 tracking-wide text-ink-black/[0.08] dark:text-ink-cream/[0.08]`}>
          tattoos or it didn&apos;t happen
        </p>
      </div>
    </ThemedPageWrapper>
  );
}
