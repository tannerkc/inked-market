import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar } from "./progress-bar";
import type { HeadlineWord } from "@/components/ui/headline";

interface SignupPageLayoutProps {
  currentStep: number;
  totalSteps: number;
  eyebrow: string;
  eyebrowColor: "red" | "rust" | "sage";
  headlineWords: HeadlineWord[];
  subtitle: string;
  children: React.ReactNode;
}

export function SignupPageLayout({
  currentStep,
  totalSteps,
  eyebrow,
  eyebrowColor,
  headlineWords,
  subtitle,
  children,
}: SignupPageLayoutProps) {
  return (
    <div className="text-center">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <Eyebrow text={eyebrow} color={eyebrowColor} />
      <Headline variant="mixed" size="sm" words={headlineWords} />
      <Subtitle text={subtitle} className="mb-6" />
      {children}
    </div>
  );
}
