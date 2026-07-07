"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { useSetupProgress, type SetupItem } from "@/lib/hooks/use-setup-progress";
import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";

function ProgressRing({ fraction }: { fraction: number }) {
  const r = 6;
  const c = 2 * Math.PI * r;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="-rotate-90">
      <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - fraction)}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
      />
    </svg>
  );
}

/**
 * Data-derived setup progress. Items jump the preview to their section and
 * open the Content panel at the matching group — the checklist and the empty
 * states share the same predicates, so they can never disagree.
 */
export function SetupProgressChip({ compact }: { compact?: boolean }) {
  const { openContentPanel } = useBuilder();
  const { items, requiredDone, requiredTotal, ready } = useSetupProgress();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleItem = (item: SetupItem) => {
    setOpen(false);
    scrollToBuilderSection(item.sectionId);
    if (!item.done && item.id !== "policies") openContentPanel(item.group);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
          ready
            ? "border-ink-sage/60 text-ink-sage hover:bg-ink-sage/10"
            : "border-chrome-border-hover text-chrome-text-secondary hover:border-chrome-text-dim hover:text-white",
        )}
      >
        <ProgressRing fraction={requiredTotal === 0 ? 1 : requiredDone / requiredTotal} />
        {ready ? (compact ? "Ready" : "Ready to publish") : `Setup ${requiredDone}/${requiredTotal}`}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Site setup checklist"
          className="absolute right-0 top-[calc(100%+6px)] z-[230] w-[240px] rounded-xl border border-chrome-muted bg-chrome-surface/97 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => handleItem(item)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-chrome-raised"
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  item.done
                    ? "border-ink-sage bg-ink-sage/15 text-ink-sage"
                    : "border-chrome-border-hover text-transparent",
                )}
                aria-hidden="true"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.5 4 8l4.5-5.5" />
                </svg>
              </span>
              <span
                className={cn(
                  "flex-1 text-[11px] font-medium",
                  item.done
                    ? "text-chrome-text-dim line-through decoration-chrome-text-faint"
                    : "text-chrome-text-light",
                )}
              >
                {item.label}
              </span>
              {item.optional ? (
                <span className="text-[9px] font-semibold uppercase tracking-wide text-chrome-text-faint">
                  Optional
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
