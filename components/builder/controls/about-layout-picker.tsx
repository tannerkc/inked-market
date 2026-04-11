"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { aboutOptions } from "@/lib/data/builder-options";
import type { AboutLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function AboutThumbnail({ layout }: { layout: AboutLayout }) {
  switch (layout) {
    case "split":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-chrome-raised p-2">
          <div className="flex w-1/2 flex-col gap-1">
            <div className="h-2 w-3/4 rounded bg-chrome-border-hover" />
            <div className="h-1 w-full rounded bg-chrome-muted" />
            <div className="h-1 w-full rounded bg-chrome-muted" />
            <div className="h-1 w-2/3 rounded bg-chrome-muted" />
          </div>
          <div className="flex w-1/2 flex-col gap-1">
            <div className="h-[45%] rounded bg-chrome-muted" />
            <div className="h-[45%] rounded bg-chrome-muted" />
          </div>
        </div>
      );
    case "full-width":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md bg-chrome-raised p-2">
          <div className="h-2 w-1/2 rounded bg-chrome-border-hover" />
          <div className="h-1 w-3/4 rounded bg-chrome-muted" />
          <div className="h-1 w-3/4 rounded bg-chrome-muted" />
          <div className="h-1 w-1/2 rounded bg-chrome-muted" />
          <div className="mt-1 flex gap-1">
            <div className="h-2 w-6 rounded-full bg-chrome-border-hover" />
            <div className="h-2 w-6 rounded-full bg-chrome-border-hover" />
            <div className="h-2 w-6 rounded-full bg-chrome-border-hover" />
          </div>
        </div>
      );
    case "none":
      return (
        <div className="flex h-full w-full items-center justify-center rounded-md bg-chrome-raised p-2">
          <div className="text-[10px] text-chrome-text-faint">Hidden</div>
        </div>
      );
  }
}

export function AboutLayoutPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        About Layout
      </div>
      <div className="grid grid-cols-2 gap-2">
        {aboutOptions.map((opt) => {
          const selected = config.aboutLayout === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ aboutLayout: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-ink-red bg-chrome-surface ring-1 ring-ink-red/30"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                <AboutThumbnail layout={opt.value} />
              </div>

              <div className="px-2 pb-2.5 pt-0.5">
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    selected ? "text-ink-red" : "text-chrome-text-secondary group-hover:text-chrome-text-light"
                  )}
                >
                  {opt.label}
                </span>
              </div>

              {selected && (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-red">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Block Toggles */}
      <div className="mt-5 space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Content Blocks
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5">
          <span className="text-xs font-medium text-chrome-text-secondary">Specialties</span>
          <button
            type="button"
            onClick={() =>
              applyChange({ showSpecialties: !config.showSpecialties })
            }
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              config.showSpecialties !== false ? "bg-ink-red" : "bg-chrome-border-hover",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                config.showSpecialties !== false && "translate-x-4",
              )}
            />
          </button>
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5">
          <span className="text-xs font-medium text-chrome-text-secondary">
            Studio Details
          </span>
          <button
            type="button"
            onClick={() =>
              applyChange({ showStudioDetails: !config.showStudioDetails })
            }
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              config.showStudioDetails !== false
                ? "bg-ink-red"
                : "bg-chrome-border-hover",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                config.showStudioDetails !== false && "translate-x-4",
              )}
            />
          </button>
        </label>
      </div>
    </div>
  );
}

AboutLayoutPicker.displayName = "AboutLayoutPicker";
