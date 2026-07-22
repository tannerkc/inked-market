"use client";

import { SignupPageLayout, AuthForm, useAccountStep } from "@/components/signup";

export default function ArtistSignupPage() {
  const { onSubmit, error, signupProgress } = useAccountStep("artist", "/signup/artist/profile");

  return (
    <SignupPageLayout
      currentStep={2}
      totalSteps={4}
      eyebrow="Artist Account"
      eyebrowColor="red"
      headlineWords={[
        { text: "Create", font: "pirata" },
        { text: "Your", font: "rye" },
        { text: "Account", font: "cook", color: "text-ink-red" },
      ]}
      subtitle="Set up your artist profile and start getting discovered."
    >
      <AuthForm
        emailPlaceholder="artist@studio.com"
        nameField={{ label: "Artist Name", placeholder: "Your display name" }}
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
