"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, AuthForm } from "@/components/signup";
import { useAuth } from "@/components/providers/auth-provider";

export default function StudioSignupPage() {
  const { updateSignupProgress, signupProgress } = useAuth();

  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />
      <Eyebrow text="Studio Account" color="rust" />
      <Headline
        variant="mixed"
        size="sm"
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Account", font: "cook", color: "text-ink-rust" },
        ]}
      />
      <Subtitle text="Set up your studio's presence on Inked Market." className="mb-6" />
      <AuthForm
        emailPlaceholder="owner@studio.com"
        nameField={{ label: "Your Name", placeholder: "Studio owner name" }}
        ctaLabel="Continue"
        onBack="/signup"
        defaultEmail={signupProgress.email}
        defaultPassword={signupProgress.password}
        defaultName={signupProgress.name}
        onSubmit={(data) => {
          updateSignupProgress({
            role: "studio",
            email: data.email,
            password: data.password,
            name: data.name,
          });
          window.location.href = "/signup/studio/setup";
        }}
      />
    </div>
  );
}
