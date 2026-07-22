import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Audience } from "./pricing-toggle";

const ctaContent: Record<
  Audience,
  { heading: string; description: string }
> = {
  studios: {
    heading: "Ready to grow your studio?",
    description: "Join Inked Market and get discovered by clients in your area.",
  },
  artists: {
    heading: "Ready to showcase your work?",
    description: "Build your portfolio and get discovered by clients looking for your style.",
  },
};

interface PricingCtaProps {
  audience: Audience;
  className?: string;
}

function PricingCta({ audience, className }: PricingCtaProps) {
  const content = ctaContent[audience];

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border",
        "border-ink-black/[0.06] bg-ink-black/[0.02]",
        "dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]",
        className
      )}
    >
      <div className="text-center sm:text-left">
        <h4 className="text-sm font-semibold mb-1 text-ink-black dark:text-ink-cream">
          {content.heading}
        </h4>
        <p className="text-xs text-ink-black/35 dark:text-ink-cream/30">
          {content.description}
        </p>
      </div>
      <Button
        as={Link}
        href="/login"
        variant="ink-outline"
        size="sm"
        rightIcon="arrow-right"
        className="shrink-0"
      >
        Get Started
      </Button>
    </div>
  );
}

export { PricingCta };
