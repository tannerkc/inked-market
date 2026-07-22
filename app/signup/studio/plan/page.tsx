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
  ConfirmEmailNotice,
  useSignupCompletion,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { studioTiers } from "@/lib/data/signup-tiers";
import { useAuth } from "@/components/providers/auth-provider";

export default function StudioPlanPage() {
  const { signupProgress } = useAuth();
  const { complete, error, confirmEmail, pending } = useSignupCompletion("/dashboard");
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState(signupProgress.plan || "Liner");

  const handleActivate = () => {
    void complete({ plan: selectedTier });
  };

  if (confirmEmail) {
    return (
      <div className="text-center">
        <ProgressBar currentStep={4} totalSteps={4} />
        <Eyebrow text="One Last Thing" color="rust" />
        <Headline
          variant="mixed"
          size="sm"
          words={[
            { text: "Confirm", font: "pirata" },
            { text: "Your", font: "rye" },
            { text: "Email", font: "cook", color: "text-ink-rust" },
          ]}
        />
        <Subtitle text="Your studio account is created — verify your email to unlock the dashboard." className="mb-6" />
        <ConfirmEmailNotice email={confirmEmail} />
      </div>
    );
  }

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

      {error ? (
        <p className="text-ink-red text-[11px] font-mono tracking-[0.1em] text-left mb-3">{error}</p>
      ) : null}

      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleActivate}
        disabled={pending}
      >
        {pending ? "Creating Account…" : "Activate Studio"}
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
