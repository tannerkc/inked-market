import React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  label: string;
  /**
   * Visual style. `muted` is theme-aware (replaces the legacy parchment/dark-muted pair).
   * `dark`/`light` map to the rust/red accents. `parchment` and `dark-muted` are kept for
   * back-compat — prefer `muted` going forward.
   */
  variant?: "light" | "dark" | "parchment" | "dark-muted" | "muted";
  stretch?: boolean;
  className?: string;
}

const lineClassMap = {
  muted: "bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]",
  parchment: "bg-ink-black/[0.06]",
  "dark-muted": "bg-ink-cream/[0.06]",
  dark: "bg-ink-rust",
  light: "bg-ink-red/40",
} as const;

const textClassMap = {
  muted: "text-ink-black/30 dark:text-ink-cream/30",
  parchment: "text-ink-black/30",
  "dark-muted": "text-ink-cream/30",
  dark: "text-ink-rust",
  light: "text-ink-cream/30",
} as const;

const SectionLabel = React.forwardRef<HTMLDivElement, SectionLabelProps>(
  ({ label, variant = "dark", stretch = false, className }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center gap-3", className)}>
      <div className={cn("h-px", stretch ? "flex-1" : "w-8", lineClassMap[variant])} />
      <p className={cn("font-mono text-xs tracking-[0.25em] uppercase", textClassMap[variant])}>
        {label}
      </p>
      <div className={cn("h-px", stretch ? "flex-1" : "w-8", lineClassMap[variant])} />
    </div>
  )
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
