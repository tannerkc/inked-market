"use client";

import { DensityPicker } from "./density-picker";
import { BorderShapePicker } from "./border-shape-picker";
import { DividerStylePicker } from "./divider-style-picker";
import { AnimationStylePicker } from "./animation-style-picker";
import { CtaStylePicker } from "./cta-style-picker";

export function PageStyleGroup() {
  return (
    <div className="rounded-lg border border-[#FF3333]/20 bg-[#0d0d0d] p-4">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#FF3333]/70">
        Page Style
      </div>
      <div className="flex flex-col gap-5">
        <CtaStylePicker />
        <DensityPicker />
        <BorderShapePicker />
        <DividerStylePicker />
        <AnimationStylePicker />
      </div>
    </div>
  );
}

PageStyleGroup.displayName = "PageStyleGroup";
