"use client";

import Link from "next/link";
import { SignupPageLayout, AuthForm, ConfirmEmailNotice, useSignupCompletion } from "@/components/signup";
import { sanitizeText } from "@/lib/utils/validation";

export default function CustomerSignupPage() {
  const { complete, error, confirmEmail } = useSignupCompletion("/");

  if (confirmEmail) {
    return (
      <SignupPageLayout
        currentStep={2}
        totalSteps={2}
        eyebrow="One Last Thing"
        eyebrowColor="sage"
        headlineWords={[
          { text: "Confirm", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Email", font: "cook", color: "text-ink-sage" },
        ]}
        subtitle="Your account is created — verify your email to start exploring."
      >
        <ConfirmEmailNotice email={confirmEmail} />
      </SignupPageLayout>
    );
  }

  return (
    <SignupPageLayout
      currentStep={2}
      totalSteps={2}
      eyebrow="Almost There"
      eyebrowColor="sage"
      headlineWords={[
        { text: "Create", font: "pirata" },
        { text: "Your", font: "rye" },
        { text: "Account", font: "cook", color: "text-ink-sage" },
      ]}
      subtitle="Sign up to save artists, get recommendations, and book sessions."
    >
      <AuthForm
        emailPlaceholder="your@email.com"
        ctaLabel="Create Account"
        onBack="/signup"
        requireStrongPassword
        error={error}
        onSubmit={async (data) => {
          await complete({
            role: "customer",
            email: data.email,
            password: data.password,
            name: data.name || sanitizeText(data.email.split("@")[0] ?? data.email),
          });
        }}
        footer={
          <p className="font-mono text-xs tracking-[0.15em] text-ink-black/25 pt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">Sign In</Link>
          </p>
        }
      />
    </SignupPageLayout>
  );
}
