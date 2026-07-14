"use client";

import { useState } from "react";
import type { AvailabilityOverride } from "@/lib/types/booking";

interface BlockedDatesEditorProps {
  blockedDates: AvailabilityOverride[];
  onAdd: (date: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
}

export function BlockedDatesEditor({ blockedDates, onAdd, onRemove }: BlockedDatesEditorProps) {
  const [date, setDate] = useState("");

  return (
    <div className="mt-4 rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
      <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
        Blocked dates
      </p>
      <p className="mb-3 text-[10px] text-ink-black/25 dark:text-ink-cream/25">
        Days off, conventions, guest spots — no bookings on these days
      </p>
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-[44px] flex-1 rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
        />
        <button
          type="button"
          onClick={() => {
            void onAdd(date);
            setDate("");
          }}
          disabled={!date}
          className="min-h-[44px] rounded-lg border border-ink-black/[0.08] px-4 font-mono text-[12px] font-medium disabled:opacity-40 dark:border-ink-cream/[0.08]"
        >
          Block
        </button>
      </div>
      {blockedDates.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1">
          {blockedDates.map((o) => (
            <li key={o.id} className="flex min-h-[44px] items-center justify-between">
              <span className="font-mono text-[12px] text-ink-black/70 dark:text-ink-cream/70">
                {o.date}
              </span>
              <button
                type="button"
                onClick={() => void onRemove(o.id)}
                aria-label={`Unblock ${o.date}`}
                className="min-h-[44px] px-3 font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
