"use client";

import { cn } from "@/lib/utils";

interface SegmentedPickerProps<T extends string> {
  label: string;
  options: { label: string; value: T }[];
  value: T | undefined;
  onChange: (v: T) => void;
}

export function SegmentedPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedPickerProps<T>) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {label}
      </div>
      <div className="flex gap-1" role="group" aria-label={label}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex-1 rounded border px-2 py-1.5 text-[10px] font-semibold transition-colors",
                selected
                  ? "border-ink-red bg-ink-red/10 text-ink-red"
                  : "border-chrome-border bg-chrome-surface text-chrome-text-dim hover:border-chrome-border-hover hover:text-chrome-text-secondary"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

SegmentedPicker.displayName = "SegmentedPicker";
