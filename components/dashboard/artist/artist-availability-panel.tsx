"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { WeeklySchedulePanel } from "@/components/dashboard/weekly-schedule";
import { useTheme } from "@/components/providers/theme-provider";
import { ARTIST_TIME_OPTIONS, getScheduleSelectClass } from "@/lib/constants/schedule";
import { cn } from "@/lib/utils";
import type { WeeklyAvailability } from "@/lib/types";

interface ArtistAvailabilityPanelProps {
  open: boolean;
  onClose: () => void;
  takingBookings: boolean;
  setTakingBookings: (value: boolean) => void;
  availability: WeeklyAvailability;
  onToggleDay: (day: string, enabled: boolean) => void;
  onAddSlot: (day: string) => void;
  onRemoveSlot: (day: string, index: number) => void;
  onUpdateSlot: (day: string, index: number, field: "start" | "end", value: string) => void;
}

export function ArtistAvailabilityPanel({
  open,
  onClose,
  takingBookings,
  setTakingBookings,
  availability,
  onToggleDay,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
}: ArtistAvailabilityPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const selectClass = getScheduleSelectClass(isDark);

  return (
    <WeeklySchedulePanel
      open={open}
      onClose={onClose}
      title="Set Availability"
      isDayEnabled={(day) => availability[day]?.enabled ?? false}
      onToggleDay={(day) => onToggleDay(day, !(availability[day]?.enabled ?? false))}
      saveLabel="Save Availability"
      onSave={onClose}
      masterToggle={
        <div className={`rounded-[14px] p-4 border border-dashed mb-4 ${isDark ? "border-ink-cream/[0.08]" : "border-ink-black/[0.08]"} ${!takingBookings ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <ToggleSwitch checked={takingBookings} onChange={setTakingBookings} />
            <div>
              <p className={`font-mono text-[12px] font-medium ${isDark ? "text-ink-cream/70" : "text-ink-black/70"}`}>
                Taking bookings
              </p>
              <p className={`text-[10px] ${isDark ? "text-ink-cream/25" : "text-ink-black/25"}`}>
                {takingBookings ? "Clients can see your availability" : "Your profile will show as unavailable"}
              </p>
            </div>
          </div>
        </div>
      }
      renderDayContent={(day) => {
        const slots = availability[day]?.slots ?? [];
        return (
          <div>
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => onAddSlot(day)}
                className="text-ink-rust font-mono text-[8px] tracking-[0.12em] uppercase cursor-pointer hover:text-ink-rust/70 transition-colors"
              >
                + Add Block
              </button>
            </div>
            {slots.length === 0 ? (
              <p className={cn("text-[11px] font-mono", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>
                No time blocks — click &apos;+ Add Block&apos;
              </p>
            ) : (
              slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <select value={slot.start} onChange={(e) => onUpdateSlot(day, index, "start", e.target.value)} className={selectClass} aria-label="Start time">
                    {ARTIST_TIME_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
                  </select>
                  <span className={cn("text-[10px] shrink-0", isDark ? "text-ink-cream/15" : "text-ink-black/15")}>–</span>
                  <select value={slot.end} onChange={(e) => onUpdateSlot(day, index, "end", e.target.value)} className={selectClass} aria-label="End time">
                    {ARTIST_TIME_OPTIONS.map((t) => <option key={t} value={t} className="text-black">{t}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(day, index)}
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
        );
      }}
    />
  );
}
