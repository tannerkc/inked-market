"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FilterPillsProps {
  filters: string[];
  activeFilter: string;
  variant: "light" | "dark";
  onFilterChange?: (filter: string) => void;
  className?: string;
}

const FilterPills = React.forwardRef<HTMLDivElement, FilterPillsProps>(
  ({ filters, activeFilter, variant, onFilterChange, className }, ref) => {
    const isLight = variant === "light";

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-2 justify-center flex-wrap overflow-x-auto",
          className
        )}
      >
        {filters.map((filter) => {
          const isActive = filter === activeFilter;

          return (
            <button
              key={filter}
              onClick={() => onFilterChange?.(filter)}
              className={cn(
                "px-4 py-1.5 rounded-full font-mono text-[10px] tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300 border cursor-pointer",
                isActive && isLight &&
                  "bg-ink-black text-ink-cream border-ink-black",
                isActive && !isLight &&
                  "bg-ink-red/10 text-ink-red border-ink-red/30",
                !isActive && isLight &&
                  "bg-transparent text-ink-black/45 border-ink-black/10 hover:border-ink-black/20 hover:text-ink-black/60",
                !isActive && !isLight &&
                  "bg-transparent text-ink-cream/35 border-ink-cream/8 hover:border-ink-cream/15 hover:text-ink-cream/50"
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>
    );
  }
);
FilterPills.displayName = "FilterPills";

export { FilterPills };
