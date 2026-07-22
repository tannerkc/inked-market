"use client";

import { useEffect, useMemo, useState } from "react";
import type { Slot } from "@/lib/booking/availability";
import { zonedParts } from "@/lib/booking/tz";

interface SlotPickerProps {
  entity: { artistId?: string; studioId?: string };
  durationMin: number;
  onPick: (slot: Slot) => void;
  disabled?: boolean;
}

function dayParts(date: string): { weekday: string; date: string } {
  const d = new Date(`${date}T12:00:00Z`);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  };
}

function fmtTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

function tzLabel(timezone: string): string {
  return (timezone.split("/").pop() ?? timezone).replace(/_/g, " ");
}

export function SlotPicker({ entity, durationMin, onPick, disabled }: SlotPickerProps) {
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
      const target = entity.artistId
        ? `artistId=${entity.artistId}`
        : `studioId=${entity.studioId ?? ""}`;
      const res = await fetch(
        `/api/booking/slots?${target}&durationMin=${durationMin}&from=${from}&to=${to}`
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
  }, [entity.artistId, entity.studioId, durationMin]);

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
    return (
      <div className="animate-pulse space-y-3" aria-label="Loading open times">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[52px] w-16 shrink-0 rounded-2xl bg-ink-black/[0.05] dark:bg-ink-cream/[0.06]"
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-ink-black/[0.05] dark:bg-ink-cream/[0.06]" />
          ))}
        </div>
      </div>
    );
  }
  if (days.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-ink-black/[0.12] p-5 text-center dark:border-ink-cream/[0.12]">
        <p className="text-[13px] text-ink-black/50 dark:text-ink-cream/50">
          No open times in the next 30 days.
        </p>
        <p className="mt-1 font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
          Check back soon — the calendar opens on a rolling basis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const p = dayParts(day);
          const active = day === activeDay;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              aria-pressed={active}
              className={`min-h-[52px] shrink-0 rounded-2xl border px-4 py-2 text-center transition-colors ${
                active
                  ? "border-ink-black bg-ink-black text-ink-cream dark:border-ink-cream dark:bg-ink-cream dark:text-ink-black"
                  : "border-ink-black/[0.08] text-ink-black/60 hover:border-ink-black/30 dark:border-ink-cream/[0.08] dark:text-ink-cream/60 dark:hover:border-ink-cream/30"
              }`}
            >
              <span
                className={`block font-mono text-[9px] uppercase tracking-[0.15em] ${
                  active ? "opacity-60" : "opacity-50"
                }`}
              >
                {p.weekday}
              </span>
              <span className="block font-mono text-[12px] font-medium">{p.date}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(activeDay ? byDay.get(activeDay) ?? [] : []).map((slot) => (
          <button
            key={slot.startAt}
            type="button"
            disabled={disabled}
            onClick={() => onPick(slot)}
            className="min-h-[44px] rounded-lg border border-ink-black/[0.08] font-mono text-[11px] text-ink-black/70 transition-colors hover:border-ink-rust hover:text-ink-rust disabled:opacity-40 dark:border-ink-cream/[0.08] dark:text-ink-cream/70 dark:hover:border-ink-rust dark:hover:text-ink-rust"
          >
            {fmtTime(slot.startAt, timezone)}
          </button>
        ))}
      </div>
      <p className="font-mono text-[10px] text-ink-black/25 dark:text-ink-cream/25">
        Times shown in {tzLabel(timezone)} time
      </p>
    </div>
  );
}
