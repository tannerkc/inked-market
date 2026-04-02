"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AccentColor = "red" | "rust" | "sage";

interface StylePickerProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor?: AccentColor;
  className?: string;
}

const selectedStyles: Record<AccentColor, string> = {
  red: "border-ink-red bg-ink-red/[0.05] text-ink-red opacity-100",
  rust: "border-ink-rust bg-ink-rust/[0.05] text-ink-rust opacity-100",
  sage: "border-ink-sage bg-ink-sage/[0.05] text-ink-sage opacity-100",
};

export function StylePicker({ options, selected, onChange, accentColor = "red", className }: StylePickerProps) {
  const toggle = (style: string) => {
    if (selected.includes(style)) {
      onChange(selected.filter((s) => s !== style));
    } else {
      onChange([...selected, style]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((style) => {
        const isSelected = selected.includes(style);
        return (
          <button
            key={style}
            type="button"
            onClick={() => toggle(style)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.12em] px-[15px] py-[9px] rounded-full",
              "border border-ink-black/[0.06] bg-ink-black/[0.015] text-ink-black opacity-[0.45]",
              "transition-all duration-200 cursor-pointer",
              "hover:opacity-[0.65] hover:border-ink-black/[0.12]",
              isSelected && selectedStyles[accentColor]
            )}
          >
            {style}
          </button>
        );
      })}
    </div>
  );
}
