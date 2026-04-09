"use client";

import { cn } from "@/lib/utils";

interface PillToggleOption {
  label: string;
  value: string;
}

interface PillToggleProps {
  options: PillToggleOption[];
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
}

export function PillToggle({ options, value, onChange, isDark }: PillToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-full border transition-colors",
        isDark ? "border-ink-cream/10" : "border-ink-black/10"
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-300 border-none cursor-pointer",
              active
                ? isDark
                  ? "bg-ink-cream text-ink-black"
                  : "bg-ink-black text-ink-cream"
                : isDark
                  ? "bg-transparent text-ink-cream/40"
                  : "bg-transparent text-ink-black/40"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

PillToggle.displayName = "PillToggle";
