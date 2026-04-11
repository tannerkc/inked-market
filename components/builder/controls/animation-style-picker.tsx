"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { animationStyleOptions } from "@/lib/data/builder-options";
import type { AnimationStyle } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

export function AnimationStylePicker() {
  const { config, applyChange, triggerReplay } = useBuilder();
  const hasAnimation = (config.animationStyle ?? "none") !== "none";

  const handleSelect = (value: AnimationStyle) => {
    applyChange({ animationStyle: value });
    if (value !== "none") {
      triggerReplay();
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Animation Style
        </span>
        {hasAnimation && (
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
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {animationStyleOptions.map((opt) => {
          const selected = (config.animationStyle ?? "none") === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value as AnimationStyle)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors",
                selected
                  ? "border-ink-red bg-[rgba(255,51,51,0.1)] ring-1 ring-ink-red/30"
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
              {opt.description && (
                <span className="text-[10px] leading-tight text-chrome-text-dim">{opt.description}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

AnimationStylePicker.displayName = "AnimationStylePicker";
