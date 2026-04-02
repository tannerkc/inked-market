import { ProgressBar, StepEyebrow, MixedHeadline, AuthForm } from "@/components/signup";

export default function ArtistSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />
      <StepEyebrow text="Artist Account" color="red" />
      <MixedHeadline
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Account", font: "cook" },
        ]}
      />
      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Set up your artist profile and start getting discovered.
      </p>
      <AuthForm
        emailPlaceholder="artist@studio.com"
        nameField={{ label: "Artist Name", placeholder: "Your display name" }}
        ctaLabel="Continue"
        onBack="/signup"
      />
    </div>
  );
}
