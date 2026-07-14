"use client";

import { useState } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, SelectRow } from "./form-rows";
import { frontDeskCreateAppointment } from "@/app/book/front-desk-actions";
import { useFrontDesk } from "./use-front-desk";

const WALK_IN = "__walk_in__";

const DURATION_OPTIONS = [30, 60, 90, 120, 180, 240, 300, 360].map((m) => ({
  value: m,
  label: m < 60 ? `${m} min` : `${m / 60}h`,
}));

interface FrontDeskPanelProps {
  open: boolean;
  onClose: () => void;
}

export function FrontDeskPanel({ open, onClose }: FrontDeskPanelProps) {
  const { grantedArtists, loading } = useFrontDesk();
  const [target, setTarget] = useState(WALK_IN);
  const [customerName, setCustomerName] = useState("");
  const [type, setType] = useState<"session" | "consultation">("session");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const isWalkIn = target === WALK_IN;
  const canSubmit = Boolean(customerName.trim() && start && !busy);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setDone(null);
    const result = await frontDeskCreateAppointment({
      artistId: isWalkIn ? undefined : target,
      walkIn: isWalkIn,
      customerName: customerName.trim(),
      type: isWalkIn ? "walk_in" : type,
      startAt: new Date(start).toISOString(),
      durationMin: duration,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    if (result.success) {
      setDone(`${customerName.trim()} is on the books.`);
      setCustomerName("");
      setStart("");
      setNotes("");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Front Desk">
      <div className="flex flex-col gap-5 p-4">
        {loading ? (
          <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">Loading...</p>
        ) : (
          <>
            <SelectRow
              label="Book with"
              value={target}
              options={[
                { value: WALK_IN, label: "Walk-in (studio)" },
                ...grantedArtists.map((a) => ({ value: a.id, label: a.name })),
              ]}
              onChange={setTarget}
            />
            {grantedArtists.length === 0 ? (
              <p className="text-[10px] text-ink-black/30 dark:text-ink-cream/30">
                Artists appear here once they grant front-desk booking in their settings.
              </p>
            ) : null}

            <Input
              label="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in customer"
              maxLength={80}
            />

            {isWalkIn ? null : (
              <SelectRow
                label="Type"
                value={type}
                options={[
                  { value: "session", label: "Tattoo session" },
                  { value: "consultation", label: "Consultation" },
                ]}
                onChange={(v) => setType(v as "session" | "consultation")}
              />
            )}

            <div className="flex flex-col gap-2">
              <FieldLabel>When</FieldLabel>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="min-h-[44px] rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
              />
            </div>

            <SelectRow
              label="Duration"
              value={duration}
              options={DURATION_OPTIONS}
              onChange={(v) => setDuration(Number(v))}
            />

            <Input
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Small script piece, forearm"
              maxLength={500}
            />

            {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
            {done ? (
              <p className="text-[12px] text-ink-black/60 dark:text-ink-cream/60">{done}</p>
            ) : null}

            <Button
              variant="ink"
              className="min-h-[44px]"
              disabled={!canSubmit}
              onClick={() => void submit()}
            >
              {busy ? "Booking..." : "Add to the books"}
            </Button>
          </>
        )}
      </div>
    </SlideOverPanel>
  );
}
