"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { enabledBookingFlows, type BookingCta, type BookingFlowKind } from "@/lib/booking/flows";
import type { BookableRosterArtist } from "@/lib/data/supabase-booking";
import type { Slot } from "@/lib/booking/availability";
import type { ConsultLocation, FlashItem } from "@/lib/types/booking";
import { bookConsultation, bookFlash } from "@/app/book/actions";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { MetaChip } from "@/components/ui/meta-chip";
import { BookingRequestFlow } from "./request-flow";
import { FlowHeader } from "./flow-header";
import { SignInGate } from "./sign-in-gate";
import { SlotPicker } from "./slot-picker";

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
  entity: { artistId?: string; studioId?: string };
  entityName: string;
  settings: BookingFlowSettings | null;
  flashItems: FlashItem[];
  cta: BookingCta;
  avatarUrl?: string;
  /** Studio targets only: roster artists pickable on the request form. */
  roster?: BookableRosterArtist[];
}

const FLOW_ICONS: Record<BookingFlowKind, React.ReactNode> = {
  custom: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 3.5l2 2L7 15l-3.5 1 1-3.5 10-9z" />
    </svg>
  ),
  consultation: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 10a7 7 0 01-10.4 6.1L3 17l.9-3.6A7 7 0 1117 10z" />
    </svg>
  ),
  flash: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 2L4 11.5h5L9 18l7-9.5h-5L11 2z" />
    </svg>
  ),
};

const FLOW_TITLES: Record<BookingFlowKind, string> = {
  custom: "Custom work",
  consultation: "Consultation",
  flash: "Flash",
};

function fmtSlot(slot: Slot): string {
  const start = new Date(slot.startAt);
  return `${start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function fmtPrice(cents: number): string {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(0)}`;
}

function EntityHeader({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <header className="flex items-center gap-4">
      <InitialsAvatar name={name} imageUrl={avatarUrl} size="lg" />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-black/35 dark:text-ink-cream/35">
          Booking with
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-ink-black dark:text-ink-cream">
          {name}
        </h1>
      </div>
    </header>
  );
}

/** Mono meta chips: "45 min · $50 · Virtual" rendered as discrete tokens. */
function FactChips({ facts }: { facts: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {facts.map((f) => (
        <MetaChip key={f} size="md">
          {f}
        </MetaChip>
      ))}
    </div>
  );
}

/** Slot picker + inline confirm + success, shared by consult and flash branches. */
function DirectBookingBranch({
  entity,
  durationMin,
  facts,
  reassurance,
  onConfirm,
}: {
  entity: { artistId?: string; studioId?: string };
  durationMin: number;
  facts: string[];
  reassurance: string;
  onConfirm: (slot: Slot) => Promise<{ success: boolean; error?: string; checkoutUrl?: string }>;
}) {
  const { user, setViewMode } = useAuth();
  const [selected, setSelected] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  if (booked) {
    return (
      <div className="space-y-5">
        <FlowHeader icon="check" title="You are booked">
          You are on the calendar. Details and any updates live in your dashboard.
        </FlowHeader>
        <Button
          variant="ink"
          as={Link}
          href="/dashboard"
          onClick={() => setViewMode("customer")}
          className="min-h-[44px]"
        >
          Go to dashboard
        </Button>
      </div>
    );
  }
  if (!user) {
    return <SignInGate intent="booking" />;
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
      <FactChips facts={facts} />
      {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
      {selected ? (
        <div className="space-y-4 rounded-[14px] border border-ink-black/[0.08] p-5 dark:border-ink-cream/[0.08]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-rust">
              Your time
            </p>
            <p className="mt-1 text-lg font-medium tracking-tight text-ink-black dark:text-ink-cream">
              {fmtSlot(selected)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ink"
              className="min-h-[44px] flex-1"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {busy ? "Booking..." : "Confirm booking"}
            </Button>
            <Button
              variant="ink-outline"
              className="min-h-[44px]"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Change time
            </Button>
          </div>
          <p className="font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
            {reassurance}
          </p>
        </div>
      ) : (
        <SlotPicker entity={entity} durationMin={durationMin} onPick={setSelected} disabled={busy} />
      )}
    </div>
  );
}

export function BookingFlow({
  entity,
  entityName,
  settings,
  flashItems,
  cta,
  avatarUrl,
  roster,
}: BookingFlowProps) {
  // Flash is artist-anchored; studio targets offer requests + consults only.
  const allFlows = settings ? enabledBookingFlows(settings) : [];
  const flows = entity.studioId ? allFlows.filter((f) => f !== "flash") : allFlows;
  const [kind, setKind] = useState<BookingFlowKind | null>(
    flows.length === 1 ? (flows[0] ?? null) : null
  );
  const [flashItem, setFlashItem] = useState<FlashItem | null>(null);

  if (cta.kind === "external") {
    return (
      <div className="space-y-6">
        <EntityHeader name={entityName} avatarUrl={avatarUrl} />
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          {entityName} takes bookings on {cta.domain}.
        </p>
        <Button
          variant="ink"
          as="a"
          href={cta.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Open {cta.domain}
        </Button>
      </div>
    );
  }

  if (cta.kind !== "inbuilt" || !settings || flows.length === 0) {
    return (
      <div className="space-y-6">
        <EntityHeader name={entityName} avatarUrl={avatarUrl} />
        <p className="text-[14px] text-ink-black/60 dark:text-ink-cream/60">
          {entityName} is not taking bookings right now.
        </p>
      </div>
    );
  }

  const consultLocation = settings.consultLocation === "virtual" ? "Virtual" : "In person";
  const flowMeta: Record<BookingFlowKind, string> = {
    custom: "Free to ask · no payment until you approve a quote",
    consultation: `${settings.consultDurationMin} min · ${fmtPrice(settings.consultPriceCents)} · ${consultLocation}`,
    flash: flashItems.length > 0 ? `${flashItems.length} design${flashItems.length === 1 ? "" : "s"} · book instantly` : "Ready-to-go designs, book instantly",
  };

  return (
    <div className="space-y-8">
      <EntityHeader name={entityName} avatarUrl={avatarUrl} />

      {kind === null ? (
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-black/35 dark:text-ink-cream/35">
            How do you want to start?
          </p>
          <div className="flex flex-col gap-3">
            {flows.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setKind(f)}
                className="group flex min-h-[44px] items-center gap-4 rounded-[14px] border border-ink-black/[0.08] p-5 text-left transition-colors hover:border-ink-rust dark:border-ink-cream/[0.08]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-black/[0.08] text-ink-black/50 transition-colors group-hover:border-ink-rust/30 group-hover:text-ink-rust dark:border-ink-cream/[0.08] dark:text-ink-cream/50">
                  {FLOW_ICONS[f]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium tracking-tight text-ink-black dark:text-ink-cream">
                    {FLOW_TITLES[f]}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                    {flowMeta[f]}
                  </span>
                </span>
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4 shrink-0 text-ink-black/25 transition-all group-hover:translate-x-0.5 group-hover:text-ink-rust dark:text-ink-cream/25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 3.5L10.5 8 6 12.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {flows.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setKind(null);
                setFlashItem(null);
              }}
              className="flex min-h-[44px] items-center gap-1.5 font-mono text-[11px] text-ink-black/40 transition-colors hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10 3.5L5.5 8l4.5 4.5" />
              </svg>
              All booking options
            </button>
          ) : null}

          {kind === "custom" ? (
            <BookingRequestFlow
              entity={entity}
              entityName={entityName}
              acceptingRequests
              embedded
              roster={roster}
            />
          ) : null}

          {kind === "consultation" ? (
            <DirectBookingBranch
              entity={entity}
              durationMin={settings.consultDurationMin}
              facts={[
                `${settings.consultDurationMin} min`,
                fmtPrice(settings.consultPriceCents),
                consultLocation,
              ]}
              reassurance={
                settings.consultPriceCents === 0
                  ? "Free — nothing to pay today"
                  : "If a deposit is due, secure checkout comes next"
              }
              onConfirm={(slot) =>
                bookConsultation({
                  artistId: entity.artistId,
                  studioId: entity.studioId,
                  startAt: slot.startAt,
                  endAt: slot.endAt,
                })
              }
            />
          ) : null}

          {kind === "flash" && flashItem === null ? (
            flashItems.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-ink-black/[0.12] p-5 text-center dark:border-ink-cream/[0.12]">
                <p className="text-[13px] text-ink-black/50 dark:text-ink-cream/50">
                  No flash available right now — check back soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-black/35 dark:text-ink-cream/35">
                  Pick a design
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {flashItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFlashItem(item)}
                      className="group rounded-[14px] border border-ink-black/[0.08] p-2 text-left transition-colors hover:border-ink-rust dark:border-ink-cream/[0.08]"
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {item.oneOff ? (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-ink-black/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-cream">
                            1 of 1
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 truncate text-[12px] font-medium text-ink-black/80 dark:text-ink-cream/80">
                        {item.title}
                      </p>
                      <p className="font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                        {fmtPrice(item.priceCents)} · {item.durationMin / 60}h
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : null}

          {kind === "flash" && flashItem !== null ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setFlashItem(null)}
                className="flex min-h-[44px] items-center gap-1.5 font-mono text-[11px] text-ink-black/40 transition-colors hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10 3.5L5.5 8l4.5 4.5" />
                </svg>
                All flash
              </button>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flashItem.imageUrl}
                  alt={flashItem.title}
                  className="h-16 w-16 rounded-xl border border-ink-black/[0.06] object-cover dark:border-ink-cream/[0.08]"
                />
                <div>
                  <p className="text-[14px] font-medium tracking-tight text-ink-black dark:text-ink-cream">
                    {flashItem.title}
                  </p>
                  <p className="font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
                    Pick a time below
                  </p>
                </div>
              </div>
              <DirectBookingBranch
                entity={entity}
                durationMin={flashItem.durationMin}
                facts={[
                  fmtPrice(flashItem.priceCents),
                  `${flashItem.durationMin / 60}h session`,
                  ...(flashItem.oneOff ? ["1 of 1"] : []),
                ]}
                reassurance="If a deposit is due, secure checkout comes next"
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
