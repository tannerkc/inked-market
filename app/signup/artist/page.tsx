"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, AuthForm } from "@/components/signup";
import { useAuth } from "@/components/providers/auth-provider";

export default function ArtistSignupPage() {
  const { updateSignupProgress, signupProgress } = useAuth();

  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />
      <Eyebrow text="Artist Account" color="red" />
      <Headline
        variant="mixed"
        size="sm"
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Account", font: "cook", color: "text-ink-red" },
        ]}
      />
      <Subtitle text="Set up your artist profile and start getting discovered." className="mb-6" />
      <AuthForm
        emailPlaceholder="artist@studio.com"
        nameField={{ label: "Artist Name", placeholder: "Your display name" }}
        ctaLabel="Continue"
        onBack="/signup"
        defaultEmail={signupProgress.email}
        defaultPassword={signupProgress.password}
        defaultName={signupProgress.name}
        onSubmit={(data) => {
          updateSignupProgress({
            role: "artist",
            email: data.email,
            password: data.password,
            name: data.name,
          });
          window.location.href = "/signup/artist/profile";
        }}
      />
    </div>
  );
}
