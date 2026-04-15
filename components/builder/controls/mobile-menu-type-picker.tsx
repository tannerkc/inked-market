"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { mobileMenuTypeOptions } from "@/lib/data/builder-options";
import type { MobileMenuType } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { PickerCheckmark } from "./picker-checkmark";

function MobileMenuTypeThumbnail({ type }: { type: MobileMenuType }) {
  const bg = "bg-chrome-raised";

  switch (type) {
    case "dropdown":
      // Nav bar + stacked list below
      return (
        <div className={cn("flex h-full w-full flex-col overflow-hidden rounded-md", bg)}>
          {/* Nav bar */}
          <div className="flex items-center justify-between border-b border-chrome-border-hover px-2 py-1">
            <div className="h-1 w-3 rounded-sm bg-chrome-text-faint" />
            <div className="flex flex-col gap-0.5">
              <div className="h-px w-2.5 rounded-full bg-chrome-text-dim" />
              <div className="h-px w-2.5 rounded-full bg-chrome-text-dim" />
              <div className="h-px w-2.5 rounded-full bg-chrome-text-dim" />
            </div>
          </div>
          {/* Dropdown links */}
          <div className="flex flex-col gap-0.5 px-2 py-1">
            <div className="h-px w-full rounded-full bg-chrome-border-hover" />
            <div className="h-px w-3/4 rounded-full bg-chrome-border-hover" />
            <div className="h-px w-full rounded-full bg-chrome-border-hover" />
            <div className="mt-0.5 h-[5px] w-full rounded bg-chrome-text-faint" />
          </div>
        </div>
      );

    case "fullscreen":
      // Full dark area with centered large lines
      return (
        <div className={cn("flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-md", bg)}>
          <div className="h-1 w-8 rounded-full bg-chrome-text-dim" />
          <div className="h-1 w-10 rounded-full bg-chrome-text-faint" />
          <div className="h-1 w-8 rounded-full bg-chrome-text-faint" />
          <div className="h-1 w-6 rounded-full bg-chrome-text-faint" />
          <div className="mt-1 h-[5px] w-8 rounded bg-chrome-text-faint" />
        </div>
      );

    case "drawer":
      // Left dim area + right panel
      return (
        <div className={cn("flex h-full w-full overflow-hidden rounded-md", bg)}>
          {/* Dimmed backdrop */}
          <div className="flex-1 bg-chrome-surface" style={{ opacity: 0.4 }} />
          {/* Drawer panel */}
          <div className="flex w-1/2 flex-col gap-1 border-l border-chrome-border-hover bg-chrome-border px-1.5 py-1">
            <div className="h-1 w-5 rounded-sm bg-chrome-text-dim" />
            <div className="mt-0.5 h-px w-full rounded-full bg-chrome-text-faint" />
            <div className="h-px w-3/4 rounded-full bg-chrome-text-faint" />
            <div className="h-px w-full rounded-full bg-chrome-text-faint" />
            <div className="h-px w-2/3 rounded-full bg-chrome-text-faint" />
            <div className="mt-0.5 h-[5px] w-full rounded bg-chrome-text-faint" />
          </div>
        </div>
      );
  }
}

export function MobileMenuTypePicker() {
  const { config, applyChange } = useBuilder();
  const current = config.mobileMenuType ?? "dropdown";

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Mobile Menu
      </div>
      <div className="grid grid-cols-3 gap-2">
        {mobileMenuTypeOptions.map((opt) => {
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ mobileMenuType: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-ink-red bg-ink-red/10"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              <div className="flex items-center justify-center p-2">
                <div style={{ width: "56px", height: "36px", overflow: "hidden" }}>
                  <MobileMenuTypeThumbnail type={opt.value} />
                </div>
              </div>

              <div className="px-1.5 pb-2 pt-0.5">
                <span
                  className={cn(
                    "block text-center text-[10px] font-medium transition-colors",
                    selected ? "text-ink-red" : "text-chrome-text-secondary group-hover:text-chrome-text-light"
                  )}
                >
                  {opt.label}
                </span>
              </div>

              {selected ? (
                <div className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink-red text-white">
                  <PickerCheckmark />
                </div>
              ) : (
                <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full border border-chrome-border-hover" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

MobileMenuTypePicker.displayName = "MobileMenuTypePicker";
