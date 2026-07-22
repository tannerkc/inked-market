"use client";

import { SignupPageLayout, AuthForm, useAccountStep } from "@/components/signup";

export default function StudioSignupPage() {
  const { onSubmit, error, signupProgress } = useAccountStep("studio", "/signup/studio/setup");

  return (
    <SignupPageLayout
      currentStep={2}
      totalSteps={4}
      eyebrow="Studio Account"
      eyebrowColor="rust"
      headlineWords={[
        { text: "Create", font: "pirata" },
        { text: "Your", font: "rye" },
        { text: "Account", font: "cook", color: "text-ink-rust" },
      ]}
      subtitle="Set up your studio's presence on Inked Market."
    >
      <AuthForm
        emailPlaceholder="owner@studio.com"
        nameField={{ label: "Your Name", placeholder: "Studio owner name" }}
        ctaLabel="Continue"
        onBack="/signup"
        defaultEmail={signupProgress.email}
        defaultPassword={signupProgress.password}
        defaultName={signupProgress.name}
        requireStrongPassword
        error={error}
        onSubmit={onSubmit}
      />
    </SignupPageLayout>
  );
}
