"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SignupTierData } from "@/lib/data/signup-tiers";
import type { BillingCycle, TierSlug } from "@/lib/types";

interface PlanComparisonProps {
  tiers: SignupTierData[];
  currentPlan: TierSlug | null;
  cycle: BillingCycle;
  onSelect: (plan: TierSlug) => void;
  className?: string;
}

const PlanComparison = React.forwardRef<HTMLDivElement, PlanComparisonProps>(
  ({ tiers, currentPlan, cycle, onSelect, className }, ref) => (
    <div ref={ref} className={cn("grid gap-4", tiers.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2", className)}>
      {tiers.map((tier) => {
        const slug = tier.slug as TierSlug;
        const isCurrent = slug === currentPlan;
        const tierIdx = tiers.findIndex((t) => t.slug === slug);
        const currentIdx = tiers.findIndex((t) => t.slug === currentPlan);
        const isUpgrade = tierIdx > currentIdx;
        const isDowngrade = tierIdx < currentIdx;
        const price = cycle === "annual" && tier.annualPrice ? tier.annualPrice : tier.price;

        return (
          <div
            key={tier.slug}
            className={cn(
              "rounded-[16px] border p-4 flex flex-col",
              isCurrent
                ? "border-ink-rust/30 bg-ink-rust/[0.04]"
                : "border-ink-black/[0.06] bg-ink-black/[0.02] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] tracking-[0.08em] uppercase font-medium text-ink-black/70 dark:text-ink-cream/70">
                {tier.name}
              </span>
              {tier.badge && (
                <span className={cn(
                  "font-mono text-[7px] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded",
                  tier.badgeColor === "red" ? "bg-ink-red/15 text-ink-red" : "bg-ink-rust/15 text-ink-rust"
                )}>
                  {tier.badge}
                </span>
              )}
              {isCurrent && (
                <span className="font-mono text-[7px] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded bg-ink-rust/15 text-ink-rust">
                  Current
                </span>
              )}
            </div>

            <p className="text-[18px] font-semibold mb-1 text-ink-black/80 dark:text-ink-cream/80">
              {price === 0 ? "Free" : `$${price}`}
              {price > 0 && <span className="text-[11px] font-normal text-ink-black/30 dark:text-ink-cream/30">/mo</span>}
            </p>

            <p className="text-[10px] mb-3 text-ink-black/30 dark:text-ink-cream/30">
              {tier.description}
            </p>

            <div className="flex-1 space-y-1.5 mb-4">
              {tier.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn(
                    "text-[10px] mt-0.5 shrink-0",
                    f.included ? "text-ink-sage" : "text-ink-black/15 dark:text-ink-cream/15"
                  )}>
                    {f.included ? "✓" : "—"}
                  </span>
                  <span className={cn(
                    "text-[10px]",
                    f.included
                      ? "text-ink-black/50 dark:text-ink-cream/50"
                      : "text-ink-black/20 dark:text-ink-cream/20"
                  )}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {isCurrent ? (
              <div className="text-center font-mono text-[9px] tracking-[0.12em] uppercase py-2 text-ink-black/25 dark:text-ink-cream/25">
                Current Plan
              </div>
            ) : (
              <Button
                variant={isUpgrade ? "ink" : "ink-outline"}
                size="sm"
                className="w-full"
                onClick={() => onSelect(slug)}
              >
                {isUpgrade ? `Upgrade to ${tier.name}` : isDowngrade ? `Downgrade to ${tier.name}` : `Select ${tier.name}`}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  )
);
PlanComparison.displayName = "PlanComparison";

export { PlanComparison };
