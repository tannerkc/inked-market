"use client";

import { useEffect, useMemo, useState } from "react";
import type { Slot } from "@/lib/booking/availability";
import { zonedParts } from "@/lib/booking/tz";

interface SlotPickerProps {
  artistId: string;
  durationMin: number;
  onPick: (slot: Slot) => void;
  disabled?: boolean;
}

function fmtDay(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

export function SlotPicker({ artistId, durationMin, onPick, disabled }: SlotPickerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [timezone, setTimezone] = useState("America/New_York");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const from = new Date().toISOString().slice(0, 10);
      const to = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
      const res = await fetch(
        `/api/booking/slots?artistId=${artistId}&durationMin=${durationMin}&from=${from}&to=${to}`
      );
      if (cancelled) return;
      if (res.ok) {
        const body = (await res.json()) as { slots: Slot[]; timezone: string };
        if (!cancelled) {
          setSlots(body.slots);
          setTimezone(body.timezone);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [artistId, durationMin]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const p = zonedParts(new Date(s.startAt), timezone);
      const day = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return map;
  }, [slots, timezone]);

  const days = useMemo(() => Array.from(byDay.keys()).sort(), [byDay]);
  const activeDay = selectedDay ?? days[0] ?? null;

  if (loading) {
    return <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">Loading times...</p>;
  }
  if (days.length === 0) {
    return (
      <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">
        No open times in the next 30 days.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`min-h-[44px] shrink-0 rounded-full border px-4 font-mono text-[11px] ${
              day === activeDay
                ? "border-ink-rust text-ink-rust"
                : "border-ink-black/[0.08] text-ink-black/60 dark:border-ink-cream/[0.08] dark:text-ink-cream/60"
            }`}
          >
            {fmtDay(day)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(activeDay ? byDay.get(activeDay) ?? [] : []).map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            disabled={disabled}
            onClick={() => onPick(slot)}
            className="min-h-[44px] rounded-lg border border-ink-black/[0.08] font-mono text-[11px] transition-colors hover:border-ink-rust disabled:opacity-40 dark:border-ink-cream/[0.08]"
          >
            {fmtTime(slot.startAt, timezone)}
          </button>
        ))}
      </div>
    </div>
  );
}
