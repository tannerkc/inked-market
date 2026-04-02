"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bebas_Neue,
  Permanent_Marker,
  UnifrakturCook,
} from "next/font/google";
import { FlashCard } from "@/components/ui/flash-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { SectionLabel } from "@/components/ui/section-label";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DiscoverSearch } from "@/components/discover/search-bar";
import { FilterPills } from "@/components/discover/filter-pills";
import { useTheme } from "@/components/providers/theme-provider";
import {
  mockShops,
  mockArtists,
  discoverFilters,
} from "@/lib/data/discover";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const permanentMarker = Permanent_Marker({ weight: "400", subsets: ["latin"] });
const unifrakturCook = UnifrakturCook({ weight: "700", subsets: ["latin"] });

export default function DiscoverPage() {
  const router = useRouter();
  const { mode, setMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All Styles");
  const isLight = mode === "light";

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter !== "All Styles") {
      const slug = filter.toLowerCase().replace(/\s+/g, "-");
      router.push(`/discover/search?tab=artists&styles=${slug}`);
    }
  };

  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${
        isLight
          ? "bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"
          : "bg-ink-black"
      }`}
    >
      {/* Film grain */}
      <FilmGrainOverlay
        className={isLight ? "opacity-[0.03]" : "opacity-[0.035]"}
      />

      {/* Red glow (dark mode only) */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[250px] bg-ink-red-glow-top pointer-events-none z-[1] transition-opacity duration-500 ${
          isLight ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Theme toggle */}
      <ThemeToggle mode={mode} onToggle={setMode} className="pt-24" />

      {/* Hero */}
      <div className="text-center px-4 sm:px-10 pt-5 relative z-[5]">
        <Eyebrow text="The Lineup" color="rust" />
        <h1>
          <span
            className={`${bebasNeue.className} text-4xl sm:text-5xl lg:text-[52px] leading-none tracking-wide transition-colors duration-500 ${
              isLight ? "text-ink-black" : "text-ink-cream"
            }`}
          >
            FIND YOUR{" "}
          </span>
          <span
            className={`${unifrakturCook.className} text-4xl sm:text-5xl lg:text-[52px] leading-none transition-colors duration-500 ${
              isLight ? "text-ink-black" : "text-ink-cream"
            }`}
          >
            Artist
          </span>
        </h1>
        <p
          className={`font-mono text-[11px] tracking-[0.06em] mt-2 transition-colors duration-500 ${
            isLight ? "text-ink-black/40" : "text-ink-cream/35"
          }`}
        >
          curated talent&ensp;/&ensp;verified portfolios&ensp;/&ensp;walk-ins
          welcome
        </p>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-10 mt-5 relative z-[5]">
        <DiscoverSearch
          variant={mode}
          onSearch={(q) => router.push(`/discover/search?q=${encodeURIComponent(q)}`)}
        />
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-10 mt-4 relative z-[5]">
        <FilterPills
          filters={discoverFilters}
          activeFilter={activeFilter}
          variant={mode}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Featured Studios */}
      <div className="px-4 sm:px-10 mt-8 relative z-[5]">
        <SectionLabel
          label="Featured Studios"
          variant={isLight ? "parchment" : "dark-muted"}
          stretch
          className="mb-6"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
          {mockShops.map((shop) => (
            <FlashCard
              key={shop.id}
              id={shop.id}
              type="shop"
              name={shop.name}
              image={shop.image}
              location={shop.location}
              rating={shop.rating}
              reviewCount={shop.reviewCount}
              specialties={shop.specialties}
              badges={shop.badges}
              artistCount={shop.artistCount}
            />
          ))}
        </div>
      </div>

      {/* Featured Artists */}
      <div className="px-4 sm:px-10 mt-8 relative z-[5]">
        <SectionLabel
          label="Featured Artists"
          variant={isLight ? "parchment" : "dark-muted"}
          stretch
          className="mb-6"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[3px]">
          {mockArtists.map((artist) => (
            <FlashCard
              key={artist.id}
              id={artist.id}
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
          className={`font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
            isLight
              ? "text-ink-black/30 hover:text-ink-black/50"
              : "text-ink-cream/25 hover:text-ink-cream/40"
          }`}
        >
          VIEW ALL ARTISTS & STUDIOS &rarr;
        </Link>
        <p
          className={`${permanentMarker.className} text-sm mt-4 transition-colors duration-500 tracking-wide ${
            isLight ? "text-ink-black/[0.08]" : "text-ink-cream/[0.08]"
          }`}
        >
          tattoos or it didn&apos;t happen
        </p>
      </div>
    </div>
  );
}
