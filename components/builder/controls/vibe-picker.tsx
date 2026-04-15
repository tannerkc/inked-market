"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { vibeOptions } from "@/lib/data/builder-options";
import type { Vibe } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function detectVibe(config: {
  density?: string;
  borderShape?: string;
  dividerStyle?: string;
  animationStyle?: string;
  imageTreatment?: string;
  surfaceTexture?: string;
  headingTextTransform?: string;
  headingLetterSpacing?: string;
  headingFontWeight?: string;
  tagStyle?: string;
  ctaStyle?: string;
  vibe?: string;
}): Vibe | null {
  const match = vibeOptions.find(
    (v) =>
      v.defaults.density === config.density &&
      v.defaults.borderShape === config.borderShape &&
      v.defaults.dividerStyle === config.dividerStyle &&
      v.defaults.animationStyle === config.animationStyle &&
      v.defaults.imageTreatment === config.imageTreatment &&
      v.defaults.surfaceTexture === config.surfaceTexture &&
      v.defaults.headingTextTransform === config.headingTextTransform &&
      v.defaults.headingLetterSpacing === config.headingLetterSpacing &&
      v.defaults.headingFontWeight === config.headingFontWeight &&
      v.defaults.tagStyle === config.tagStyle &&
      v.defaults.ctaStyle === config.ctaStyle,
  );
  return match?.value ?? (config.vibe as Vibe) ?? null;
}

export function VibePicker() {
  const { config, applyVibe } = useBuilder();
  const activeVibe = detectVibe(config);

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Vibe
      </div>
      <div className="grid grid-cols-2 gap-2">
        {vibeOptions.map((opt) => {
          const selected = activeVibe === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyVibe(opt.value as Vibe)}
              className={cn(
                "relative flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-ink-red bg-ink-red/10 ring-1 ring-ink-red/30"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              {selected && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-red">
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth={2}>
                    <path d="M2 5.5 4.5 8 8.5 3" />
                  </svg>
                </span>
              )}
              <span className="text-[11px] font-semibold text-chrome-text-light">{opt.label}</span>
              <span className="text-[10px] leading-tight text-chrome-text-dim">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

VibePicker.displayName = "VibePicker";
