"use client";

import { WeeklySchedulePanel } from "@/components/dashboard/weekly-schedule";
import { useTheme } from "@/components/providers/theme-provider";
import { STUDIO_HOUR_OPTIONS, getScheduleSelectClass } from "@/lib/constants/schedule";
import { cn } from "@/lib/utils";

interface StudioBusinessHoursPanelProps {
  open: boolean;
  onClose: () => void;
  businessHours: Record<string, { open: string; close: string; closed: boolean }>;
  onToggleDay: (day: string) => void;
  onUpdateHour: (day: string, field: "open" | "close", value: string) => void;
  onSave: () => void;
}

export function StudioBusinessHoursPanel({
  open,
  onClose,
  businessHours,
  onToggleDay,
  onUpdateHour,
  onSave,
}: StudioBusinessHoursPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const selectClass = getScheduleSelectClass(isDark);

  return (
    <WeeklySchedulePanel
      open={open}
      onClose={onClose}
      title="Business Hours"
      description="Set your studio's weekly hours. Toggle days off when you're closed."
      isDayEnabled={(day) => !businessHours[day]?.closed}
      onToggleDay={onToggleDay}
      saveLabel="Save Hours"
      onSave={onSave}
      renderDayContent={(day) => {
        const h = businessHours[day];
        return (
          <div className="flex items-center gap-2">
            <select value={h.open} onChange={(e) => onUpdateHour(day, "open", e.target.value)} aria-label={`${day} open time`} className={selectClass}>
              {STUDIO_HOUR_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
            <span className={cn("text-[10px] shrink-0", isDark ? "text-ink-cream/15" : "text-ink-black/15")}>–</span>
            <select value={h.close} onChange={(e) => onUpdateHour(day, "close", e.target.value)} aria-label={`${day} close time`} className={selectClass}>
              {STUDIO_HOUR_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
          </div>
        );
      }}
    />
  );
}
