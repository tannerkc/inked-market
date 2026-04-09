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
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        {label}
      </div>
      <div className="flex gap-1">
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
                  ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)] text-[#FF3333]"
                  : "border-[#222] bg-[#111] text-[#555] hover:border-[#333] hover:text-[#888]"
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
