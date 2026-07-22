"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { aboutOptions } from "@/lib/data/builder-options";
import type { AboutLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { ThumbnailPicker } from "./thumbnail-picker";

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
      <ThumbnailPicker<AboutLayout>
        title="About Layout"
        options={aboutOptions}
        selectedValue={config.aboutLayout}
        onSelect={(value) => applyChange({ aboutLayout: value })}
        renderThumbnail={(value) => <AboutThumbnail layout={value} />}
      />

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
