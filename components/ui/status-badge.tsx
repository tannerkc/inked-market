import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeColor {
  /** Class string applied in dark mode (under [data-theme="dark"]). */
  dark: string;
  /** Class string applied in light mode (default). */
  light: string;
}

export interface StatusBadgeProps {
  label: string;
  color: StatusBadgeColor;
  className?: string;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ label, color, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-mono text-[8px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border inline-block whitespace-nowrap",
        color.light,
        // Apply dark variant via CSS attribute selector so this stays a Server Component.
        // Each token in color.dark is prefixed with `dark:` to flip on [data-theme="dark"].
        color.dark.split(/\s+/).filter(Boolean).map((c) => `dark:${c}`).join(" "),
        className
      )}
      {...props}
    >
      {label}
    </span>
  )
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge };

export const BADGE_COLORS = {
  sage: {
    dark: "border-ink-sage/20 text-ink-sage/70 bg-ink-sage/[0.08]",
    light: "border-ink-sage/20 text-ink-sage/70 bg-ink-sage/[0.08]",
  },
  rust: {
    dark: "border-ink-rust/20 text-ink-rust/70 bg-ink-rust/[0.08]",
    light: "border-ink-rust/20 text-ink-rust/70 bg-ink-rust/[0.08]",
  },
  red: {
    dark: "border-ink-red/15 text-ink-red/50 bg-ink-red/[0.05]",
    light: "border-ink-red/15 text-ink-red/50 bg-ink-red/[0.05]",
  },
  muted: {
    dark: "border-ink-cream/10 text-ink-cream/30 bg-ink-cream/[0.03]",
    light: "border-ink-black/10 text-ink-black/30 bg-ink-black/[0.03]",
  },
  /** Specialty/style tag chip — rust in light mode, red in dark. */
  tag: {
    dark: "border-ink-red/30 bg-ink-red/[0.06] text-ink-red",
    light: "border-ink-rust/25 bg-ink-rust/[0.05] text-ink-rust",
  },
  /** Outline-only variant of `tag` for quieter contexts. */
  tagOutline: {
    dark: "border-ink-red/20 text-ink-red/65",
    light: "border-ink-rust/20 text-ink-rust/65",
  },
} as const satisfies Record<string, StatusBadgeColor>;
