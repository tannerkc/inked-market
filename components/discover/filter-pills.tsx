"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FilterPillsProps {
  filters: string[];
  activeFilter: string;
  onFilterChange?: (filter: string) => void;
  className?: string;
}

const FilterPills = React.forwardRef<HTMLDivElement, FilterPillsProps>(
  ({ filters, activeFilter, onFilterChange, className }, ref) => (
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
              isActive
                ? "bg-ink-black text-ink-cream border-ink-black dark:bg-ink-red/10 dark:text-ink-red dark:border-ink-red/30"
                : "bg-transparent text-ink-black/45 border-ink-black/10 hover:border-ink-black/20 hover:text-ink-black/60 dark:text-ink-cream/35 dark:border-ink-cream/8 dark:hover:border-ink-cream/15 dark:hover:text-ink-cream/50"
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  )
);
FilterPills.displayName = "FilterPills";

export { FilterPills };
