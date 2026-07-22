"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { type TimeSlot } from "@/lib/types";
import { TimeSlotRow } from "./time-slot-row";

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
  ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[14px] overflow-hidden border mb-3 transition-opacity",
        "border-ink-black/[0.06] bg-ink-black/[0.02] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]",
        !enabled && "opacity-50",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between p-3 px-4">
        <div className="flex items-center gap-3">
          <ToggleSwitch checked={enabled} onChange={onToggle} size="sm" />
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-black/60 dark:text-ink-cream/60">
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
            <p className="text-[11px] font-mono text-ink-black/20 dark:text-ink-cream/20">
              No time blocks — click &apos;+ Add Block&apos;
            </p>
          ) : (
            slots.map((slot, index) => (
              <TimeSlotRow
                key={index}
                slot={slot}
                onStartChange={(v) => onUpdateSlot(index, "start", v)}
                onEndChange={(v) => onUpdateSlot(index, "end", v)}
                onRemove={() => onRemoveSlot(index)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
);

TimeSlotBlock.displayName = "TimeSlotBlock";

export { TimeSlotBlock };
