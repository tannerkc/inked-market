"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { bebasNeue } from "@/lib/fonts";

interface StatCardProps {
  label: string;
  value: string | number;
  empty?: boolean;
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, empty = false, className, ...props }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[14px] p-3.5 text-center border transition-transform hover:-translate-y-px",
          isDark
            ? "bg-ink-cream/[0.03] border-ink-cream/[0.06]"
            : "bg-ink-black/[0.02] border-ink-black/[0.06]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            bebasNeue.className,
            "text-[28px] tracking-wider leading-none",
            empty
              ? isDark ? "text-ink-cream/25" : "text-ink-black/25"
              : isDark ? "text-ink-cream" : "text-ink-black"
          )}
        >
          {value}
        </div>
        <div className={cn(
          "font-mono text-[8px] tracking-[0.15em] uppercase mt-1",
          isDark ? "text-ink-cream/35" : "text-ink-black/35"
        )}>
          {label}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };
