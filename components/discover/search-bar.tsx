"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DiscoverSearchProps {
  disabled?: boolean;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const DiscoverSearch = React.forwardRef<HTMLDivElement, DiscoverSearchProps>(
  ({ disabled = false, defaultValue = "", onSearch, className }, ref) => {
    const [query, setQuery] = React.useState(defaultValue);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch && query.trim()) {
        onSearch(query.trim());
      }
    };

    return (
      <div ref={ref} className={cn("max-w-xl mx-auto", className)}>
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-center rounded-full h-10 pr-[var(--pill-inset)] pl-4 transition-all duration-500",
            "bg-white border border-ink-black/8",
            "dark:bg-ink-cream/[0.03] dark:border-ink-cream/6"
          )}
        >
          <svg
            className="w-4 h-4 mr-2.5 shrink-0 text-ink-black/30 dark:text-ink-cream/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="style, city, or vibe..."
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent border-none outline-none font-mono text-[11px] tracking-wide placeholder:opacity-40",
              "text-ink-black placeholder:text-ink-black",
              "dark:text-ink-cream dark:placeholder:text-ink-cream/30"
            )}
          />
          <button
            type="submit"
            disabled={disabled}
            className={cn(
              "shrink-0 rounded-full font-mono text-[10px] tracking-[0.12em] uppercase px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] transition-all duration-500 border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
              "bg-ink-black text-ink-cream",
              "dark:bg-ink-red dark:text-white dark:shadow-ink-red-glow"
            )}
          >
            Search
          </button>
        </form>
      </div>
    );
  }
);
DiscoverSearch.displayName = "DiscoverSearch";

export { DiscoverSearch };
