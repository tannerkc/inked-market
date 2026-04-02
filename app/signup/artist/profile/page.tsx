"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import {
  ProgressBar,
  StylePicker,
  IgImportCard,
  PhotoUploadGrid,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { tattooStyleOptions } from "@/lib/data/signup-styles";

export default function ArtistProfilePage() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const handleComplete = () => {
    window.location.href = "/signup/artist/plan";
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={3} totalSteps={4} />

      <Eyebrow text="Almost There" color="red" />
      <Headline
        variant="mixed"
        words={[
          { text: "Show", font: "limelight" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Work", font: "cook" },
        ]}
      />
      <Subtitle text="Pick your styles and add some portfolio work. You can always add more later from your dashboard." className="mb-6" />

      <div className="text-left mb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/25 mb-2 px-1">
          Your Styles
        </p>
        <StylePicker
          options={tattooStyleOptions}
          selected={selectedStyles}
          onChange={setSelectedStyles}
          accentColor="red"
        />
      </div>

      <IgImportCard
        onConnect={() => {}}
        onSkip={() => {}}
        className="mb-4"
      />

      <div className="text-left mb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/25 mb-2 px-1">
          Or Upload Photos
        </p>
        <PhotoUploadGrid />
      </div>

      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleComplete}
        disabled={selectedStyles.length === 0}
      >
        Complete Setup
      </Button>

      <Link
        href="/signup/artist"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
