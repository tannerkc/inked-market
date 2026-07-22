import React from "react";
import { cn } from "@/lib/utils";

interface SearchBoostCalloutProps {
  className?: string;
}

function SearchBoostCallout({ className }: SearchBoostCalloutProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border",
        "border-ink-black/[0.06] bg-ink-black/[0.02]",
        "dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Lightning bolt icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-ink-rust/10 text-ink-rust">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-ink-black dark:text-ink-cream">
              Search Boost
            </h4>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full bg-ink-rust/10 text-ink-rust dark:bg-ink-rust/15">
              $4.85/wk
            </span>
          </div>
          <p className="text-xs text-ink-black/35 dark:text-ink-cream/35">
            Get priority placement in search results for 7 days. Available for Pro artists.
          </p>
        </div>
      </div>

      <span className="font-mono text-[9px] tracking-[0.15em] uppercase shrink-0 text-ink-black/20 dark:text-ink-cream/20">
        Add-on
      </span>
    </div>
  );
}

export { SearchBoostCallout };
