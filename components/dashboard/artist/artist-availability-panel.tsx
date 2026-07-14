"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { WeeklySchedulePanel } from "@/components/dashboard/weekly-schedule";
import { TimeSlotRow } from "@/components/dashboard/time-slot-row";
import { BlockedDatesEditor } from "@/components/booking";
import type { WeeklyAvailability } from "@/lib/types";
import type { AvailabilityOverride } from "@/lib/types/booking";

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
  onSave: () => Promise<void> | void;
  blockedDates: AvailabilityOverride[];
  onAddBlocked: (date: string) => Promise<void> | void;
  onRemoveBlocked: (id: string) => Promise<void> | void;
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
  onSave,
  blockedDates,
  onAddBlocked,
  onRemoveBlocked,
}: ArtistAvailabilityPanelProps) {
  return (
    <WeeklySchedulePanel
      open={open}
      onClose={onClose}
      title="Set Availability"
      isDayEnabled={(day) => availability[day]?.enabled ?? false}
      onToggleDay={(day) => onToggleDay(day, !(availability[day]?.enabled ?? false))}
      saveLabel="Save Availability"
      onSave={async () => {
        await onSave();
        onClose();
      }}
      footer={
        <BlockedDatesEditor
          blockedDates={blockedDates}
          onAdd={onAddBlocked}
          onRemove={onRemoveBlocked}
        />
      }
      masterToggle={
        <div className={`rounded-[14px] p-4 border border-dashed mb-4 border-ink-black/[0.08] dark:border-ink-cream/[0.08] ${!takingBookings ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <ToggleSwitch checked={takingBookings} onChange={setTakingBookings} />
            <div>
              <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
                Taking bookings
              </p>
              <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">
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
              <p className="text-[11px] font-mono text-ink-black/20 dark:text-ink-cream/20">
                No time blocks — click &apos;+ Add Block&apos;
              </p>
            ) : (
              slots.map((slot, index) => (
                <TimeSlotRow
                  key={index}
                  slot={slot}
                  onStartChange={(v) => onUpdateSlot(day, index, "start", v)}
                  onEndChange={(v) => onUpdateSlot(day, index, "end", v)}
                  onRemove={() => onRemoveSlot(day, index)}
                />
              ))
            )}
          </div>
        );
      }}
    />
  );
}
