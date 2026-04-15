"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FilterDropdown } from "./filter-dropdown";
import { FilterChips } from "./filter-chips";
import { tattooStyleOptions } from "@/lib/data/signup-styles";

export interface FilterBarProps {
  variant?: "light" | "dark";
  className?: string;
}

const TATTOO_STYLES = tattooStyleOptions;

const LOCATION_SUGGESTIONS = [
  "Los Angeles, CA",
  "Chicago, IL",
  "New York, NY",
  "Austin, TX",
  "Portland, OR",
];

const RATING_OPTIONS = ["Any", "3.0", "4.0", "4.5", "4.8"];

const EXPERIENCE_OPTIONS = ["Any", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const TEAM_SIZE_OPTIONS = ["Any", "1-3 artists", "4-8 artists", "8+ artists"];

function toSlug(style: string): string {
  return style.toLowerCase().replace(/\s+/g, "-");
}

function FilterBarInner({ variant = "dark", className }: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = variant === "dark";

  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [locationQuery, setLocationQuery] = React.useState("");
  const [pendingStyles, setPendingStyles] = React.useState<string[]>([]);

  const tab = searchParams.get("tab") || "artists";
  const isStudios = tab === "studios";

  // Read current filter values from URL
  const currentStyles = (searchParams.get("styles") || "").split(",").filter(Boolean);
  const currentLocation = searchParams.get("location") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentExperience = searchParams.get("experience") || "";
  const isVerified = searchParams.get("verified") === "true";
  const isBookingOpen = searchParams.get("booking") === "true";

  // Sync pending styles when dropdown opens
  const currentStylesRef = React.useRef(currentStyles);
  currentStylesRef.current = currentStyles;

  React.useEffect(() => {
    if (openDropdown === "style") {
      setPendingStyles(currentStylesRef.current);
    }
  }, [openDropdown]);

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleDropdown(name: string) {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  function togglePendingStyle(slug: string) {
    setPendingStyles((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function applyStyles() {
    updateParams("styles", pendingStyles.length > 0 ? pendingStyles.join(",") : null);
    setOpenDropdown(null);
  }

  function clearPendingStyles() {
    setPendingStyles([]);
  }

  // Check if a filter has active selections
  const hasStyles = currentStyles.length > 0;
  const hasLocation = currentLocation !== "";
  const hasRating = currentRating !== "";
  const hasExperience = currentExperience !== "";

  // Trigger button styles
  const triggerBase = cn(
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase transition-all duration-200"
  );

  const triggerDefault = isDark
    ? "border-ink-cream/8 text-ink-cream/30 hover:border-ink-cream/15 hover:text-ink-cream/45"
    : "border-ink-black/15 text-ink-black/55 hover:border-ink-black/25 hover:text-ink-black/70";

  const triggerActive = isDark
    ? "border-ink-red/40 text-ink-red bg-ink-red/[0.08]"
    : "border-ink-black text-ink-black bg-ink-black/[0.05]";

  // Toggle pill styles
  const toggleBase = cn(
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase transition-all duration-200 cursor-pointer"
  );

  const verifiedActive = isDark
    ? "border-ink-sage/40 text-ink-sage bg-ink-sage/[0.08]"
    : "border-ink-sage/60 text-ink-sage bg-ink-sage/[0.06]";

  const bookingActive = isDark
    ? "border-ink-red/40 text-ink-red bg-ink-red/[0.08]"
    : "border-ink-red/50 text-ink-red bg-ink-red/[0.06]";

  // Style pill inside dropdown
  const stylePillBase = cn(
    "rounded-full border px-3 py-1 font-mono text-[9px] tracking-wide transition-all duration-200 cursor-pointer"
  );
  const stylePillDefault = isDark
    ? "border-ink-cream/8 text-ink-cream/25 hover:border-ink-cream/15"
    : "border-ink-black/15 text-ink-black/55 hover:border-ink-black/25";
  const stylePillActive = isDark
    ? "border-ink-red/40 text-ink-red bg-ink-red/[0.08]"
    : "border-ink-red/50 text-ink-red bg-ink-red/[0.06]";

  // Option pill (rating, experience, location suggestions)
  const optionBase = cn(
    "rounded-lg border px-3 py-1.5 font-mono text-[9px] tracking-wide transition-all duration-200 cursor-pointer"
  );
  const optionDefault = isDark
    ? "border-ink-cream/8 text-ink-cream/25 hover:border-ink-cream/15"
    : "border-ink-black/15 text-ink-black/55 hover:border-ink-black/25";
  const optionActive = isDark
    ? "border-ink-red/40 text-ink-red bg-ink-red/[0.08]"
    : "border-ink-red/50 text-ink-red bg-ink-red/[0.06]";

  const experienceOptions = isStudios ? TEAM_SIZE_OPTIONS : EXPERIENCE_OPTIONS;

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Filter triggers row */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {/* Dropdown triggers */}
        <button
          onClick={() => toggleDropdown("style")}
          className={cn(triggerBase, hasStyles ? triggerActive : triggerDefault)}
        >
          Style
          <span
            className={cn(
              "text-[8px] transition-transform duration-200",
              openDropdown === "style" && "rotate-180"
            )}
          >
            &#9662;
          </span>
        </button>

        <button
          onClick={() => toggleDropdown("location")}
          className={cn(triggerBase, hasLocation ? triggerActive : triggerDefault)}
        >
          Location
          <span
            className={cn(
              "text-[8px] transition-transform duration-200",
              openDropdown === "location" && "rotate-180"
            )}
          >
            &#9662;
          </span>
        </button>

        <button
          onClick={() => toggleDropdown("rating")}
          className={cn(triggerBase, hasRating ? triggerActive : triggerDefault)}
        >
          Rating
          <span
            className={cn(
              "text-[8px] transition-transform duration-200",
              openDropdown === "rating" && "rotate-180"
            )}
          >
            &#9662;
          </span>
        </button>

        <button
          onClick={() => toggleDropdown("experience")}
          className={cn(triggerBase, hasExperience ? triggerActive : triggerDefault)}
        >
          {isStudios ? "Team Size" : "Experience"}
          <span
            className={cn(
              "text-[8px] transition-transform duration-200",
              openDropdown === "experience" && "rotate-180"
            )}
          >
            &#9662;
          </span>
        </button>

        {/* Inline toggles */}
        <button
          onClick={() => updateParams("verified", isVerified ? null : "true")}
          className={cn(toggleBase, isVerified ? verifiedActive : triggerDefault)}
        >
          &#10003; Verified
        </button>

        <button
          onClick={() => updateParams("booking", isBookingOpen ? null : "true")}
          className={cn(toggleBase, isBookingOpen ? bookingActive : triggerDefault)}
        >
          {isStudios ? "Walk-ins" : "Booking Open"}
        </button>
      </div>

      {/* Dropdown panels */}
      <FilterDropdown
        open={openDropdown === "style"}
        title="Style"
        variant={variant}
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          {TATTOO_STYLES.map((style) => {
            const slug = toSlug(style);
            const isSelected = pendingStyles.includes(slug);
            return (
              <button
                key={slug}
                onClick={() => togglePendingStyle(slug)}
                className={cn(
                  stylePillBase,
                  isSelected ? stylePillActive : stylePillDefault
                )}
              >
                {style}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-cream/[0.06]">
          <button
            onClick={clearPendingStyles}
            className={cn(
              "font-mono text-[9px] tracking-wide uppercase transition-colors",
              isDark
                ? "text-ink-cream/20 hover:text-ink-cream/35"
                : "text-ink-black/30 hover:text-ink-black/50"
            )}
          >
            Clear
          </button>
          <button
            onClick={applyStyles}
            className="rounded-lg bg-ink-red/90 px-3 py-1 font-mono text-[9px] tracking-wide uppercase text-white transition-colors hover:bg-ink-red"
          >
            Apply
          </button>
        </div>
      </FilterDropdown>

      <FilterDropdown
        open={openDropdown === "location"}
        title="Location"
        variant={variant}
      >
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="Search city or zip..."
          className={cn(
            "w-full rounded-lg border px-3 py-2 font-mono text-[11px] tracking-wide outline-none transition-colors mb-2",
            isDark
              ? "bg-ink-cream/[0.04] border-ink-cream/[0.08] text-ink-cream/70 placeholder:text-ink-cream/25 focus:border-ink-cream/20"
              : "bg-ink-black/[0.02] border-ink-black/[0.06] text-ink-black/70 placeholder:text-ink-black/25 focus:border-ink-black/15"
          )}
        />
        <div className="flex flex-wrap gap-1.5">
          {LOCATION_SUGGESTIONS.filter((loc) =>
            loc.toLowerCase().includes(locationQuery.toLowerCase())
          ).map((loc) => {
            const isSelected = currentLocation === loc;
            return (
              <button
                key={loc}
                onClick={() => {
                  updateParams("location", isSelected ? null : loc);
                  setOpenDropdown(null);
                }}
                className={cn(
                  optionBase,
                  isSelected ? optionActive : optionDefault
                )}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </FilterDropdown>

      <FilterDropdown
        open={openDropdown === "rating"}
        title="Rating"
        variant={variant}
      >
        <div className="flex flex-wrap gap-1.5">
          {RATING_OPTIONS.map((opt) => {
            const isAny = opt === "Any";
            const isSelected = isAny ? currentRating === "" : currentRating === opt;
            return (
              <button
                key={opt}
                onClick={() => {
                  updateParams("rating", isAny ? null : opt);
                  setOpenDropdown(null);
                }}
                className={cn(
                  optionBase,
                  isSelected ? optionActive : optionDefault
                )}
              >
                {isAny ? "Any" : `\u2605 ${opt}+`}
              </button>
            );
          })}
        </div>
      </FilterDropdown>

      <FilterDropdown
        open={openDropdown === "experience"}
        title={isStudios ? "Team Size" : "Experience"}
        variant={variant}
      >
        <div className="flex flex-wrap gap-1.5">
          {experienceOptions.map((opt) => {
            const isAny = opt === "Any";
            const isSelected = isAny
              ? currentExperience === ""
              : currentExperience === opt;
            return (
              <button
                key={opt}
                onClick={() => {
                  updateParams("experience", isAny ? null : opt);
                  setOpenDropdown(null);
                }}
                className={cn(
                  optionBase,
                  isSelected ? optionActive : optionDefault
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </FilterDropdown>

      {/* Active filter chips */}
      <FilterChips variant={variant} />
    </div>
  );
}

const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ variant = "dark", className, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <Suspense fallback={null}>
          <FilterBarInner variant={variant} className={className} />
        </Suspense>
      </div>
    );
  }
);

FilterBar.displayName = "FilterBar";

export { FilterBar };
