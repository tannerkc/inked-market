"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { PillToggle } from "@/components/ui/pill-toggle";
import type { BillingCycle } from "@/lib/types";

interface BillingCycleToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  className?: string;
}

const CYCLE_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Annual", value: "annual" },
];

const BillingCycleToggle = React.forwardRef<HTMLDivElement, BillingCycleToggleProps>(
  ({ cycle, onChange, className }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)}>
        <PillToggle
          options={CYCLE_OPTIONS}
          value={cycle}
          onChange={(v) => onChange(v as BillingCycle)}
          isDark={isDark}
        />
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
