"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import type { BillingCycle } from "@/lib/types";

interface BillingCycleToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  className?: string;
}

const BillingCycleToggle = React.forwardRef<HTMLDivElement, BillingCycleToggleProps>(
  ({ cycle, onChange, className }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)}>
        <div
          className={cn(
            "inline-flex rounded-full overflow-hidden border",
            isDark ? "border-ink-cream/[0.08]" : "border-ink-black/[0.08]"
          )}
        >
          <button
            type="button"
            onClick={() => onChange("monthly")}
            className={cn(
              "px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase transition-all cursor-pointer",
              cycle === "monthly"
                ? isDark
                  ? "bg-ink-cream text-ink-black"
                  : "bg-ink-black text-ink-cream"
                : isDark
                  ? "text-ink-cream/40 hover:text-ink-cream/60"
                  : "text-ink-black/40 hover:text-ink-black/60"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onChange("annual")}
            className={cn(
              "px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase transition-all cursor-pointer",
              cycle === "annual"
                ? isDark
                  ? "bg-ink-cream text-ink-black"
                  : "bg-ink-black text-ink-cream"
                : isDark
                  ? "text-ink-cream/40 hover:text-ink-cream/60"
                  : "text-ink-black/40 hover:text-ink-black/60"
            )}
          >
            Annual
          </button>
        </div>
        {cycle === "annual" && (
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink-sage">
            Save ~20%
          </span>
        )}
      </div>
    );
  }
);
BillingCycleToggle.displayName = "BillingCycleToggle";

export { BillingCycleToggle };
