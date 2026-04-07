"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { detailsOptions } from "@/lib/data/builder-options";
import type { DetailsLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function DetailsThumbnail({ layout }: { layout: DetailsLayout }) {
  switch (layout) {
    case "three-col":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="w-1/3 rounded bg-[#2a2a2a]" />
          <div className="w-1/3 rounded bg-[#333]" />
          <div className="w-1/3 rounded bg-[#2a2a2a]" />
        </div>
      );
    case "two-one":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="w-2/3 rounded bg-[#2a2a2a]" />
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-1/2 rounded bg-[#333]" />
            <div className="h-1/2 rounded bg-[#333]" />
          </div>
        </div>
      );
    case "stacked":
      return (
        <div className="flex h-full w-full flex-col gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="h-1/3 w-full rounded bg-[#2a2a2a]" />
          <div className="h-1/3 w-full rounded bg-[#333]" />
          <div className="h-1/3 w-full rounded bg-[#2a2a2a]" />
        </div>
      );
  }
}

export function DetailsLayoutPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Details Layout
      </div>
      <div className="grid grid-cols-3 gap-2">
        {detailsOptions.map((opt) => {
          const selected = config.detailsLayout === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ detailsLayout: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-[#FF3333] bg-[#111] ring-1 ring-[#FF3333]/30"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                <DetailsThumbnail layout={opt.value} />
              </div>

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
    </div>
  );
}

DetailsLayoutPicker.displayName = "DetailsLayoutPicker";
