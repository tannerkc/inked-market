import Link from "next/link";
import { ProgressBar, StepEyebrow, MixedHeadline, AuthForm } from "@/components/signup";

export default function CustomerSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={2} />
      <div className="mb-5">
        <StepEyebrow text="Almost There" color="sage" />
      </div>
      <MixedHeadline
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Account", font: "cook", color: "text-ink-sage" },
        ]}
      />
      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Sign up to save artists, get recommendations, and book sessions.
      </p>
      <AuthForm emailPlaceholder="your@email.com" ctaLabel="Create Account" onBack="/signup" />
      <p className="font-mono text-xs tracking-[0.15em] text-ink-black/25 pt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">Sign In</Link>
      </p>
    </div>
  );
}
