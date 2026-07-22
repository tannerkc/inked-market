"use client";

import { useState } from "react";
import {
  cancelAppointment,
  completeAppointment,
  markDepositReceived,
  markNoShow,
  waiveDeposit,
} from "@/app/book/deposit-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GroupLabel } from "@/components/dashboard/group-label";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { ListGroup } from "@/components/dashboard/list-group";
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
    <div className="mt-1.5 flex gap-2 pl-10">
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
    <div className="mt-1.5 flex gap-2 pl-10">
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
      <GroupLabel className="mb-3">Upcoming</GroupLabel>
      {loading ? (
        <p className="py-4 text-center text-[12px] text-ink-black/40 dark:text-ink-cream/40">
          Loading...
        </p>
      ) : appointments.length === 0 ? (
        <EmptyState
          message="No upcoming bookings"
          description="Bookings appear once clients find you"
        />
      ) : (
        <ListGroup>
          {appointments.map((a) => (
            <div key={a.id} className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <InitialsAvatar
                  name={a.customerName ?? "Customer"}
                  tone={a.status === "pending_deposit" ? "accent" : "muted"}
                />
                <div className="min-w-0 flex-1">
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
        </ListGroup>
      )}
    </div>
  );
}
