import React from "react";
import { cn } from "@/lib/utils";

interface PanelEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  message: string;
  /** Optional decorative glyph row rendered above the title (text characters, not emoji) */
  glyph?: React.ReactNode;
}

/**
 * Designed empty state for the dark detail/widget panels (reviews, hours,
 * contact). Keeps empty sections looking intentional instead of broken.
 */
const PanelEmptyState = React.forwardRef<HTMLDivElement, PanelEmptyStateProps>(
  ({ title, message, glyph, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 rounded-lg border border-dashed border-ink-cream/10 px-5 py-6 text-center",
        className
      )}
      {...props}
    >
      {glyph ? (
        <div aria-hidden="true" className="mb-2.5 text-sm tracking-[0.35em] text-ink-cream/15">
          {glyph}
        </div>
      ) : null}
      <p className="text-[13px] font-semibold text-ink-cream/70">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[26ch] text-xs leading-relaxed text-ink-cream/40">
        {message}
      </p>
    </div>
  )
);
PanelEmptyState.displayName = "PanelEmptyState";

export { PanelEmptyState };
