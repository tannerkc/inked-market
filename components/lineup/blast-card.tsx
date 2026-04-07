import React from "react";
import { cn } from "@/lib/utils";
import type { LineupEvent } from "@/lib/types/lineup";

export interface BlastCardProps {
  event: LineupEvent;
  past?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

const eventTypeLabels: Record<LineupEvent["type"], string> = {
  flash: "Flash Event",
  "guest-spot": "Guest Spot",
  sale: "Sale",
  opening: "Opening",
};

const BlastCard = React.forwardRef<HTMLDivElement, BlastCardProps>(
  ({ event, past = false, variant = "dark", className }, ref) => {
    const isLight = variant === "light";
    const { type, title, details, date, ctaLabel } = event;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-6 transition-colors duration-200",
          past
            ? isLight
              ? "border-ink-black/[0.06] opacity-50"
              : "border-ink-cream/[0.04] opacity-50"
            : "border-ink-red/15 bg-gradient-to-br from-ink-red/[0.04] to-transparent hover:border-ink-red/25 hover:from-ink-red/[0.07]",
          className
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-red">
            {!past && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink-red opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ink-red" />
              </span>
            )}
            {past && (
              <span
                className={cn(
                  "px-1.5 py-px rounded text-[8px]",
                  isLight
                    ? "bg-ink-black/10 text-ink-black/40"
                    : "bg-ink-cream/10 text-ink-cream/40"
                )}
              >
                Past
              </span>
            )}
            {eventTypeLabels[type]}
          </span>
          <span
            className={cn(
              "font-mono text-[11px] tracking-wider",
              isLight ? "text-ink-black/30" : "text-ink-cream/30"
            )}
          >
            {date}
          </span>
        </div>
        <h4
          className={cn(
            "text-lg font-bold mb-1.5 transition-colors duration-500",
            isLight ? "text-ink-black" : "text-ink-cream"
          )}
        >
          {title}
        </h4>
        <p
          className={cn(
            "text-sm mb-4 transition-colors duration-500",
            isLight ? "text-ink-black/50" : "text-ink-cream/45"
          )}
        >
          {details}
        </p>
        {!past && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ink-red text-white font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-ink-red/90 transition-colors"
          >
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    );
  }
);

BlastCard.displayName = "BlastCard";

export { BlastCard };
