"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OptionGridOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface OptionGridPickerProps<T extends string> {
  title: string;
  options: ReadonlyArray<OptionGridOption<T>>;
  selectedValue: T;
  onSelect: (value: T) => void;
  /** Number of columns in the grid. Defaults to 2. */
  columns?: 2 | 3;
  /** Optional content rendered to the right of the title (e.g. a "Replay" button). */
  headerActions?: React.ReactNode;
}

/**
 * Shared grid-picker pattern used by builder style controls
 * (border-shape, density, divider-style, image-treatment, logo-placement,
 * texture, animation-style, etc.). Each tile shows a label, optional
 * description, and a checkmark when selected.
 */
function OptionGridPickerInner<T extends string>({
  title,
  options,
  selectedValue,
  onSelect,
  columns = 2,
  headerActions,
}: OptionGridPickerProps<T>) {
  const gridCols = columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div>
      <div className={cn("mb-3", headerActions ? "flex items-center justify-between" : undefined)}>
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          {title}
        </span>
        {headerActions}
      </div>
      <div className={cn("grid gap-2", gridCols)}>
        {options.map((opt) => {
          const selected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors",
                selected
                  ? "border-ink-red bg-ink-red/10 ring-1 ring-ink-red/30"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              {selected && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-red">
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth={2}>
                    <path d="M2 5.5 4.5 8 8.5 3" />
                  </svg>
                </span>
              )}
              <span className="text-[11px] font-semibold text-chrome-text-light">{opt.label}</span>
              {opt.description && (
                <span className="text-[10px] leading-tight text-chrome-text-dim">{opt.description}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// React.memo + generic forward typing
const OptionGridPicker = OptionGridPickerInner as <T extends string>(
  props: OptionGridPickerProps<T>
) => React.ReactElement;

export { OptionGridPicker };
export type { OptionGridOption, OptionGridPickerProps };
