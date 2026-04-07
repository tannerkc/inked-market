"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { bebasNeue, permanentMarker } from "@/lib/fonts";
import type { LineupIssue } from "@/lib/types/lineup";

export interface IssueCardProps {
  issue: LineupIssue;
  isActive?: boolean;
  onSelect: (issueId: string) => void;
  variant?: "light" | "dark";
  className?: string;
}

const IssueCard = React.forwardRef<HTMLButtonElement, IssueCardProps>(
  ({ issue, isActive = false, onSelect, variant = "dark", className }, ref) => {
    const isLight = variant === "light";
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
            : isLight
              ? "border-ink-black/[0.08] hover:border-ink-black/[0.15]"
              : "border-ink-cream/[0.06] hover:border-ink-cream/[0.12]",
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
            <p
              className={cn(
                permanentMarker.className,
                "text-[10px] text-ink-red tracking-[0.15em] -rotate-1 inline-block"
              )}
            >
              Issue No. {String(number).padStart(2, "0")}
            </p>
            <p
              className={cn(
                bebasNeue.className,
                "text-xl tracking-wider text-ink-cream leading-tight mt-0.5"
              )}
            >
              {coverStory.name}
            </p>
          </div>
        </div>

        {/* Info */}
        <div
          className={cn(
            "px-4 py-3 transition-colors duration-500",
            isLight ? "bg-white/50" : ""
          )}
        >
          <p
            className={cn(
              "font-mono text-[10px] tracking-wider",
              isLight ? "text-ink-black/30" : "text-ink-cream/30"
            )}
          >
            {formattedDate}
          </p>
          <p
            className={cn(
              "text-xs mt-1 line-clamp-2",
              isLight ? "text-ink-black/50" : "text-ink-cream/50"
            )}
          >
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
