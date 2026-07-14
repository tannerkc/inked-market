"use client";

import { useState } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "./form-rows";
import { SlotPicker } from "./slot-picker";
import { scheduleFromRequest, withdrawBookingRequest } from "@/app/book/actions";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { BookingRequestRecord, ProposedTime } from "@/lib/types/booking";

function fmtRange(t: ProposedTime): string {
  const start = new Date(t.startAt);
  const end = new Date(t.endAt);
  return `${start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function fmtQuote(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min !== max) {
    return `$${(min / 100).toFixed(0)} - $${(max / 100).toFixed(0)}`;
  }
  return `$${(((min ?? max) as number) / 100).toFixed(0)}`;
}

interface CustomerRequestPanelProps {
  request: BookingRequestRecord | null;
  scheduled: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function CustomerRequestPanel({
  request,
  scheduled,
  onClose,
  onChanged,
}: CustomerRequestPanelProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  if (!request) return null;
  const status = effectiveRequestStatus(request, new Date());
  const quote = fmtQuote(request.quoteMinCents, request.quoteMaxCents);

  const close = () => {
    setError(null);
    setBooked(false);
    onClose();
  };

  const schedule = async (startAt: string, endAt: string) => {
    setBusy(true);
    setError(null);
    const result = await scheduleFromRequest({ requestId: request.id, startAt, endAt });
    setBusy(false);
    if (result.success) {
      setBooked(true);
      onChanged();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  const withdraw = async () => {
    setBusy(true);
    setError(null);
    const result = await withdrawBookingRequest(request.id);
    setBusy(false);
    if (result.success) {
      onChanged();
      close();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <SlideOverPanel open={Boolean(request)} onClose={close} title="Your Request">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="text-[13px] font-medium text-ink-black dark:text-ink-cream">
            {request.artistName ?? "Artist"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-black/30 dark:text-ink-cream/30">
            {status}
          </p>
        </div>

        <p className="text-[13px] leading-relaxed text-ink-black/70 dark:text-ink-cream/70">
          {request.description}
        </p>

        {request.responseMessage ? (
          <div className="rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
            <FieldLabel>From the artist</FieldLabel>
            <p className="mt-1 text-[12px] text-ink-black/60 dark:text-ink-cream/60">
              {request.responseMessage}
            </p>
          </div>
        ) : null}

        {quote ? (
          <p className="font-mono text-[12px] text-ink-black/60 dark:text-ink-cream/60">
            Quote: {quote}
          </p>
        ) : null}
        {request.depositCents ? (
          <p className="font-mono text-[12px] text-ink-black/60 dark:text-ink-cream/60">
            Deposit to lock in: ${(request.depositCents / 100).toFixed(0)}
          </p>
        ) : null}

        {booked || scheduled ? (
          <div className="rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
            <FieldLabel>Scheduled</FieldLabel>
            <p className="mt-1 text-[12px] text-ink-black/60 dark:text-ink-cream/60">
              Your session is on the calendar — see Upcoming Appointments.
            </p>
          </div>
        ) : status === "accepted" && request.schedulingMode === "propose" ? (
          <div className="flex flex-col gap-2">
            <FieldLabel>Pick a time</FieldLabel>
            {request.proposedTimes.map((t) => (
              <button
                key={t.startAt}
                type="button"
                disabled={busy}
                onClick={() => void schedule(t.startAt, t.endAt)}
                className="min-h-[44px] rounded-lg border border-ink-black/[0.08] px-3 text-left font-mono text-[12px] transition-colors hover:border-ink-rust disabled:opacity-40 dark:border-ink-cream/[0.08]"
              >
                {fmtRange(t)}
              </button>
            ))}
          </div>
        ) : status === "accepted" && request.schedulingMode === "open_calendar" && request.artistId ? (
          <div className="flex flex-col gap-2">
            <FieldLabel>Pick a time</FieldLabel>
            <SlotPicker
              artistId={request.artistId}
              durationMin={request.sessionDurationMin ?? 180}
              disabled={busy}
              onPick={(slot) => void schedule(slot.startAt, slot.endAt)}
            />
          </div>
        ) : null}

        {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}

        {status === "pending" ? (
          <Button
            variant="ink-outline"
            className="min-h-[44px]"
            disabled={busy}
            onClick={() => void withdraw()}
          >
            {busy ? "Withdrawing..." : "Withdraw request"}
          </Button>
        ) : null}
      </div>
    </SlideOverPanel>
  );
}
