"use client";

import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { PageHero, BackToTop } from "@/components/content";
import { Divider } from "@/components/ui/divider";
import {
  PricingTierCard,
  PricingToggle,
  SearchBoostCallout,
  PricingFaq,
  PricingCta,
} from "@/components/pricing";
import type { PricingFeature } from "@/components/pricing/pricing-tier-card";
import type { Audience } from "@/components/pricing/pricing-toggle";
import {
  artistTiers as signupArtistTiers,
  studioTiers as signupStudioTiers,
} from "@/lib/data/signup-tiers";

/* ─── Tier data (prices from signup-tiers.ts, features expanded for pricing page) */

interface TierData {
  name: string;
  price: number;
  annualPrice?: number;
  description: string;
  features: PricingFeature[];
  recommended?: boolean;
  ctaLabel?: string;
}

const artistTiers: TierData[] = [
  {
    name: signupArtistTiers[0].name,
    price: signupArtistTiers[0].price,
    annualPrice: signupArtistTiers[0].annualPrice,
    description:
      "Manage your profile and gallery on your studio\u2019s page.",
    features: [
      { text: "Profile & gallery management", included: true },
      { text: "Gallery displayed on studio page", included: true },
      { text: "Must be linked to a studio", included: true },
      { text: "Public listing on Discover", included: false },
      { text: "Independent artist profile", included: false },
    ],
    ctaLabel: "Get Started Free",
  },
  {
    name: signupArtistTiers[1].name,
    price: signupArtistTiers[1].price,
    annualPrice: signupArtistTiers[1].annualPrice,
    description:
      "Go independent. Get your own listing and be discovered by clients.",
    features: [
      { text: "Profile & gallery management", included: true },
      { text: "Gallery displayed on studio page", included: true },
      { text: "No studio requirement", included: true },
      { text: "Public listing on Discover", included: true },
      { text: "Independent artist profile", included: true },
    ],
    recommended: true,
  },
];

const studioTiers: TierData[] = [
  {
    name: signupStudioTiers[0].name,
    price: signupStudioTiers[0].price,
    annualPrice: signupStudioTiers[0].annualPrice,
    description:
      "A professional profile page to showcase your studio on the marketplace.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: false },
      { text: "Customize colors, fonts & content", included: false },
      { text: "Rearrange layout sections", included: false },
      { text: "Exclusive premium templates", included: false },
      { text: "Priority placement in search", included: false },
    ],
  },
  {
    name: signupStudioTiers[1].name,
    price: signupStudioTiers[1].price,
    annualPrice: signupStudioTiers[1].annualPrice,
    description:
      "A fully customizable template website to represent your brand.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: true },
      { text: "Customize colors, fonts & content", included: true },
      { text: "Rearrange layout sections", included: false },
      { text: "Exclusive premium templates", included: false },
      { text: "Priority placement in search", included: false },
    ],
    recommended: true,
  },
  {
    name: signupStudioTiers[2].name,
    price: signupStudioTiers[2].price,
    annualPrice: signupStudioTiers[2].annualPrice,
    description:
      "Full creative control with exclusive templates and premium search placement.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: true },
      { text: "Customize colors, fonts & content", included: true },
      { text: "Rearrange layout sections", included: true },
      { text: "Exclusive premium templates", included: true },
      { text: "Priority placement in search", included: true },
    ],
  },
];

/* ─── Page ───────────────────────────────────────────────────── */

export function PricingPageContent() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const [audience, setAudience] = useState<Audience>("studios");
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = audience === "artists" ? artistTiers : studioTiers;
  const isArtists = audience === "artists";

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-ink-black"
          : "min-h-screen bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"
      }
    >
      <PageHero
        headline="PRICING"
        subtitle="simple · transparent · flexible"
        eyebrow="Plans"
        accentColor="rust"
        variant={mode}
        description="Choose the plan that fits your goals. Upgrade, downgrade, or cancel anytime."
      />

      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-32">
        {/* Toggles */}
        <PricingToggle
          audience={audience}
          onAudienceChange={setAudience}
          isAnnual={isAnnual}
          onBillingChange={setIsAnnual}
          variant={mode}
          className="mb-12"
        />

        {/* Tier cards */}
        <div
          className={
            isArtists
              ? "grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          }
          key={audience}
        >
          {tiers.map((tier) => (
            <PricingTierCard
              key={`${audience}-${tier.name}`}
              name={tier.name}
              price={tier.price}
              annualPrice={tier.annualPrice}
              isAnnual={isAnnual}
              description={tier.description}
              features={tier.features}
              recommended={tier.recommended}
              ctaLabel={tier.ctaLabel}
              variant={mode}
            />
          ))}
        </div>

        {/* Search Boost callout — artists only */}
        {isArtists && (
          <SearchBoostCallout variant={mode} className="mt-8" />
        )}

        <Divider variant={isDark ? "dark" : "light"} className="my-16" />

        {/* FAQ */}
        <PricingFaq variant={mode} className="mb-16" />

        {/* CTA */}
        <PricingCta audience={audience} variant={mode} />
      </div>

      <BackToTop variant={mode} />
    </div>
  );
}
