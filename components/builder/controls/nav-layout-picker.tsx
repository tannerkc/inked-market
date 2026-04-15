"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { navLayoutOptions } from "@/lib/data/builder-options";
import type { NavLayout } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { PickerCheckmark } from "./picker-checkmark";

function NavLayoutThumbnail({ layout }: { layout: NavLayout }) {
  const bg = "bg-chrome-raised";

  switch (layout) {
    case "standard":
      // [ logo ] · [─] [─] [─] · [CTA]
      return (
        <div className={cn("flex h-full w-full items-center justify-between rounded-md px-2 py-1.5", bg)}>
          <div className="h-1 w-3 shrink-0 rounded-sm bg-chrome-border-hover" />
          <div className="flex items-center gap-0.5">
            <div className="h-px w-2.5 rounded-full bg-chrome-text-faint" />
            <div className="h-px w-2 rounded-full bg-chrome-text-faint" />
            <div className="h-px w-2.5 rounded-full bg-chrome-text-faint" />
          </div>
          <div className="h-[5px] w-3.5 shrink-0 rounded bg-chrome-text-faint" />
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
            <div className="h-px w-2.5 rounded-full bg-chrome-text-faint" />
            <div className="h-px w-2 rounded-full bg-chrome-text-faint" />
          </div>
          <div className="h-1 w-5 rounded-sm bg-chrome-border-hover" />
          <div className="flex items-center justify-end">
            <div className="h-[5px] w-3 rounded bg-chrome-text-faint" />
          </div>
        </div>
      );

    case "centered":
      // Two rows: logo centered on top, links + CTA centered below
      return (
        <div className={cn("flex h-full w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5", bg)}>
          <div className="h-1 w-8 rounded-sm bg-chrome-border-hover" />
          <div className="flex items-center gap-1">
            <div className="h-px w-2 rounded-full bg-chrome-text-faint" />
            <div className="h-px w-2 rounded-full bg-chrome-text-faint" />
            <div className="h-px w-2 rounded-full bg-chrome-text-faint" />
            <div className="h-[5px] w-3 rounded bg-chrome-text-faint" />
          </div>
        </div>
      );

    case "minimal":
      // [ logo ] ··············· [CTA]
      return (
        <div className={cn("flex h-full w-full items-center justify-between rounded-md px-2 py-1.5", bg)}>
          <div className="h-1 w-4 rounded-sm bg-chrome-border-hover" />
          <div className="h-[5px] w-4 rounded bg-chrome-text-faint" />
        </div>
      );
  }
}

export function NavLayoutPicker() {
  const { config, applyChange } = useBuilder();
  const current = config.navLayout ?? "standard";

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
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
                  ? "border-ink-red bg-ink-red/10"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
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
                    selected ? "text-ink-red" : "text-chrome-text-secondary group-hover:text-chrome-text-light"
                  )}
                >
                  {opt.label}
                </span>
                <span className="block text-[9px] text-chrome-text-dim">
                  {opt.description}
                </span>
              </div>

              {selected ? (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-red text-white">
                  <PickerCheckmark />
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

NavLayoutPicker.displayName = "NavLayoutPicker";
