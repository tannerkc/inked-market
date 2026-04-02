import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { DrawingCanvas } from "@/components/hero/drawing-canvas";
import { SignupDecorations } from "@/components/signup";

export const metadata = {
  title: "Sign Up | Inked Market",
  description:
    "Join the tattoo community. Create your account as a collector, artist, or studio owner.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark min-h-screen flex items-center justify-center overflow-hidden">
      <SignupDecorations />
      <FilmGrainOverlay className="opacity-[0.025]" />
      <DrawingCanvas />
      <div className="relative z-30 w-full max-w-[420px] mx-auto px-4 py-12">
        {children}
      </div>
    </section>
  );
}
