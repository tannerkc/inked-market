import { DAYS_OF_WEEK, SHORT_DAYS } from "@/lib/constants/schedule";
import { EmptyState } from "@/components/dashboard/empty-state";

interface StudioBusinessHoursProps {
  businessHours: Record<string, { open: string; close: string; closed: boolean }>;
  hoursSaved: boolean;
  onEdit: () => void;
}

export function StudioBusinessHours({ businessHours, hoursSaved, onEdit }: StudioBusinessHoursProps) {
  return (
    <div className="rounded-[20px] p-5 border bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.02] dark:border-ink-cream/[0.06]">
      <div className="flex justify-between items-center mb-3">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-black/60 dark:text-ink-cream/60">Business Hours</p>
        <button onClick={onEdit} className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer">
          {hoursSaved ? "Edit" : "+ Set"}
        </button>
      </div>
      {hoursSaved ? (
        <div className="space-y-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const h = businessHours[day];
            if (!h) return null;
            return (
              <div key={day} className="flex justify-between items-center">
                <span className={`font-mono text-[10px] tracking-[0.05em] ${h.closed ? "text-ink-black/60 dark:text-ink-cream/60" : "text-ink-black/75 dark:text-ink-cream/75"}`}>
                  {SHORT_DAYS[day]}
                </span>
                <span className={`font-mono text-[10px] ${h.closed ? "text-ink-black/60 dark:text-ink-cream/60" : "text-ink-black/75 dark:text-ink-cream/75"}`}>
                  {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="No hours set" description="Help clients know when to visit" />
      )}
    </div>
  );
}
