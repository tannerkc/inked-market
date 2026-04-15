"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { logoPlacementOptions } from "@/lib/data/builder-options";
import type { LogoPlacement } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

export function LogoPlacementPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Logo Placement
      </div>
      <div className="grid grid-cols-3 gap-2">
        {logoPlacementOptions.map((opt) => {
          const selected = config.logoPlacement === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ logoPlacement: opt.value as LogoPlacement })}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors",
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

LogoPlacementPicker.displayName = "LogoPlacementPicker";
