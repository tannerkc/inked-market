"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProgressBar,
  StepEyebrow,
  MixedHeadline,
  BillingToggle,
  SignupTierCard,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { artistTiers } from "@/lib/data/signup-tiers";

export default function ArtistPlanPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Free");

  const handleActivate = () => {
    if (selectedTier === "Free") {
      window.location.href = "/";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={4} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Last Step" color="red" />
      </div>

      <MixedHeadline
        words={[
          { text: "Choose", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Plan", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-5">
        Start free or go Pro for independent visibility. Upgrade anytime.
      </p>

      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} className="mb-5" />

      <div className="flex flex-col gap-2.5 mb-5">
        {artistTiers.map((tier) => (
          <SignupTierCard
            key={tier.name}
            name={tier.name}
            price={tier.price}
            annualPrice={tier.annualPrice}
            isAnnual={isAnnual}
            description={tier.description}
            features={tier.features}
            selected={selectedTier === tier.name}
            onSelect={() => setSelectedTier(tier.name)}
            badge={tier.badge}
            badgeColor={tier.badgeColor}
            freeBadge={tier.freeBadge}
            accentColor="red"
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleActivate}
      >
        Activate Account
      </Button>

      <Link
        href="/signup/artist/profile"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
