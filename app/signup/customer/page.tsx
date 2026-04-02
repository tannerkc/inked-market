import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, AuthForm } from "@/components/signup";

export default function CustomerSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={2} />
      <Eyebrow text="Almost There" color="sage" />
      <Headline
        variant="mixed"
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Account", font: "cook", color: "text-ink-sage" },
        ]}
      />
      <Subtitle text="Sign up to save artists, get recommendations, and book sessions." className="mb-6" />
      <AuthForm emailPlaceholder="your@email.com" ctaLabel="Create Account" onBack="/signup" />
      <p className="font-mono text-xs tracking-[0.15em] text-ink-black/25 pt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">Sign In</Link>
      </p>
    </div>
  );
}
