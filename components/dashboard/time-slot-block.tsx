"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { ARTIST_TIME_OPTIONS, getScheduleSelectClass } from "@/lib/constants/schedule";
import { type TimeSlot } from "@/lib/types";

export interface TimeSlotBlockProps {
  dayName: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  slots: TimeSlot[];
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onUpdateSlot: (index: number, field: "start" | "end", value: string) => void;
  className?: string;
}

const TimeSlotBlock = React.forwardRef<HTMLDivElement, TimeSlotBlockProps>(
  (
    {
      dayName,
      enabled,
      onToggle,
      slots,
      onAddSlot,
      onRemoveSlot,
      onUpdateSlot,
      className,
    },
    ref
  ) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    const selectClass = getScheduleSelectClass(isDark);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[14px] overflow-hidden border mb-3 transition-opacity",
          isDark
            ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
            : "border-ink-black/[0.06] bg-ink-black/[0.02]",
          !enabled && "opacity-50",
          className
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between p-3 px-4">
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={enabled}
              onChange={onToggle}
              size="sm"
            />
            <span
              className={cn(
                "font-mono text-[10px] tracking-[0.1em] uppercase",
                isDark ? "text-ink-cream/60" : "text-ink-black/60"
              )}
            >
              {dayName}
            </span>
          </div>
          {enabled && (
            <button
              type="button"
              onClick={onAddSlot}
              className="text-ink-rust font-mono text-[8px] tracking-[0.12em] uppercase cursor-pointer hover:text-ink-rust/70 transition-colors"
            >
              + Add Block
            </button>
          )}
        </div>

        {/* Time slots */}
        {enabled && (
          <div className="px-4 pb-3">
            {slots.length === 0 ? (
              <p
                className={cn(
                  "text-[11px] font-mono",
                  isDark ? "text-ink-cream/20" : "text-ink-black/20"
                )}
              >
                No time blocks — click &apos;+ Add Block&apos;
              </p>
            ) : (
              slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <select
                    value={slot.start}
                    onChange={(e) => onUpdateSlot(index, "start", e.target.value)}
                    className={selectClass}
                    aria-label="Start time"
                  >
                    {ARTIST_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t} className="text-black">
                        {t}
                      </option>
                    ))}
                  </select>

                  <span
                    className={cn(
                      "text-[10px] shrink-0",
                      isDark ? "text-ink-cream/15" : "text-ink-black/15"
                    )}
                  >
                    –
                  </span>

                  <select
                    value={slot.end}
                    onChange={(e) => onUpdateSlot(index, "end", e.target.value)}
                    className={selectClass}
                    aria-label="End time"
                  >
                    {ARTIST_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t} className="text-black">
                        {t}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => onRemoveSlot(index)}
                    className={cn(
                      "w-[22px] h-[22px] rounded-md border flex items-center justify-center text-[12px] cursor-pointer transition-colors shrink-0",
                      isDark
                        ? "border-ink-cream/[0.06] text-ink-cream/20 hover:border-ink-red/[0.2] hover:text-ink-red/50"
                        : "border-ink-black/[0.06] text-ink-black/20 hover:border-ink-red/[0.2] hover:text-ink-red/50"
                    )}
                    aria-label="Remove time block"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

TimeSlotBlock.displayName = "TimeSlotBlock";

export { TimeSlotBlock };
