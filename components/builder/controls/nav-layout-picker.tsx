"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { navLayoutOptions } from "@/lib/data/builder-options";
import type { NavLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function NavLayoutThumbnail({ layout }: { layout: NavLayout }) {
  const bg = "bg-[#1a1a1a]";

  switch (layout) {
    case "standard":
      // [ logo ] · [─] [─] [─] · [CTA]
      return (
        <div className={cn("flex h-full w-full items-center justify-between rounded-md px-2 py-1.5", bg)}>
          <div className="h-1 w-3 shrink-0 rounded-sm bg-[#333]" />
          <div className="flex items-center gap-0.5">
            <div className="h-px w-2.5 rounded-full bg-[#444]" />
            <div className="h-px w-2 rounded-full bg-[#444]" />
            <div className="h-px w-2.5 rounded-full bg-[#444]" />
          </div>
          <div className="h-[5px] w-3.5 shrink-0 rounded bg-[#444]" />
        </div>
      );

    case "logo-center":
      // [─] [─] · [ logo ] · [CTA]
      return (
        <div
          className={cn("h-full w-full items-center rounded-md px-2 py-1.5", bg)}
          style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr" }}
        >
          <div className="flex items-center gap-0.5">
            <div className="h-px w-2.5 rounded-full bg-[#444]" />
            <div className="h-px w-2 rounded-full bg-[#444]" />
          </div>
          <div className="h-1 w-5 rounded-sm bg-[#333]" />
          <div className="flex items-center justify-end">
            <div className="h-[5px] w-3 rounded bg-[#444]" />
          </div>
        </div>
      );

    case "centered":
      // Two rows: logo centered on top, links + CTA centered below
      return (
        <div className={cn("flex h-full w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5", bg)}>
          <div className="h-1 w-8 rounded-sm bg-[#333]" />
          <div className="flex items-center gap-1">
            <div className="h-px w-2 rounded-full bg-[#444]" />
            <div className="h-px w-2 rounded-full bg-[#444]" />
            <div className="h-px w-2 rounded-full bg-[#444]" />
            <div className="h-[5px] w-3 rounded bg-[#444]" />
          </div>
        </div>
      );

    case "minimal":
      // [ logo ] ··············· [CTA]
      return (
        <div className={cn("flex h-full w-full items-center justify-between rounded-md px-2 py-1.5", bg)}>
          <div className="h-1 w-4 rounded-sm bg-[#333]" />
          <div className="h-[5px] w-4 rounded bg-[#444]" />
        </div>
      );
  }
}

export function NavLayoutPicker() {
  const { config, applyChange } = useBuilder();
  const current = config.navLayout ?? "standard";

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Nav Layout
      </div>
      <div className="grid grid-cols-2 gap-2">
        {navLayoutOptions.map((opt) => {
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ navLayout: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)]"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              <div className="flex items-center justify-center p-2">
                <div style={{ width: "76px", height: "40px", overflow: "hidden" }}>
                  <NavLayoutThumbnail layout={opt.value} />
                </div>
              </div>

              <div className="px-2 pb-2 pt-0.5">
                <span
                  className={cn(
                    "block text-[11px] font-medium transition-colors",
                    selected ? "text-[#FF3333]" : "text-[#888] group-hover:text-[#bbb]"
                  )}
                >
                  {opt.label}
                </span>
                <span className="block text-[9px] text-[#555]">
                  {opt.description}
                </span>
              </div>

              {selected ? (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3333]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

NavLayoutPicker.displayName = "NavLayoutPicker";
