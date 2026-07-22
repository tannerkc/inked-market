import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HEART_PATH } from "./unsave-button";
import type { SavedTabValue } from "./saved-tabs";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SavedEmptyStateProps {
  tab?: SavedTabValue;
  className?: string;
}

// ─── Tab-specific content ───────────────────────────────────────────────────

const tabContent: Record<
  SavedTabValue,
  { heading: string; description: string; cta: string; href: string }
> = {
  all: {
    heading: "Nothing saved yet",
    description:
      "Tap the heart on any artist, studio, or tattoo piece to save it here.",
    cta: "Explore Artists",
    href: "/discover",
  },
  studios: {
    heading: "No studios saved yet",
    description: "Find studios you love and save them for later.",
    cta: "Browse Studios",
    href: "/discover",
  },
  artists: {
    heading: "No artists saved yet",
    description: "Discover talented artists and save your favorites.",
    cta: "Discover Artists",
    href: "/discover",
  },
  portfolio: {
    heading: "No pieces saved yet",
    description: "Save tattoo pieces that inspire you.",
    cta: "Explore Work",
    href: "/discover",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

const SavedEmptyState = React.forwardRef<HTMLDivElement, SavedEmptyStateProps>(
  ({ tab = "all", className }, ref) => {
    const content = tabContent[tab];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center py-20 px-6",
          className
        )}
      >
        {/* Heart icon */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-ink-black/[0.04] border border-ink-black/[0.06] dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.06]">
          <svg className="w-5 h-5 text-ink-black/[0.15] dark:text-ink-cream/[0.15]" viewBox="0 0 24 24" fill="currentColor">
            <path d={HEART_PATH} />
          </svg>
        </div>

        {/* Heading */}
        <h3 className="text-sm font-semibold mb-1.5 text-ink-black/70 dark:text-ink-cream/70">
          {content.heading}
        </h3>

        {/* Description */}
        <p className="text-[11px] max-w-[240px] leading-relaxed mb-6 text-ink-black/35 dark:text-ink-cream/35">
          {content.description}
        </p>

        {/* CTA */}
        <Link
          href={content.href}
          className="px-6 py-2.5 bg-ink-red text-ink-cream rounded-full font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-ink-red/90 transition-colors"
        >
          {content.cta}
        </Link>
      </div>
    );
  }
);

SavedEmptyState.displayName = "SavedEmptyState";

export { SavedEmptyState };
