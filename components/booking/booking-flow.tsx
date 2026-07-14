"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { enabledBookingFlows, type BookingFlowKind } from "@/lib/booking/flows";
import type { Slot } from "@/lib/booking/availability";
import type { ConsultLocation, FlashItem } from "@/lib/types/booking";
import { bookConsultation, bookFlash } from "@/app/book/actions";
import { BookingRequestFlow } from "./request-flow";
import { SlotPicker } from "./slot-picker";
import { FieldLabel } from "./form-rows";

interface BookingFlowSettings {
  acceptingBookings: boolean;
  customRequestsEnabled: boolean;
  consultationsEnabled: boolean;
  flashEnabled: boolean;
  consultDurationMin: number;
  consultPriceCents: number;
  consultLocation: ConsultLocation;
}

interface BookingFlowProps {
  artistId: string;
  artistName: string;
  settings: BookingFlowSettings | null;
  flashItems: FlashItem[];
}

const FLOW_COPY: Record<BookingFlowKind, { title: string; hint: string }> = {
  custom: { title: "Custom work", hint: "Send your idea for review and a quote" },
  consultation: { title: "Consultation", hint: "Talk it through before committing" },
  flash: { title: "Flash", hint: "Ready-to-go designs, book instantly" },
};

function fmtSlot(slot: Slot): string {
  const start = new Date(slot.startAt);
  return `${start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function fmtPrice(cents: number): string {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(0)}`;
}

/** Slot picker + inline confirm + success, shared by consult and flash branches. */
function DirectBookingBranch({
  artistId,
  durationMin,
  facts,
  onConfirm,
}: {
  artistId: string;
  durationMin: number;
  facts: string;
  onConfirm: (slot: Slot) => Promise<{ success: boolean; error?: string; checkoutUrl?: string }>;
}) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  if (booked) {
    return (
      <div className="space-y-4">
        <FieldLabel>Booked</FieldLabel>
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          You are on the calendar. Details are in your dashboard.
        </p>
        <Button variant="ink" as={Link} href="/dashboard">
          Go to dashboard
        </Button>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">Sign in to book.</p>
        <Button variant="ink" as={Link} href="/login">
          Sign in
        </Button>
      </div>
    );
  }

  const confirm = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const result = await onConfirm(selected);
    if (result.success && result.checkoutUrl) {
      // Deposit asked: straight to checkout; the return route lands on /dashboard.
      window.location.assign(result.checkoutUrl);
      return;
    }
    setBusy(false);
    if (result.success) setBooked(true);
    else {
      setError(result.error ?? "Something went wrong.");
      setSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">{facts}</p>
      {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
      {selected ? (
        <div className="space-y-3 rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
          <FieldLabel>{fmtSlot(selected)}</FieldLabel>
          <div className="flex gap-2">
            <Button
              variant="ink"
              className="min-h-[44px] flex-1"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {busy ? "Booking..." : "Confirm booking"}
            </Button>
            <Button variant="ink-outline" className="min-h-[44px]" onClick={() => setSelected(null)}>
              Change time
            </Button>
          </div>
        </div>
      ) : (
        <SlotPicker artistId={artistId} durationMin={durationMin} onPick={setSelected} disabled={busy} />
      )}
    </div>
  );
}

export function BookingFlow({ artistId, artistName, settings, flashItems }: BookingFlowProps) {
  const flows = settings ? enabledBookingFlows(settings) : [];
  const [kind, setKind] = useState<BookingFlowKind | null>(
    flows.length === 1 ? (flows[0] ?? null) : null
  );
  const [flashItem, setFlashItem] = useState<FlashItem | null>(null);

  if (!settings || flows.length === 0) {
    return (
      <p className="text-[14px] text-ink-black/60 dark:text-ink-cream/60">
        {artistName} is not taking bookings right now.
      </p>
    );
  }

  const consultLocation = settings.consultLocation === "virtual" ? "Virtual" : "In person";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Book with {artistName}</h1>

      {kind === null ? (
        <div className="flex flex-col gap-3">
          {flows.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setKind(f)}
              className="min-h-[44px] rounded-[14px] border border-ink-black/[0.08] p-4 text-left transition-colors hover:border-ink-rust dark:border-ink-cream/[0.08]"
            >
              <p className="font-mono text-[12px] font-medium text-ink-black/80 dark:text-ink-cream/80">
                {FLOW_COPY[f].title}
              </p>
              <p className="mt-1 text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                {f === "consultation"
                  ? `${settings.consultDurationMin} min · ${fmtPrice(settings.consultPriceCents)} · ${consultLocation}`
                  : FLOW_COPY[f].hint}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {flows.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setKind(null);
                setFlashItem(null);
              }}
              className="font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
            >
              Back to options
            </button>
          ) : null}

          {kind === "custom" ? (
            <BookingRequestFlow
              artistId={artistId}
              artistName={artistName}
              acceptingRequests
              embedded
            />
          ) : null}

          {kind === "consultation" ? (
            <DirectBookingBranch
              artistId={artistId}
              durationMin={settings.consultDurationMin}
              facts={`${settings.consultDurationMin} min consultation · ${fmtPrice(settings.consultPriceCents)} · ${consultLocation}`}
              onConfirm={(slot) =>
                bookConsultation({ artistId, startAt: slot.startAt, endAt: slot.endAt })
              }
            />
          ) : null}

          {kind === "flash" && flashItem === null ? (
            flashItems.length === 0 ? (
              <p className="text-[13px] text-ink-black/50 dark:text-ink-cream/50">
                No flash available right now — check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {flashItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFlashItem(item)}
                    className="rounded-[14px] border border-ink-black/[0.08] p-2 text-left transition-colors hover:border-ink-rust dark:border-ink-cream/[0.08]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <p className="mt-2 truncate text-[12px] font-medium text-ink-black/80 dark:text-ink-cream/80">
                      {item.title}
                    </p>
                    <p className="font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                      {fmtPrice(item.priceCents)} · {item.durationMin / 60}h
                      {item.oneOff ? " · 1 of 1" : ""}
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : null}

          {kind === "flash" && flashItem !== null ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFlashItem(null)}
                className="font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
              >
                Back to flash
              </button>
              <DirectBookingBranch
                artistId={artistId}
                durationMin={flashItem.durationMin}
                facts={`${flashItem.title} · ${fmtPrice(flashItem.priceCents)} · ${flashItem.durationMin / 60}h${flashItem.oneOff ? " · 1 of 1" : ""}`}
                onConfirm={(slot) =>
                  bookFlash({ flashItemId: flashItem.id, startAt: slot.startAt, endAt: slot.endAt })
                }
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
