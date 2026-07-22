"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PickerCheckmark } from "./picker-checkmark";

interface ThumbnailPickerOption<T extends string | number> {
  value: T;
  label: string;
}

interface ThumbnailPickerProps<T extends string | number> {
  title: string;
  options: ReadonlyArray<ThumbnailPickerOption<T>>;
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  /**
   * Render the thumbnail content for a given option. Receives the option
   * value and whether it's currently selected. Wrapped automatically in
   * an aspect-[4/3] container.
   */
  renderThumbnail: (value: T, selected: boolean) => React.ReactNode;
  /** Number of columns in the grid. Defaults to 2. */
  columns?: 2 | 3;
}

/**
 * Shared aspect-card picker used across builder layout/style controls
 * (about-layout, hero-style, details-layout, gallery-style, gallery-photos,
 * tag-style). Each card shows a custom thumbnail, label, and a checkmark
 * when selected.
 */
function ThumbnailPickerInner<T extends string | number>({
  title,
  options,
  selectedValue,
  onSelect,
  renderThumbnail,
  columns = 2,
}: ThumbnailPickerProps<T>) {
  const gridCols = columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {title}
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
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-ink-red bg-chrome-surface ring-1 ring-ink-red/30"
                  : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover hover:bg-chrome-surface-hover"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                {renderThumbnail(opt.value, selected)}
              </div>

              <div className="px-2 pb-2.5 pt-0.5">
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    selected
                      ? "text-ink-red"
                      : "text-chrome-text-secondary group-hover:text-chrome-text-light"
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

const ThumbnailPicker = ThumbnailPickerInner as <T extends string | number>(
  props: ThumbnailPickerProps<T>
) => React.ReactElement;

export { ThumbnailPicker };
export type { ThumbnailPickerOption, ThumbnailPickerProps };
