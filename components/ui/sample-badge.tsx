import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Low-emphasis indicator shown when a section or card is rendering placeholder /
 * sample data instead of real database content (mock fallback). Use at section
 * scope ("these listings are samples") or per-item on cards.
 */
export const SampleBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { label?: string }
>(({ className, label = "Sample", ...props }, ref) => (
  <span
    ref={ref}
    title="Placeholder content — not yet live data"
    className={cn(
      "inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5",
      "text-[10px] font-medium uppercase tracking-wider text-amber-700",
      "dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
      className,
    )}
    {...props}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
    {label}
  </span>
));
SampleBadge.displayName = "SampleBadge";
