"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { heroOptions } from "@/lib/data/builder-options";
import type { HeroLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function HeroThumbnail({ layout, selected }: { layout: HeroLayout; selected: boolean }) {
  const accent = selected ? "#FF3333" : "#444";

  switch (layout) {
    case "split":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="w-1/2 rounded bg-[#2a2a2a]" />
          <div className="flex w-1/2 flex-col gap-1 py-1">
            <div className="h-2 w-full rounded-sm bg-[#444]" />
            <div className="h-1.5 w-3/4 rounded-sm bg-[#333]" />
            <div className="mt-auto h-2 w-1/2 rounded-sm" style={{ backgroundColor: accent }} />
          </div>
        </div>
      );
    case "fullbleed":
      return (
        <div className="flex h-full w-full flex-col rounded-md bg-[#2a2a2a] p-2">
          <div className="mt-auto flex flex-col gap-1">
            <div className="h-2 w-3/4 rounded-sm bg-[#ededed]" />
            <div className="h-1.5 w-1/2 rounded-sm bg-[#888]" />
          </div>
        </div>
      );
    case "centered":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-[#2a2a2a] p-2">
          <div className="mb-1 h-2 w-3/4 rounded-sm bg-[#ededed]" />
          <div className="mb-1.5 h-1.5 w-1/2 rounded-sm bg-[#888]" />
          <div className="h-2 w-2/5 rounded-sm" style={{ backgroundColor: accent }} />
        </div>
      );
  }
}

export function HeroStylePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Hero Layout
      </div>
      <div className="grid grid-cols-3 gap-2">
        {heroOptions.map((opt) => {
          const selected = config.heroLayout === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ heroLayout: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-[#FF3333] bg-[#111] ring-1 ring-[#FF3333]/30"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              {/* Thumbnail area */}
              <div className="aspect-[4/3] w-full p-1.5">
                <HeroThumbnail layout={opt.value} selected={selected} />
              </div>

              {/* Label */}
              <div className="px-2 pb-2.5 pt-0.5">
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    selected ? "text-[#FF3333]" : "text-[#888] group-hover:text-[#bbb]"
                  )}
                >
                  {opt.label}
                </span>
              </div>

              {/* Selected check */}
              {selected && (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3333]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hero Options */}
      <div className="mt-5 space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
          Hero Options
        </div>

        {/* Show Subtext toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#222] bg-[#111] px-3 py-2.5">
          <span className="text-xs font-medium text-[#888]">Subtext</span>
          <button
            type="button"
            onClick={() => applyChange({ showHeroSubtext: !config.showHeroSubtext })}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              config.showHeroSubtext !== false ? "bg-[#FF3333]" : "bg-[#333]",
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
            className="w-full rounded-lg border border-[#222] bg-[#111] px-3 py-2.5 text-xs text-[#ededed] placeholder-[#444] outline-none transition-colors focus:border-[#FF3333]"
          />
        )}

        {/* Show CTA toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#222] bg-[#111] px-3 py-2.5">
          <span className="text-xs font-medium text-[#888]">Call to Action</span>
          <button
            type="button"
            onClick={() => applyChange({ showHeroCta: !config.showHeroCta })}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              config.showHeroCta !== false ? "bg-[#FF3333]" : "bg-[#333]",
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
