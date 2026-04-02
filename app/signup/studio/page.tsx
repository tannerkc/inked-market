import { ProgressBar, StepEyebrow, MixedHeadline, AuthForm } from "@/components/signup";

export default function StudioSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />
      <StepEyebrow text="Studio Account" color="rust" />
      <MixedHeadline
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-rust" },
          { text: "Account", font: "cook" },
        ]}
      />
      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Set up your studio&apos;s presence on Inked Market.
      </p>
      <AuthForm
        emailPlaceholder="owner@studio.com"
        nameField={{ label: "Your Name", placeholder: "Studio owner name" }}
        ctaLabel="Continue"
        onBack="/signup"
      />
    </div>
  );
}
