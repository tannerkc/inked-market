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
}

export function PillToggle({ options, value, onChange }: PillToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border transition-colors border-ink-black/10 dark:border-ink-cream/10">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-300 border-none cursor-pointer",
              active
                ? "bg-ink-black text-ink-cream dark:bg-ink-cream dark:text-ink-black"
                : "bg-transparent text-ink-black/40 dark:text-ink-cream/40"
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
