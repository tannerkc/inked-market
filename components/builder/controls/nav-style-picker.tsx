"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { navOptions } from "@/lib/data/builder-options";
import type { NavStyle } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function NavThumbnail({ style, selected }: { style: NavStyle; selected: boolean }) {
  const accent = selected ? "#FF3333" : "#444";

  switch (style) {
    case "none":
      return (
        <div className="flex h-full w-full rounded-md bg-chrome-raised" />
      );
    case "static":
      return (
        <div className="flex h-full w-full flex-col rounded-md bg-chrome-raised p-1.5">
          {/* Static bar at top */}
          <div
            className="h-[5px] w-full rounded-sm"
            style={{ backgroundColor: accent }}
          />
          <div className="flex-1" />
        </div>
      );
    case "floating":
      return (
        <div className="flex h-full w-full flex-col rounded-md bg-chrome-raised p-1.5">
          {/* Floating bar with gap from top + glow effect */}
          <div className="mt-0.5 px-1">
            <div
              className="h-[5px] w-full rounded-sm"
              style={{
                backgroundColor: accent,
                boxShadow: `0 1px 4px ${selected ? "rgba(255,51,51,0.3)" : "rgba(68,68,68,0.4)"}`,
              }}
            />
          </div>
          <div className="flex-1" />
        </div>
      );
    case "reveal":
      return (
        <div className="flex h-full w-full flex-col rounded-md bg-chrome-raised p-1.5">
          {/* Bar partially slid in from top with arrow hint */}
          <div
            className="h-[5px] w-full rounded-sm"
            style={{
              backgroundColor: accent,
              transform: "translateY(-2px)",
              opacity: 0.6,
            }}
          />
          {/* Down arrow indicator */}
          <div className="flex flex-1 items-start justify-center pt-0.5">
            <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
              <path d="M0.5 0.5L3 3L5.5 0.5" stroke={accent} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      );
  }
}

export function NavStylePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Navigation Bar
      </div>
      <div className="grid grid-cols-2 gap-2">
        {navOptions.map((opt) => {
          const selected = config.navStyle === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ navStyle: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-ink-red bg-chrome-surface ring-1 ring-ink-red/30"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              {/* Thumbnail area */}
              <div className="aspect-[4/3] w-full p-1.5">
                <NavThumbnail style={opt.value} selected={selected} />
              </div>

              {/* Label + description */}
              <div className="px-2 pb-2.5 pt-0.5 text-left">
                <span
                  className={cn(
                    "block text-[11px] font-medium transition-colors",
                    selected ? "text-ink-red" : "text-chrome-text-secondary group-hover:text-chrome-text-light"
                  )}
                >
                  {opt.label}
                </span>
                <span className="block text-[10px] text-chrome-text-dim">
                  {opt.description}
                </span>
              </div>

              {/* Selected check */}
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
    </div>
  );
}

NavStylePicker.displayName = "NavStylePicker";
