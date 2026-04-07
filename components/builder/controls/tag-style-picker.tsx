"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { tagOptions } from "@/lib/data/builder-options";
import type { TagStyle } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

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
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-1.5 rounded-md bg-[#1a1a1a] p-2.5">
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
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
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
                  ? "border-[#FF3333] bg-[#111] ring-1 ring-[#FF3333]/30"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                <TagThumbnail style={opt.value} accent={accent} />
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

TagStylePicker.displayName = "TagStylePicker";
