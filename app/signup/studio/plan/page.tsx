"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import {
  ProgressBar,
  BillingToggle,
  SignupTierCard,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { studioTiers } from "@/lib/data/signup-tiers";

export default function StudioPlanPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Basic");

  const handleActivate = () => {
    window.location.href = "/";
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={4} totalSteps={4} />

      <Eyebrow text="Last Step" color="rust" />
      <Headline
        variant="mixed"
        size="sm"
        words={[
          { text: "Choose", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Plan", font: "cook", color: "text-ink-rust" },
        ]}
      />
      <Subtitle text="All plans include a marketplace presence. Upgrade for full customization." className="mb-5" />

      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} className="mb-5" />

      <div className="flex flex-col gap-2.5 mb-5">
        {studioTiers.map((tier) => (
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
            accentColor="rust"
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
        Activate Studio
      </Button>

      <Link
        href="/signup/studio/setup"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
