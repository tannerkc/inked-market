"use client";

import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { BuilderMode } from "@/lib/types/builder";

const TOUR_SEEN_PREFIX = "inked-builder-tour-";

interface TourStep {
  title: string;
  body: string;
  /** Fixed-position classes placing the card near the UI it describes. */
  position: string;
  /** Caret placement + border sides for the rotated-square pointer. */
  caret?: string;
}

const SAVE_STEP: TourStep = {
  title: "Save, preview, publish",
  body: "Save Draft keeps your work. Preview shows the exact visitor view. Publish puts your page live.",
  position: "right-5 top-16",
  caret: "-top-1.5 right-12 border-t border-l",
};

const TOUR_STEPS: Record<BuilderMode, TourStep[]> = {
  inline: [
    {
      title: "Click any section",
      body: "Everything on this page is editable. Click a section to style it or change what it shows.",
      position: "left-[calc(50%-160px)] top-[28%]",
    },
    {
      title: "Your toolkit lives below",
      body: "Theme, fonts, effects, and device preview sit in the bottom toolbar, next to your Content panel.",
      position: "bottom-24 left-[calc(50%-160px)]",
      caret: "-bottom-1.5 left-[calc(50%-6px)] border-b border-r",
    },
    SAVE_STEP,
  ],
  split: [
    {
      title: "Style controls on the left",
      body: "Every design option is grouped into tabs in this panel. Changes apply as you make them.",
      position: "left-[392px] top-24",
      caret: "-left-1.5 top-8 border-b border-l",
    },
    {
      title: "Live preview on the right",
      body: "This is your real page with your real content. It updates instantly as you edit.",
      position: "left-[calc(50%+40px)] top-[30%]",
    },
    SAVE_STEP,
  ],
};

function hasSeenTour(mode: BuilderMode) {
  try {
    return localStorage.getItem(TOUR_SEEN_PREFIX + mode) !== null;
  } catch {
    return true;
  }
}

/**
 * Brief three-step coach-mark tour shown on first entry to each editor mode.
 * Skippable via the Skip button or Escape; dismissal persists per mode.
 */
export function BuilderTutorial({ mode }: { mode: BuilderMode }) {
  const steps = TOUR_STEPS[mode];
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(() => !hasSeenTour(mode));

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(TOUR_SEEN_PREFIX + mode, "done");
    } catch {
      // localStorage may be unavailable
    }
  }, [mode]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  const current = steps[step];
  if (!visible || !current) return null;

  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[260]"
      role="dialog"
      aria-modal="true"
      aria-label="Builder tutorial"
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        key={step}
        className={cn(
          "absolute w-[320px] rounded-2xl border border-chrome-muted bg-chrome-surface/97 shadow-2xl backdrop-blur-xl [animation:popover-in_200ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]",
          current.position,
        )}
      >
        {current.caret ? (
          <div
            aria-hidden
            className={cn(
              "absolute h-3 w-3 rotate-45 border-chrome-muted bg-chrome-surface",
              current.caret,
            )}
          />
        ) : null}
        {/* Clip wrapper so the watermark numeral and accent line respect the card radius */}
        <div className="relative overflow-hidden rounded-2xl p-5">
          <div
            aria-hidden
            className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-ink-red/60 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 right-2 select-none font-[family-name:var(--font-permanent-marker)] text-[56px] leading-none text-ink-red/15"
          >
            {step + 1}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-red">
            Quick tour
          </span>
          <h3 className="mt-1.5 pr-10 text-[15px] font-semibold tracking-tight text-white">
            {current.title}
          </h3>
          <p className="mt-1.5 pr-6 text-xs leading-relaxed text-chrome-text-secondary">
            {current.body}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-chrome-border pt-3.5">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-medium text-chrome-text-dim transition-colors hover:text-white"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-1.5" aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={s.title}
                  className={cn(
                    "h-1 rounded-full",
                    i === step ? "w-4 bg-ink-red" : "w-1 bg-chrome-muted",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              autoFocus
              onClick={isLast ? dismiss : () => setStep(step + 1)}
              className="rounded-lg border border-ink-red bg-ink-red px-3.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-ink-red/25 transition-colors hover:brightness-110"
            >
              {isLast ? "Start editing" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
