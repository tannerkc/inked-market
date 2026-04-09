"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { footerLayoutOptions } from "@/lib/data/builder-options";
import type { FooterLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function FooterLayoutThumbnail({ layout }: { layout: FooterLayout }) {
  switch (layout) {
    case "columns":
      return (
        <div className="flex h-full w-full flex-col justify-end overflow-hidden rounded-md bg-[#1a1a1a] p-1.5">
          <div className="mb-1.5 h-px w-full bg-[#333]" />
          <div className="flex w-full gap-1.5">
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-[#444]" />
              <div className="h-0.5 w-full max-w-[8px] rounded-full bg-[#333]" />
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-[#333]" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-[#444]" />
              <div className="h-0.5 w-full max-w-[7px] rounded-full bg-[#333]" />
              <div className="h-0.5 w-full max-w-[8px] rounded-full bg-[#333]" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <div className="h-0.5 w-full max-w-[10px] rounded-full bg-[#444]" />
              <div className="h-0.5 w-full max-w-[8px] rounded-full bg-[#333]" />
              <div className="h-0.5 w-full max-w-[7px] rounded-full bg-[#333]" />
            </div>
          </div>
        </div>
      );
    case "minimal-bar":
      return (
        <div className="flex h-full w-full flex-col justify-end rounded-md bg-[#1a1a1a] p-1.5">
          <div className="mb-1 h-px w-full bg-[#333]" />
          <div className="flex items-center justify-between">
            <div className="h-0.5 w-3 rounded-full bg-[#333]" />
            <div className="flex gap-1">
              <div className="h-0.5 w-0.5 rounded-full bg-[#444]" />
              <div className="h-0.5 w-0.5 rounded-full bg-[#444]" />
              <div className="h-0.5 w-0.5 rounded-full bg-[#444]" />
            </div>
          </div>
        </div>
      );
    case "centered":
      return (
        <div className="flex h-full w-full flex-col items-center justify-end rounded-md bg-[#1a1a1a] p-1.5">
          <div className="mb-1 h-px w-full bg-[#333]" />
          <div className="mb-1 h-0.5 w-4 rounded-full bg-[#444]" />
          <div className="mb-0.5 h-0.5 w-6 rounded-full bg-[#333]" />
          <div className="h-0.5 w-3 rounded-full bg-[#333]" />
        </div>
      );
    case "none":
      return (
        <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-[#333] bg-[#1a1a1a]">
          <div className="text-[8px] text-[#444]">—</div>
        </div>
      );
  }
}

export function FooterLayoutPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
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
                  ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)]"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
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
                      ? "text-[#FF3333]"
                      : "text-[#888] group-hover:text-[#bbb]"
                  )}
                >
                  {opt.label}
                </span>
                <span className="block text-[9px] text-[#555]">
                  {opt.description}
                </span>
              </div>

              {/* Radio check circle */}
              {selected ? (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3333]">
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
                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full border border-[#333]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

FooterLayoutPicker.displayName = "FooterLayoutPicker";
