"use client";

import { useRef, useState } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, SelectRow, ToggleRow } from "./form-rows";
import { useFlashManager } from "./use-flash-manager";

const DEPOSIT_OPTIONS = [
  { value: 0, label: "No deposit" },
  ...[50, 100, 150, 200, 300, 500].map((d) => ({ value: d * 100, label: `$${d}` })),
];

const DURATION_OPTIONS = [60, 120, 180, 240, 300, 360].map((m) => ({
  value: m,
  label: `${m / 60}h`,
}));

interface FlashManagerPanelProps {
  open: boolean;
  onClose: () => void;
}

export function FlashManagerPanel({ open, onClose }: FlashManagerPanelProps) {
  const { items, loading, add, toggleActive, remove, adding, error } = useFlashManager();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState(0);
  const [duration, setDuration] = useState(120);
  const [oneOff, setOneOff] = useState(false);

  const priceCents = Math.round(Number(price) * 100);
  const canAdd = Boolean(file && title.trim() && priceCents > 0 && !adding);

  const submit = async () => {
    if (!file) return;
    const ok = await add({
      file,
      title: title.trim(),
      priceCents,
      depositCents: deposit,
      durationMin: duration,
      oneOff,
    });
    if (ok) {
      setFile(null);
      setTitle("");
      setPrice("");
      setDeposit(0);
      setDuration(120);
      setOneOff(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Flash">
      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-4 rounded-[14px] border border-dashed border-ink-black/[0.08] p-4 dark:border-ink-cream/[0.08]">
          <FieldLabel>Add a piece</FieldLabel>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-[12px]"
          />
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Snake and dagger"
            maxLength={80}
          />
          <Input
            label="Price ($)"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="250"
          />
          <SelectRow
            label="Deposit"
            value={deposit}
            options={DEPOSIT_OPTIONS}
            onChange={(v) => setDeposit(Number(v))}
          />
          <SelectRow
            label="Session length"
            value={duration}
            options={DURATION_OPTIONS}
            onChange={(v) => setDuration(Number(v))}
          />
          <ToggleRow
            label="One of a kind"
            hint="Deactivates automatically once booked"
            checked={oneOff}
            onChange={setOneOff}
          />
          {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
          <Button
            variant="ink"
            className="min-h-[44px]"
            disabled={!canAdd}
            onClick={() => void submit()}
          >
            {adding ? "Adding..." : "Add flash"}
          </Button>
        </div>

        {loading ? (
          <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-[12px] text-ink-black/40 dark:text-ink-cream/40">
            No flash yet — add your first piece above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-[14px] border border-ink-black/[0.06] p-2 dark:border-ink-cream/[0.06]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
                    {item.title}
                  </p>
                  <p className="font-mono text-[10px] text-ink-black/40 dark:text-ink-cream/40">
                    ${(item.priceCents / 100).toFixed(0)} · {item.durationMin / 60}h
                    {item.oneOff ? " · 1 of 1" : ""}
                  </p>
                </div>
                <ToggleSwitch checked={item.active} onChange={() => void toggleActive(item)} />
                <button
                  type="button"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => void remove(item.id)}
                  className="min-h-[44px] px-2 font-mono text-[11px] text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SlideOverPanel>
  );
}
