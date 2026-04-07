"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, AuthForm } from "@/components/signup";
import { useAuth } from "@/components/providers/auth-provider";

export default function CustomerSignupPage() {
  const { updateSignupProgress, completeSignup, signupProgress } = useAuth();

  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={2} />
      <Eyebrow text="Almost There" color="sage" />
      <Headline
        variant="mixed"
        size="sm"
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Account", font: "cook", color: "text-ink-sage" },
        ]}
      />
      <Subtitle text="Sign up to save artists, get recommendations, and book sessions." className="mb-6" />
      <AuthForm
        emailPlaceholder="your@email.com"
        ctaLabel="Create Account"
        onBack="/signup"
        defaultEmail={signupProgress.email}
        defaultPassword={signupProgress.password}
        onSubmit={(data) => {
          updateSignupProgress({
            role: "customer",
            email: data.email,
            password: data.password,
            name: data.name || data.email.split("@")[0],
          });
          completeSignup();
          window.location.href = "/";
        }}
      />
      <p className="font-mono text-xs tracking-[0.15em] text-ink-black/25 pt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">Sign In</Link>
      </p>
    </div>
  );
}
