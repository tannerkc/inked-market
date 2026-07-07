"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { heroOptions } from "@/lib/data/builder-options";
import type { HeroLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { ThumbnailPicker } from "./thumbnail-picker";

function HeroThumbnail({ layout, selected }: { layout: HeroLayout; selected: boolean }) {
  const accent = selected ? "#FF3333" : "#444";

  switch (layout) {
    case "split":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-chrome-raised p-2">
          <div className="w-1/2 rounded bg-chrome-muted" />
          <div className="flex w-1/2 flex-col gap-1 py-1">
            <div className="h-2 w-full rounded-sm bg-chrome-text-faint" />
            <div className="h-1.5 w-3/4 rounded-sm bg-chrome-border-hover" />
            <div className="mt-auto h-2 w-1/2 rounded-sm" style={{ backgroundColor: accent }} />
          </div>
        </div>
      );
    case "fullbleed":
      return (
        <div className="flex h-full w-full flex-col rounded-md bg-chrome-muted p-2">
          <div className="mt-auto flex flex-col gap-1">
            <div className="h-2 w-3/4 rounded-sm bg-chrome-text-primary" />
            <div className="h-1.5 w-1/2 rounded-sm bg-chrome-text-secondary" />
          </div>
        </div>
      );
    case "centered":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-chrome-muted p-2">
          <div className="mb-1 h-2 w-3/4 rounded-sm bg-chrome-text-primary" />
          <div className="mb-1.5 h-1.5 w-1/2 rounded-sm bg-chrome-text-secondary" />
          <div className="h-2 w-2/5 rounded-sm" style={{ backgroundColor: accent }} />
        </div>
      );
    case "masthead":
      return (
        <div className="flex h-full w-full flex-col gap-1 rounded-md bg-chrome-raised p-2">
          <div className="h-0.5 w-full rounded-sm bg-chrome-text-primary" />
          <div className="mx-auto h-3 w-2/3 rounded-sm bg-chrome-text-primary" />
          <div className="h-px w-full bg-chrome-border-hover" />
          <div className="mt-auto h-1/2 w-full rounded bg-chrome-muted" />
        </div>
      );
    case "grid-overlay":
      return (
        <div className="relative grid h-full w-full grid-cols-3 gap-px rounded-md bg-chrome-raised p-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-sm bg-chrome-muted" />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-1/2 rounded-sm bg-chrome-text-primary" />
          </div>
        </div>
      );
    case "zine":
      return (
        <div className="relative flex h-full w-full items-center justify-center gap-1 overflow-hidden rounded-md bg-chrome-raised p-2">
          <div className="h-3/4 w-1/4 -rotate-6 rounded-sm bg-chrome-muted" />
          <div className="h-3/4 w-1/4 rotate-3 rounded-sm bg-chrome-muted" />
          <div className="h-3/4 w-1/4 -rotate-2 rounded-sm bg-chrome-muted" />
          <div className="absolute h-2.5 w-2/3 -rotate-2 rounded-sm" style={{ backgroundColor: accent }} />
        </div>
      );
  }
}

export function HeroStylePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <ThumbnailPicker<HeroLayout>
        title="Hero Layout"
        columns={3}
        options={heroOptions}
        selectedValue={config.heroLayout}
        onSelect={(value) => applyChange({ heroLayout: value })}
        renderThumbnail={(value, selected) => <HeroThumbnail layout={value} selected={selected} />}
      />

      {/* Hero Options */}
      <div className="mt-5 space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Hero Options
        </div>

        {/* Show Subtext toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5">
          <span className="text-xs font-medium text-chrome-text-secondary">Subtext</span>
          <button
            type="button"
            onClick={() => applyChange({ showHeroSubtext: !config.showHeroSubtext })}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              config.showHeroSubtext !== false ? "bg-ink-red" : "bg-chrome-border-hover",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                config.showHeroSubtext !== false && "translate-x-4",
              )}
            />
          </button>
        </label>

        {/* Subtext input (only when visible) */}
        {config.showHeroSubtext !== false && (
          <input
            type="text"
            value={config.heroSubtext || ""}
            onChange={(e) => applyChange({ heroSubtext: e.target.value })}
            placeholder="Tattoo crafted with intention."
            className="w-full rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
          />
        )}

        {/* Show CTA toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5">
          <span className="text-xs font-medium text-chrome-text-secondary">Call to Action</span>
          <button
            type="button"
            onClick={() => applyChange({ showHeroCta: !config.showHeroCta })}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              config.showHeroCta !== false ? "bg-ink-red" : "bg-chrome-border-hover",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                config.showHeroCta !== false && "translate-x-4",
              )}
            />
          </button>
        </label>

      </div>
    </div>
  );
}

HeroStylePicker.displayName = "HeroStylePicker";
