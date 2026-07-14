"use client";

import { useArtistUpcoming } from "./use-artist-upcoming";

/** The artist dashboard "Upcoming" card, live from appointments. */
export function UpcomingAppointmentsCard() {
  const { appointments, loading } = useArtistUpcoming();

  return (
    <div className="rounded-[20px] p-5 border bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.02] dark:border-ink-cream/[0.06]">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-black/35 dark:text-ink-cream/35">
        Upcoming
      </p>
      {loading ? (
        <p className="py-4 text-center text-[12px] text-ink-black/40 dark:text-ink-cream/40">
          Loading...
        </p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">
            No upcoming bookings
          </p>
          <p className="text-[11px] mt-1 text-ink-black/20 dark:text-ink-cream/20">
            Bookings appear once clients find you
          </p>
        </div>
      ) : (
        <div>
          {appointments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
                  {a.customerName ?? "Customer"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-black/30 dark:text-ink-cream/30">
                  {a.type}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[11px] text-ink-black/50 dark:text-ink-cream/50">
                {new Date(a.startAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}{" "}
                {new Date(a.startAt).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
