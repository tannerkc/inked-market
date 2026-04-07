"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

export interface StatusBadgeColor {
  dark: string;
  light: string;
}

export interface StatusBadgeProps {
  label: string;
  color: StatusBadgeColor;
  className?: string;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ label, color, className, ...props }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <span
        ref={ref}
        className={cn(
          "font-mono text-[8px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border inline-block whitespace-nowrap",
          isDark ? color.dark : color.light,
          className
        )}
        {...props}
      >
        {label}
      </span>
    );
  }
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
} as const satisfies Record<string, StatusBadgeColor>;
