"use client";

import * as React from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/lib/constants/schedule";

interface WeeklySchedulePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Whether each day is enabled/active */
  isDayEnabled: (day: string) => boolean;
  /** Toggle a day on/off */
  onToggleDay: (day: string) => void;
  /** Render the controls for an enabled day (time slots, open/close selects, etc.) */
  renderDayContent: (day: string) => React.ReactNode;
  /** Optional master toggle (e.g. "Taking bookings") rendered above the day list */
  masterToggle?: React.ReactNode;
  saveLabel?: string;
  onSave: () => void;
}

export function WeeklySchedulePanel({
  open,
  onClose,
  title,
  description,
  isDayEnabled,
  onToggleDay,
  renderDayContent,
  masterToggle,
  saveLabel = "Save",
  onSave,
}: WeeklySchedulePanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <SlideOverPanel open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        {description && (
          <p className={`text-[12px] mb-4 ${isDark ? "text-ink-cream/40" : "text-ink-black/40"}`}>
            {description}
          </p>
        )}

        {masterToggle}

        <div className={masterToggle ? "space-y-0" : ""}>
          {DAYS_OF_WEEK.map((day) => {
            const enabled = isDayEnabled(day);
            return (
              <div
                key={day}
                className={cn(
                  "rounded-[14px] border p-3 px-4 transition-opacity mb-2",
                  isDark ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]" : "border-ink-black/[0.06] bg-ink-black/[0.02]",
                  !enabled && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={enabled}
                      onChange={() => onToggleDay(day)}
                      size="sm"
                    />
                    <span className={cn(
                      "font-mono text-[10px] tracking-[0.1em] uppercase",
                      isDark ? "text-ink-cream/60" : "text-ink-black/60"
                    )}>
                      {day}
                    </span>
                  </div>
                </div>
                {enabled && (
                  <div className="mt-2.5 ml-[44px]">
                    {renderDayContent(day)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="ink" className="w-full mt-4" onClick={onSave}>{saveLabel}</Button>
        <Button variant="ink-outline" className="w-full" onClick={onClose}>Cancel</Button>
      </div>
    </SlideOverPanel>
  );
}
