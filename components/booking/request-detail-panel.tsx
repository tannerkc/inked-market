"use client";

import { useState } from "react";
import Link from "next/link";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Button } from "@/components/ui/button";
import { MetaChip } from "@/components/ui/meta-chip";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, SelectRow } from "./form-rows";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { BookingRequestRecord } from "@/lib/types/booking";
import type { RespondToRequestInput } from "@/lib/validation/schemas";

const QUOTE_OPTIONS = [
  { value: -1, label: "No quote" },
  ...[100, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000].map((d) => ({
    value: d * 100,
    label: `$${d}`,
  })),
];

const DEPOSIT_OPTIONS = [
  { value: 0, label: "No deposit" },
  ...[50, 100, 150, 200, 300, 500].map((d) => ({ value: d * 100, label: `$${d}` })),
];

const DURATION_OPTIONS = [60, 120, 180, 240, 300, 360].map((m) => ({
  value: m,
  label: `${m / 60}h`,
}));

interface TimeDraft {
  start: string; // datetime-local value
  end: string;
}

function fmtChip(value: string | null): string | null {
  return value ? value.replace(/-/g, " ") : null;
}

interface RequestDetailPanelProps {
  request: BookingRequestRecord | null;
  onClose: () => void;
  onRespond: (input: RespondToRequestInput) => Promise<boolean>;
  responding: boolean;
  error: string | null;
  /** Opening form state — the bell's peek jumps straight to accept/decline. */
  initialMode?: "view" | "accept" | "decline";
}

export function RequestDetailPanel({
  request,
  onClose,
  onRespond,
  responding,
  error,
  initialMode = "view",
}: RequestDetailPanelProps) {
  const [mode, setMode] = useState<"view" | "accept" | "decline">(initialMode);
  const [message, setMessage] = useState("");
  const [quoteMin, setQuoteMin] = useState(-1);
  const [quoteMax, setQuoteMax] = useState(-1);
  const [deposit, setDeposit] = useState(0);
  const [scheduling, setScheduling] = useState<"propose" | "open_calendar">("propose");
  const [duration, setDuration] = useState(180);
  const [times, setTimes] = useState<TimeDraft[]>([{ start: "", end: "" }]);

  const reset = () => {
    setMode("view");
    setMessage("");
    setQuoteMin(-1);
    setQuoteMax(-1);
    setDeposit(0);
    setScheduling("propose");
    setDuration(180);
    setTimes([{ start: "", end: "" }]);
  };

  const close = () => {
    reset();
    onClose();
  };

  if (!request) return null;
  const status = effectiveRequestStatus(request, new Date());

  const validTimes = times.filter((t) => t.start && t.end);

  const submitAccept = async () => {
    const ok = await onRespond({
      action: "accept",
      requestId: request.id,
      responseMessage: message || undefined,
      quoteMinCents: quoteMin >= 0 ? quoteMin : undefined,
      quoteMaxCents: quoteMax >= 0 ? quoteMax : undefined,
      depositCents: deposit > 0 ? deposit : undefined,
      schedulingMode: scheduling,
      sessionDurationMin: scheduling === "open_calendar" ? duration : undefined,
      proposedTimes:
        scheduling === "propose"
          ? validTimes.map((t) => ({
              startAt: new Date(t.start).toISOString(),
              endAt: new Date(t.end).toISOString(),
            }))
          : [],
    });
    if (ok) reset();
  };

  const submitDecline = async () => {
    const ok = await onRespond({
      action: "decline",
      requestId: request.id,
      responseMessage: message || undefined,
    });
    if (ok) reset();
  };

  return (
    <SlideOverPanel open={Boolean(request)} onClose={close} title="Booking Request">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="text-[13px] font-medium text-ink-black dark:text-ink-cream">
            {request.customerName ?? "Customer"}
          </p>
          <p className="font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
          {request.preferredArtistName ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-rust">
              Requested: {request.preferredArtistName}
            </p>
          ) : null}
          {/* Always the current user's own thread with the customer — a front-desk
              operator gets their own conversation, not the artist's. */}
          <Link
            href={`/messages?to=${request.customerId}`}
            className="mt-2 inline-block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-rust transition-colors hover:text-ink-rust/70"
          >
            Message {request.customerName ?? "client"} →
          </Link>
        </div>

        <p className="text-[13px] leading-relaxed text-ink-black/80 dark:text-ink-cream/80">
          {request.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {request.placement ? <MetaChip size="md">{request.placement}</MetaChip> : null}
          {fmtChip(request.sizeCategory) ? <MetaChip size="md">{fmtChip(request.sizeCategory)}</MetaChip> : null}
          {fmtChip(request.budgetRange) ? <MetaChip size="md">{fmtChip(request.budgetRange)}</MetaChip> : null}
          {request.isColor !== null ? <MetaChip size="md">{request.isColor ? "color" : "black & grey"}</MetaChip> : null}
          {request.isMultiSession ? <MetaChip size="md">multi-session</MetaChip> : null}
        </div>

        {request.referenceImageUrls.length > 0 ? (
          <div>
            <FieldLabel>References</FieldLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {request.referenceImageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="Reference" className="h-20 w-20 rounded-lg object-cover" />
              ))}
            </div>
          </div>
        ) : null}

        {status !== "pending" ? (
          <div className="rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
            <FieldLabel>Status: {status}</FieldLabel>
            {request.isMultiSession ? (
              <p className="mt-1 font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                Multi-session project{request.estimatedSessions ? ` · ~${request.estimatedSessions} sessions` : ""}
              </p>
            ) : null}
            {request.responseMessage ? (
              <p className="mt-2 text-[12px] text-ink-black/60 dark:text-ink-cream/60">
                {request.responseMessage}
              </p>
            ) : null}
            {request.quoteMinCents !== null || request.quoteMaxCents !== null ? (
              <p className="mt-1 font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                Quote: ${((request.quoteMinCents ?? request.quoteMaxCents ?? 0) / 100).toFixed(0)}
                {request.quoteMaxCents !== null && request.quoteMinCents !== null
                  ? ` - $${(request.quoteMaxCents / 100).toFixed(0)}`
                  : ""}
              </p>
            ) : null}
          </div>
        ) : mode === "view" ? (
          <div className="flex gap-2">
            <Button variant="ink" className="flex-1 min-h-[44px]" onClick={() => setMode("accept")}>
              Accept
            </Button>
            <Button
              variant="ink-outline"
              className="flex-1 min-h-[44px]"
              onClick={() => setMode("decline")}
            >
              Decline
            </Button>
          </div>
        ) : mode === "decline" ? (
          <div className="flex flex-col gap-3">
            <Textarea
              label="Reason (optional, sent to the client)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Not a fit for my style right now..."
              rows={3}
            />
            {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button
                variant="ink-red"
                className="flex-1 min-h-[44px]"
                disabled={responding}
                onClick={() => void submitDecline()}
              >
                {responding ? "Declining..." : "Confirm decline"}
              </Button>
              <Button variant="ink-outline" className="min-h-[44px]" onClick={() => setMode("view")}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Textarea
              label="Message to client (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Love this idea — here's how I'd approach it..."
              rows={3}
            />
            <SelectRow
              label="Quote from"
              value={quoteMin}
              options={QUOTE_OPTIONS}
              onChange={(v) => setQuoteMin(Number(v))}
            />
            <SelectRow
              label="Quote to"
              value={quoteMax}
              options={QUOTE_OPTIONS}
              onChange={(v) => setQuoteMax(Number(v))}
            />
            <SelectRow
              label="Deposit"
              value={deposit}
              options={DEPOSIT_OPTIONS}
              onChange={(v) => setDeposit(Number(v))}
            />
            <SelectRow
              label="Scheduling"
              value={scheduling}
              options={[
                { value: "propose", label: "I offer times" },
                { value: "open_calendar", label: "Open my calendar" },
              ]}
              onChange={(v) => setScheduling(v as "propose" | "open_calendar")}
            />

            {scheduling === "open_calendar" ? (
              <SelectRow
                label="Session length"
                value={duration}
                options={DURATION_OPTIONS}
                onChange={(v) => setDuration(Number(v))}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <FieldLabel>Offered times (up to 3)</FieldLabel>
                {times.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={t.start}
                      onChange={(e) =>
                        setTimes((prev) => prev.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))
                      }
                      className="min-h-[44px] flex-1 rounded-lg border border-ink-black/[0.08] bg-transparent px-2 font-mono text-[11px] dark:border-ink-cream/[0.08]"
                    />
                    <input
                      type="datetime-local"
                      value={t.end}
                      onChange={(e) =>
                        setTimes((prev) => prev.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))
                      }
                      className="min-h-[44px] flex-1 rounded-lg border border-ink-black/[0.08] bg-transparent px-2 font-mono text-[11px] dark:border-ink-cream/[0.08]"
                    />
                    {times.length > 1 ? (
                      <button
                        type="button"
                        aria-label="Remove time"
                        onClick={() => setTimes((prev) => prev.filter((_, j) => j !== i))}
                        className="min-h-[44px] px-2 font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
                {times.length < 3 ? (
                  <button
                    type="button"
                    onClick={() => setTimes((prev) => [...prev, { start: "", end: "" }])}
                    className="self-start font-mono text-[11px] text-ink-rust"
                  >
                    + Add another time
                  </button>
                ) : null}
              </div>
            )}

            {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button
                variant="ink"
                className="flex-1 min-h-[44px]"
                disabled={responding || (scheduling === "propose" && validTimes.length === 0)}
                onClick={() => void submitAccept()}
              >
                {responding ? "Sending..." : "Send acceptance"}
              </Button>
              <Button variant="ink-outline" className="min-h-[44px]" onClick={() => setMode("view")}>
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
}
