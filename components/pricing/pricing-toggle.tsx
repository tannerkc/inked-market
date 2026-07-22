"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Audience = "artists" | "studios";

interface PricingToggleProps {
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
  isAnnual: boolean;
  onBillingChange: (isAnnual: boolean) => void;
  className?: string;
}

const audienceOptions: Array<{ value: Audience; label: string }> = [
  { value: "artists", label: "For Artists" },
  { value: "studios", label: "For Studios" },
];

function PricingToggle({
  audience,
  onAudienceChange,
  isAnnual,
  onBillingChange,
  className,
}: PricingToggleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Audience toggle */}
      <div className="flex gap-2">
        {audienceOptions.map((opt) => {
          const isActive = opt.value === audience;
          return (
            <button
              key={opt.value}
              onClick={() => onAudienceChange(opt.value)}
              className={cn(
                "px-5 py-2 rounded-full font-mono text-[10px] tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300 border cursor-pointer",
                isActive
                  ? "bg-ink-black text-ink-cream border-ink-black dark:bg-ink-cream dark:text-ink-black dark:border-ink-cream"
                  : "bg-transparent text-ink-black/35 border-ink-black/[0.08] hover:border-ink-black/15 hover:text-ink-black/50 dark:text-ink-cream/30 dark:border-ink-cream/[0.08] dark:hover:border-ink-cream/15 dark:hover:text-ink-cream/50"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onBillingChange(false)}
          className={cn(
            "px-3 py-1 rounded-full font-mono text-[9px] tracking-[0.1em] uppercase transition-all duration-300 border cursor-pointer",
            !isAnnual
              ? "bg-ink-black/10 text-ink-black/70 border-ink-black/15 dark:bg-ink-cream/10 dark:text-ink-cream/70 dark:border-ink-cream/15"
              : "bg-transparent text-ink-black/25 border-transparent hover:text-ink-black/40 dark:text-ink-cream/25 dark:hover:text-ink-cream/40"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => onBillingChange(true)}
          className={cn(
            "px-3 py-1 rounded-full font-mono text-[9px] tracking-[0.1em] uppercase transition-all duration-300 border cursor-pointer flex items-center gap-1.5",
            isAnnual
              ? "bg-ink-black/10 text-ink-black/70 border-ink-black/15 dark:bg-ink-cream/10 dark:text-ink-cream/70 dark:border-ink-cream/15"
              : "bg-transparent text-ink-black/25 border-transparent hover:text-ink-black/40 dark:text-ink-cream/25 dark:hover:text-ink-cream/40"
          )}
        >
          Annual
          <span className="px-1.5 py-0.5 rounded-full text-[8px] tracking-[0.05em] bg-ink-sage/15 text-ink-sage dark:bg-ink-sage/20">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}

export { PricingToggle };
export type { PricingToggleProps, Audience };
