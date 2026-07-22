"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { animationStyleOptions } from "@/lib/data/builder-options";
import type { AnimationStyle } from "@/lib/types/builder";
import { OptionGridPicker } from "./option-grid-picker";

export function AnimationStylePicker() {
  const { config, applyChange, triggerReplay } = useBuilder();
  const selected = config.animationStyle ?? "none";
  const hasAnimation = selected !== "none";

  const handleSelect = (value: AnimationStyle) => {
    applyChange({ animationStyle: value });
    if (value !== "none") {
      triggerReplay();
    }
  };

  return (
    <OptionGridPicker<AnimationStyle>
      title="Animation Style"
      options={animationStyleOptions}
      selectedValue={selected}
      onSelect={handleSelect}
      headerActions={
        hasAnimation && (
          <button
            type="button"
            title="Replay animations in preview"
            onClick={triggerReplay}
            className="flex items-center gap-1 rounded border border-chrome-border bg-chrome-surface px-2 py-1 text-[9px] font-semibold uppercase tracking-[1px] text-chrome-text-dim transition-colors hover:border-chrome-border-hover hover:text-chrome-text-secondary"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Replay
          </button>
        )
      }
    />
  );
}

AnimationStylePicker.displayName = "AnimationStylePicker";
