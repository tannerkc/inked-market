import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTierCardProps {
  name: string;
  price: number;
  annualPrice?: number;
  isAnnual?: boolean;
  description: string;
  features: PricingFeature[];
  recommended?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
  className?: string;
}

function PricingTierCard({
  name,
  price,
  annualPrice,
  isAnnual = false,
  description,
  features,
  recommended = false,
  ctaLabel = "Get Started",
  onSelect,
  className,
}: PricingTierCardProps) {
  const showAnnual = isAnnual && annualPrice !== undefined;
  const displayPrice = showAnnual ? annualPrice : price;
  const isFree = price === 0;

  return (
    <div
      className={cn(
        "relative flex flex-col p-7 rounded-2xl border transition-all duration-300",
        recommended
          ? "border-ink-rust/40 bg-ink-black/[0.04] dark:bg-ink-cream/[0.05]"
          : "border-ink-black/[0.06] bg-ink-black/[0.02] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.03]",
        className
      )}
    >
      {/* Best Value badge */}
      {recommended && (
        <div className="absolute -top-3 left-7 px-3 py-1 rounded-full font-mono text-[9px] tracking-[0.15em] uppercase bg-ink-rust text-white dark:text-ink-cream">
          Best Value
        </div>
      )}

      {/* Tier name */}
      <span className="font-mono text-[10px] tracking-[0.15em] uppercase mb-4 text-ink-black/30 dark:text-ink-cream/30">
        {name}
      </span>

      {/* Price */}
      <div className="mb-2">
        {isFree ? (
          <span className="text-4xl font-bold text-ink-black dark:text-ink-cream">
            Free
          </span>
        ) : (
          <div className="flex items-baseline gap-1">
            {showAnnual && (
              <span className="text-lg line-through mr-1 text-ink-black/20 dark:text-ink-cream/20">
                ${price.toFixed(2)}
              </span>
            )}
            <span className="text-4xl font-bold text-ink-black dark:text-ink-cream">
              ${displayPrice.toFixed(2)}
            </span>
            <span className="text-sm text-ink-black/30 dark:text-ink-cream/30">
              /mo
            </span>
          </div>
        )}
      </div>

      {/* Annual billing note */}
      {showAnnual && !isFree && (
        <p className="font-mono text-[9px] tracking-[0.1em] uppercase mb-4 text-ink-black/20 dark:text-ink-cream/20">
          Billed annually
        </p>
      )}
      {!showAnnual && !isFree && <div className="mb-4" />}
      {isFree && <div className="mb-4" />}

      {/* Description */}
      <p className="text-sm leading-relaxed mb-6 text-ink-black/40 dark:text-ink-cream/40">
        {description}
      </p>

      {/* Feature list */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            {feature.included ? (
              <svg
                className="w-4 h-4 mt-0.5 shrink-0 text-ink-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mt-0.5 shrink-0 text-ink-black/15 dark:text-ink-cream/15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 12H4"
                />
              </svg>
            )}
            <span
              className={cn(
                "text-sm",
                feature.included
                  ? "text-ink-black/60 dark:text-ink-cream/60"
                  : "text-ink-black/20 dark:text-ink-cream/20"
              )}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <Button
        variant={recommended ? "ink-red" : "ink-outline"}
        size="md"
        className="w-full"
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

export { PricingTierCard };
export type { PricingTierCardProps, PricingFeature };
