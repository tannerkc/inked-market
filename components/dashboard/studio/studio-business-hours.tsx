"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { DAYS_OF_WEEK, SHORT_DAYS } from "@/lib/constants/schedule";

interface StudioBusinessHoursProps {
  businessHours: Record<string, { open: string; close: string; closed: boolean }>;
  hoursSaved: boolean;
  onEdit: () => void;
}

export function StudioBusinessHours({ businessHours, hoursSaved, onEdit }: StudioBusinessHoursProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`rounded-[20px] p-5 border ${isDark ? "bg-ink-cream/[0.02] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]"}`}>
      <div className="flex justify-between items-center mb-3">
        <p className={`font-mono text-[9px] tracking-[0.2em] uppercase ${isDark ? "text-ink-cream/35" : "text-ink-black/35"}`}>Business Hours</p>
        <button onClick={onEdit} className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer">
          {hoursSaved ? "Edit" : "+ Set"}
        </button>
      </div>
      {hoursSaved ? (
        <div className="space-y-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const h = businessHours[day];
            return (
              <div key={day} className="flex justify-between items-center">
                <span className={`font-mono text-[10px] tracking-[0.05em] ${h.closed ? (isDark ? "text-ink-cream/20" : "text-ink-black/20") : (isDark ? "text-ink-cream/50" : "text-ink-black/50")}`}>
                  {SHORT_DAYS[day]}
                </span>
                <span className={`font-mono text-[10px] ${h.closed ? (isDark ? "text-ink-cream/15" : "text-ink-black/15") : (isDark ? "text-ink-cream/40" : "text-ink-black/40")}`}>
                  {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className={`text-[12px] ${isDark ? "text-ink-cream/40" : "text-ink-black/40"}`}>No hours set</p>
          <p className={`text-[11px] mt-1 ${isDark ? "text-ink-cream/20" : "text-ink-black/20"}`}>Help clients know when to visit</p>
        </div>
      )}
    </div>
  );
}
