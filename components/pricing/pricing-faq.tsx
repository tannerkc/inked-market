"use client";

import React from "react";
import { FaqAccordion } from "@/components/help/faq-accordion";
import type { HelpFaqItem } from "@/lib/data/help-types";

const PRICING_FAQ_ITEMS: HelpFaqItem[] = [
  {
    id: "switch-plans",
    question: "Can I switch plans at any time?",
    answer: (
      <p>
        Yes. You can upgrade or downgrade your plan at any time. Changes take
        effect on your next billing cycle, so you&apos;ll keep your current
        features until then.
      </p>
    ),
    audiences: ["customer", "artist", "studio-owner"],
  },
  {
    id: "contract",
    question: "Is there a contract or commitment?",
    answer: (
      <p>
        No contracts. All plans are month-to-month, or annual if you choose the
        discounted option. You can cancel anytime with no penalties.
      </p>
    ),
    audiences: ["customer", "artist", "studio-owner"],
  },
  {
    id: "cancel",
    question: "What happens if I cancel?",
    answer: (
      <p>
        Your listing stays active until the end of your current billing period.
        After that, artist profiles revert to the Free tier and studio listings
        are unlisted from the marketplace.
      </p>
    ),
    audiences: ["artist", "studio-owner"],
  },
  {
    id: "annual-billing",
    question: "Do you offer annual billing?",
    answer: (
      <p>
        Yes. Save 20% by paying annually. Use the billing toggle above the
        pricing cards to see annual pricing.
      </p>
    ),
    audiences: ["artist", "studio-owner"],
  },
  {
    id: "multiple-studios",
    question: "Can artists work at multiple studios?",
    answer: (
      <p>
        Yes. Pro artists can associate with any number of studios while
        maintaining their own independent profile and listing on the Discover
        page.
      </p>
    ),
    audiences: ["artist", "studio-owner"],
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: (
      <p>
        All major credit cards, debit cards, and Apple Pay. Invoicing is
        available for annual Studio-tier plans.
      </p>
    ),
    audiences: ["customer", "artist", "studio-owner"],
  },
];

interface PricingFaqProps {
  variant?: "light" | "dark";
  className?: string;
}

function PricingFaq({ variant = "dark", className }: PricingFaqProps) {
  return (
    <div className={className}>
      <h2
        className={
          variant === "dark"
            ? "font-mono text-[10px] tracking-[0.2em] uppercase text-ink-cream/25 mb-6 text-center"
            : "font-mono text-[10px] tracking-[0.2em] uppercase text-ink-black/25 mb-6 text-center"
        }
      >
        Frequently Asked Questions
      </h2>
      <FaqAccordion
        items={PRICING_FAQ_ITEMS}
        accentColor="rust"
        variant={variant}
      />
    </div>
  );
}

export { PricingFaq };
