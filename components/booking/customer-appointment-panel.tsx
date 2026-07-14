"use client";

import { useState } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "./form-rows";
import { cancelAppointment } from "@/app/book/deposit-actions";
import type { AppointmentRecord } from "@/lib/types/booking";

const REFUND_COPY: Record<string, string> = {
  refund_due: "Your deposit refund is owed to you — the artist will process it.",
  forfeit: "Inside the cancellation window — the deposit is non-refundable.",
  none: "",
};

function fmtWhen(iso: string, timeZone?: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

interface CustomerAppointmentPanelProps {
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onChanged: () => void;
}

export function CustomerAppointmentPanel({
  appointment,
  onClose,
  onChanged,
}: CustomerAppointmentPanelProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  if (!appointment) return null;
  const a = appointment;
  const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const active = a.status === "pending_deposit" || a.status === "confirmed";
  const future = Date.parse(a.startAt) > Date.now();

  const close = () => {
    setError(null);
    setOutcome(null);
    onClose();
  };

  const cancel = async () => {
    setBusy(true);
    setError(null);
    const result = await cancelAppointment({ appointmentId: a.id });
    setBusy(false);
    if (result.success) {
      setOutcome(REFUND_COPY[result.refund ?? "none"] || "Appointment cancelled.");
      onChanged();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <SlideOverPanel open={Boolean(appointment)} onClose={close} title="Appointment">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="text-[13px] font-medium text-ink-black dark:text-ink-cream">
            {a.artistName ?? a.studioName ?? "Booking"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-black/30 dark:text-ink-cream/30">
            {a.type} · {a.status.replace("_", " ")}
          </p>
        </div>

        <div className="rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
          <FieldLabel>{fmtWhen(a.startAt, a.timezone)}</FieldLabel>
          {viewerZone !== a.timezone ? (
            <p className="mt-1 font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
              Your time: {fmtWhen(a.startAt)}
            </p>
          ) : null}
        </div>

        {a.priceCents ? (
          <p className="font-mono text-[12px] text-ink-black/60 dark:text-ink-cream/60">
            Price: ${(a.priceCents / 100).toFixed(0)}
          </p>
        ) : null}
        {a.depositCents > 0 ? (
          <p className="font-mono text-[12px] text-ink-black/60 dark:text-ink-cream/60">
            Deposit: ${(a.depositCents / 100).toFixed(0)} · {a.depositStatus.replace("_", " ")}
          </p>
        ) : null}

        {a.status === "pending_deposit" && a.depositStatus === "pending" && a.depositCheckoutUrl ? (
          <a
            href={a.depositCheckoutUrl}
            className="min-h-[44px] rounded-full bg-ink-rust px-4 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-white hover:bg-ink-rust/90"
          >
            Pay deposit
          </a>
        ) : null}

        {outcome ? (
          <p className="text-[12px] text-ink-black/60 dark:text-ink-cream/60">{outcome}</p>
        ) : null}
        {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}

        {active && future && !outcome ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="ink-outline"
              className="min-h-[44px]"
              disabled={busy}
              onClick={() => void cancel()}
            >
              {busy ? "Cancelling..." : "Cancel appointment"}
            </Button>
            <p className="text-[10px] text-ink-black/30 dark:text-ink-cream/30">
              Deposits may be non-refundable inside the artist&apos;s cancellation window.
            </p>
          </div>
        ) : null}
      </div>
    </SlideOverPanel>
  );
}
