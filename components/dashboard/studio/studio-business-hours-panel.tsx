"use client";

import { WeeklySchedulePanel } from "@/components/dashboard/weekly-schedule";
import { STUDIO_HOUR_OPTIONS, SCHEDULE_SELECT_CLASS } from "@/lib/constants/schedule";

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
        if (!h) return null;
        return (
          <div className="flex items-center gap-2">
            <select value={h.open} onChange={(e) => onUpdateHour(day, "open", e.target.value)} aria-label={`${day} open time`} className={SCHEDULE_SELECT_CLASS}>
              {STUDIO_HOUR_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
            <span className="text-[10px] shrink-0 text-ink-black/15 dark:text-ink-cream/15">–</span>
            <select value={h.close} onChange={(e) => onUpdateHour(day, "close", e.target.value)} aria-label={`${day} close time`} className={SCHEDULE_SELECT_CLASS}>
              {STUDIO_HOUR_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
          </div>
        );
      }}
    />
  );
}
