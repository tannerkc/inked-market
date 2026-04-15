"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { tagOptions } from "@/lib/data/builder-options";
import type { TagStyle } from "@/lib/types/builder";
import { cn } from "@/lib/utils";
import { PickerCheckmark } from "./picker-checkmark";

function TagThumbnail({
  style,
  accent,
}: {
  style: TagStyle;
  accent: string;
}) {
  const tagBase = "px-2 py-0.5 text-[9px] font-medium";

  const renderTag = (label: string) => {
    switch (style) {
      case "pill":
        return (
          <span className={cn(tagBase, "rounded-full")} style={{ backgroundColor: `${accent}1a`, color: accent }}>
            {label}
          </span>
        );
      case "square":
        return (
          <span className={cn(tagBase, "rounded")} style={{ backgroundColor: `${accent}1a`, color: accent }}>
            {label}
          </span>
        );
      case "outline":
        return (
          <span className={cn(tagBase, "rounded-full border")} style={{ borderColor: `${accent}66`, color: accent }}>
            {label}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-1.5 rounded-md bg-chrome-raised p-2.5">
      {renderTag("Traditional")}
      {renderTag("Realism")}
      {renderTag("Blackwork")}
    </div>
  );
}

export function TagStylePicker() {
  const { config, resolvedVars, applyChange } = useBuilder();
  const accent = config.accentColor ?? resolvedVars["--accent"];

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Tag Style
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tagOptions.map((opt) => {
          const selected = config.tagStyle === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ tagStyle: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-ink-red bg-chrome-surface ring-1 ring-ink-red/30"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                <TagThumbnail style={opt.value} accent={accent} />
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
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-red text-white">
                  <PickerCheckmark />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

TagStylePicker.displayName = "TagStylePicker";
