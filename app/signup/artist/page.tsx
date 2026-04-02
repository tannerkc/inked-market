import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, AuthForm } from "@/components/signup";

export default function ArtistSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />
      <Eyebrow text="Artist Account" color="red" />
      <Headline
        variant="mixed"
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Account", font: "cook" },
        ]}
      />
      <Subtitle text="Set up your artist profile and start getting discovered." className="mb-6" />
      <AuthForm
        emailPlaceholder="artist@studio.com"
        nameField={{ label: "Artist Name", placeholder: "Your display name" }}
        ctaLabel="Continue"
        onBack="/signup"
      />
    </div>
  );
}
