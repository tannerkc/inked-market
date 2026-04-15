"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { footerLayoutOptions } from "@/lib/data/builder-options";
import type { FooterLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function FooterLayoutThumbnail({ layout }: { layout: FooterLayout }) {
  switch (layout) {
    case "columns":
      return (
        <div className="flex h-full w-full flex-col justify-end overflow-hidden rounded-md bg-chrome-raised p-1.5">
          <div className="mb-1.5 h-px w-full bg-chrome-border-hover" />
          <div className="flex w-full gap-1.5">
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-chrome-text-faint" />
              <div className="h-0.5 w-full max-w-[8px] rounded-full bg-chrome-border-hover" />
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-chrome-border-hover" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-chrome-text-faint" />
              <div className="h-0.5 w-full max-w-[7px] rounded-full bg-chrome-border-hover" />
              <div className="h-0.5 w-full max-w-[8px] rounded-full bg-chrome-border-hover" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-chrome-text-faint" />
              <div className="h-0.5 w-full max-w-[8px] rounded-full bg-chrome-border-hover" />
              <div className="h-0.5 w-full max-w-[7px] rounded-full bg-chrome-border-hover" />
            </div>
          </div>
        </div>
      );
    case "minimal-bar":
      return (
        <div className="flex h-full w-full flex-col justify-end rounded-md bg-chrome-raised p-1.5">
          <div className="mb-1 h-px w-full bg-chrome-border-hover" />
          <div className="flex items-center justify-between">
            <div className="h-0.5 w-3 rounded-full bg-chrome-border-hover" />
            <div className="flex gap-1">
              <div className="h-0.5 w-0.5 rounded-full bg-chrome-text-faint" />
              <div className="h-0.5 w-0.5 rounded-full bg-chrome-text-faint" />
              <div className="h-0.5 w-0.5 rounded-full bg-chrome-text-faint" />
            </div>
          </div>
        </div>
      );
    case "centered":
      return (
        <div className="flex h-full w-full flex-col items-center justify-end rounded-md bg-chrome-raised p-1.5">
          <div className="mb-1 h-px w-full bg-chrome-border-hover" />
          <div className="mb-1 h-0.5 w-4 rounded-full bg-chrome-text-faint" />
          <div className="mb-0.5 h-0.5 w-6 rounded-full bg-chrome-border-hover" />
          <div className="h-0.5 w-3 rounded-full bg-chrome-border-hover" />
        </div>
      );
    case "none":
      return (
        <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-chrome-border-hover bg-chrome-raised">
          <div className="text-[8px] text-chrome-text-faint">—</div>
        </div>
      );
  }
}

export function FooterLayoutPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Footer Layout
      </div>
      <div className="grid grid-cols-2 gap-2">
        {footerLayoutOptions.map((opt) => {
          const selected = config.footerLayout === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ footerLayout: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-ink-red bg-ink-red/10"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              <div className="flex items-center justify-center p-2">
                <div style={{ width: "52px", height: "36px" }}>
                  <FooterLayoutThumbnail layout={opt.value} />
                </div>
              </div>

              <div className="px-2 pb-2 pt-0.5">
                <span
                  className={cn(
                    "block text-[11px] font-medium transition-colors",
                    selected
                      ? "text-ink-red"
                      : "text-chrome-text-secondary group-hover:text-chrome-text-light"
                  )}
                >
                  {opt.label}
                </span>
                <span className="block text-[9px] text-chrome-text-dim">
                  {opt.description}
                </span>
              </div>

              {/* Radio check circle */}
              {selected ? (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-red">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full border border-chrome-border-hover" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

FooterLayoutPicker.displayName = "FooterLayoutPicker";
