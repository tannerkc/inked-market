import { ARTIST_TIME_OPTIONS, SCHEDULE_SELECT_CLASS } from "@/lib/constants/schedule";
import type { TimeSlot } from "@/lib/types";

interface TimeSlotRowProps {
  slot: TimeSlot;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onRemove: () => void;
}

/**
 * A single editable time-range row (start select – end select – remove button).
 * Used by `<TimeSlotBlock>` and inside `<ArtistAvailabilityPanel>`'s renderDayContent.
 */
export function TimeSlotRow({ slot, onStartChange, onEndChange, onRemove }: TimeSlotRowProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <select
        value={slot.start}
        onChange={(e) => onStartChange(e.target.value)}
        className={SCHEDULE_SELECT_CLASS}
        aria-label="Start time"
      >
        {ARTIST_TIME_OPTIONS.map((t) => (
          <option key={t} value={t} className="text-black">
            {t}
          </option>
        ))}
      </select>

      <span className="text-[10px] shrink-0 text-ink-black/15 dark:text-ink-cream/15">
        –
      </span>

      <select
        value={slot.end}
        onChange={(e) => onEndChange(e.target.value)}
        className={SCHEDULE_SELECT_CLASS}
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
        onClick={onRemove}
        className="w-[22px] h-[22px] rounded-md border flex items-center justify-center text-[12px] cursor-pointer transition-colors shrink-0 border-ink-black/[0.06] text-ink-black/20 hover:border-ink-red/[0.2] hover:text-ink-red/50 dark:border-ink-cream/[0.06] dark:text-ink-cream/20"
        aria-label="Remove time block"
      >
        ×
      </button>
    </div>
  );
}

TimeSlotRow.displayName = "TimeSlotRow";
