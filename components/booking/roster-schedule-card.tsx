"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { GroupLabel } from "@/components/dashboard/group-label";
import { useRosterSchedule } from "./use-roster-schedule";

const DOT_COLORS = [
  "bg-ink-rust",
  "bg-ink-sage",
  "bg-ink-red",
  "bg-indigo-400",
  "bg-amber-500",
  "bg-ink-black/40 dark:bg-ink-cream/40",
];

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Studio-wide schedule: roster bookings + walk-ins, grouped by day. Read-only. */
export function RosterScheduleCard() {
  const { entries, loading } = useRosterSchedule();

  const byDay = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = dayKey(e.appointment.startAt);
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }

  return (
    <div className="rounded-[20px] p-5 border bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.02] dark:border-ink-cream/[0.06]">
      <GroupLabel className="mb-3">Studio Schedule</GroupLabel>
      {loading ? (
        <p className="py-4 text-center text-[12px] text-ink-black/40 dark:text-ink-cream/40">
          Loading...
        </p>
      ) : entries.length === 0 ? (
        <EmptyState
          message="Nothing on the books"
          description="Roster bookings and walk-ins show up here"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {Array.from(byDay.entries()).map(([day, dayEntries]) => (
            <div key={day}>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-black/25 dark:text-ink-cream/25">
                {day}
              </p>
              {dayEntries.map(({ appointment: a, artistName, colorIndex }) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[colorIndex] ?? DOT_COLORS[5]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-ink-black dark:text-ink-cream">
                      <span className="font-medium">{artistName}</span>
                      {a.customerName ? ` · ${a.customerName}` : ""}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-black/30 dark:text-ink-cream/30">
                      {a.type}
                      {a.status === "pending_deposit" ? " · awaiting deposit" : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[11px] text-ink-black/50 dark:text-ink-cream/50">
                    {new Date(a.startAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
