"use client";

import { useState } from "react";
import {
  cancelAppointment,
  completeAppointment,
  markDepositReceived,
  markNoShow,
  waiveDeposit,
} from "@/app/book/deposit-actions";
import { useArtistUpcoming } from "./use-artist-upcoming";
import type { AppointmentRecord } from "@/lib/types/booking";

function LifecycleActions({
  appointment,
  onDone,
}: {
  appointment: AppointmentRecord;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<{ success: boolean }>) => {
    setBusy(true);
    await fn();
    setBusy(false);
    onDone();
  };

  const buttonClass =
    "rounded-full border border-ink-black/[0.1] px-2.5 py-1 font-mono text-[10px] text-ink-black/40 disabled:opacity-40 dark:border-ink-cream/[0.1] dark:text-ink-cream/40";

  return (
    <div className="mt-1 flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void run(() => completeAppointment(appointment.id))}
        className="rounded-full border border-ink-sage/40 px-2.5 py-1 font-mono text-[10px] text-ink-sage disabled:opacity-40"
      >
        Complete
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void run(() => markNoShow(appointment.id))}
        className={buttonClass}
      >
        No-show
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void run(() => cancelAppointment({ appointmentId: appointment.id }))}
        className={buttonClass}
      >
        Cancel
      </button>
    </div>
  );
}

function DepositActions({
  appointment,
  onDone,
}: {
  appointment: AppointmentRecord;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (action: (id: string) => Promise<{ success: boolean }>) => {
    setBusy(true);
    await action(appointment.id);
    setBusy(false);
    onDone();
  };

  return (
    <div className="mt-1 flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void run(markDepositReceived)}
        className="rounded-full border border-ink-sage/40 px-2.5 py-1 font-mono text-[10px] text-ink-sage disabled:opacity-40"
      >
        Mark received
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void run(waiveDeposit)}
        className="rounded-full border border-ink-black/[0.1] px-2.5 py-1 font-mono text-[10px] text-ink-black/40 disabled:opacity-40 dark:border-ink-cream/[0.1] dark:text-ink-cream/40"
      >
        Waive
      </button>
    </div>
  );
}

/** The artist dashboard "Upcoming" card, live from appointments. */
export function UpcomingAppointmentsCard() {
  const { appointments, loading, refresh } = useArtistUpcoming();

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
              className="border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
                    {a.customerName ?? "Customer"}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-black/30 dark:text-ink-cream/30">
                    {a.type}
                    {a.status === "pending_deposit" ? " · awaiting deposit" : ""}
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
              {a.status === "pending_deposit" && a.depositStatus === "pending" ? (
                <DepositActions appointment={a} onDone={() => void refresh()} />
              ) : null}
              {a.status === "confirmed" ? (
                <LifecycleActions appointment={a} onDone={() => void refresh()} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
