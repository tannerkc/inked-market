"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Local draft that re-syncs when the upstream value changes — implemented as
 * a render-phase adjustment (React docs pattern), not an effect, so commits
 * never cascade renders (react-hooks/set-state-in-effect).
 */
function useDraftValue(value: string): [string, (v: string) => void] {
  const [local, setLocal] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setLocal(value);
  }
  return [local, setLocal];
}

/** Chrome-styled form primitives for the builder Content panel (dark shell). */

export const PANEL_SELECT_CLASS =
  "w-full rounded-lg border border-chrome-border bg-chrome-surface px-2.5 py-2 text-xs text-chrome-text-primary outline-none transition-colors focus:border-ink-red";

export function PanelInput({
  label,
  value,
  onCommit,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useDraftValue(value);

  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {label}
      </span>
      <input
        type={type}
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onCommit(local);
        }}
        className="w-full rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
      />
    </label>
  );
}

export function PanelTextarea({
  label,
  value,
  onCommit,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [local, setLocal] = useDraftValue(value);

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {label}
      </span>
      <textarea
        rows={rows}
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onCommit(local);
        }}
        className="w-full resize-y rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs leading-relaxed text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
      />
    </label>
  );
}

/** Autosave feedback: flash a "Saved" tick for 1.6s after each commit. */
export function useSavedFlash(): { saved: boolean; flash: () => void } {
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback(() => {
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 1600);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return { saved, flash };
}
