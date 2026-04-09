"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import {
  headingLetterSpacingOptions,
  headingTextTransformOptions,
  headingFontWeightOptions,
} from "@/lib/data/builder-options";
import type {
  HeadingLetterSpacing,
  HeadingTextTransform,
  HeadingFontWeight,
} from "@/lib/types/builder";
import { SegmentedPicker } from "./segmented-picker";

export function TypographyTuner() {
  const { config, applyChange } = useBuilder();

  return (
    <div className="flex flex-col gap-4">
      <SegmentedPicker
        label="Letter Spacing"
        options={headingLetterSpacingOptions}
        value={config.headingLetterSpacing}
        onChange={(v) => applyChange({ headingLetterSpacing: v as HeadingLetterSpacing })}
      />
      <SegmentedPicker
        label="Text Transform"
        options={headingTextTransformOptions}
        value={config.headingTextTransform}
        onChange={(v) => applyChange({ headingTextTransform: v as HeadingTextTransform })}
      />
      <SegmentedPicker
        label="Heading Weight"
        options={headingFontWeightOptions}
        value={config.headingFontWeight}
        onChange={(v) => applyChange({ headingFontWeight: v as HeadingFontWeight })}
      />
    </div>
  );
}

TypographyTuner.displayName = "TypographyTuner";
