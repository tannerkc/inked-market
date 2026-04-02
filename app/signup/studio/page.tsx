import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, AuthForm } from "@/components/signup";

export default function StudioSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />
      <Eyebrow text="Studio Account" color="rust" />
      <Headline
        variant="mixed"
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-rust" },
          { text: "Account", font: "cook", color: "text-ink-black" },
        ]}
      />
      <Subtitle text="Set up your studio's presence on Inked Market." className="mb-6" />
      <AuthForm
        emailPlaceholder="owner@studio.com"
        nameField={{ label: "Your Name", placeholder: "Studio owner name" }}
        ctaLabel="Continue"
        onBack="/signup"
      />
    </div>
  );
}
