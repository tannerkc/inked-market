"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { bebasNeue, permanentMarker } from "@/lib/fonts";
import type { LineupIssue } from "@/lib/types/lineup";

export interface IssueCardProps {
  issue: LineupIssue;
  isActive?: boolean;
  onSelect: (issueId: string) => void;
  className?: string;
}

const IssueCard = React.forwardRef<HTMLButtonElement, IssueCardProps>(
  ({ issue, isActive = false, onSelect, className }, ref) => {
    const { id, number, date, coverStory } = issue;
    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onSelect(id)}
        className={cn(
          "text-left rounded-2xl border overflow-hidden transition-all duration-200 group",
          isActive
            ? "border-ink-red/30 ring-1 ring-ink-red/20"
            : "border-ink-black/[0.08] hover:border-ink-black/[0.15] dark:border-ink-cream/[0.06] dark:hover:border-ink-cream/[0.12]",
          className
        )}
      >
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${coverStory.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-black/90 via-ink-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className={`${permanentMarker.className} text-[10px] text-ink-red tracking-[0.15em] -rotate-1 inline-block`}>
              Issue No. {String(number).padStart(2, "0")}
            </p>
            <p className={`${bebasNeue.className} text-xl tracking-wider text-ink-cream leading-tight mt-0.5`}>
              {coverStory.name}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3 transition-colors duration-500 bg-white/50 dark:bg-transparent">
          <p className="font-mono text-[10px] tracking-wider text-ink-black/30 dark:text-ink-cream/30">
            {formattedDate}
          </p>
          <p className="text-xs mt-1 line-clamp-2 text-ink-black/50 dark:text-ink-cream/50">
            {coverStory.excerpt}
          </p>
          {isActive && (
            <p className="font-mono text-[9px] text-ink-red tracking-[0.15em] uppercase mt-2">
              Currently Viewing
            </p>
          )}
        </div>
      </button>
    );
  }
);

IssueCard.displayName = "IssueCard";

export { IssueCard };
