"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/types";

interface OnboardingBannerProps {
  title: string;
  subtitle: string;
  progress: number;
  /** Live checklist — renders step chips; incomplete steps become buttons when onStepClick is set. */
  steps?: ChecklistItem[];
  onStepClick?: (id: string) => void;
  onDismiss?: () => void;
  className?: string;
}

const STORAGE_KEY = "inked-onboarding-banner-dismissed";

function CheckIcon() {
  return (
    <svg
      className="w-3 h-3 text-ink-sage"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const OnboardingBanner = React.forwardRef<HTMLDivElement, OnboardingBannerProps>(
  ({ title, subtitle, progress, steps, onStepClick, onDismiss, className, ...props }, ref) => {
    const [dismissed, setDismissed] = React.useState(false);

    React.useEffect(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "true") setDismissed(true);
      } catch { /* noop */ }
    }, []);

    // All done or dismissed — the nudge has served its purpose.
    if (dismissed || progress >= 1) return null;

    const handleDismiss = () => {
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* noop */ }
      setDismissed(true);
      onDismiss?.();
    };

    const completed = steps?.filter((s) => s.completed).length ?? 0;

    return (
      <div
        ref={ref}
        className={cn(
          "relative p-5 rounded-2xl overflow-hidden",
          "border border-ink-black/[0.08] dark:border-ink-cream/[0.08]",
          "bg-gradient-to-br from-ink-rust/[0.05] via-transparent to-ink-sage/[0.07]",
          "dark:from-ink-red/[0.06] dark:via-transparent dark:to-ink-rust/[0.06]",
          className
        )}
        {...props}
      >
        <button
          onClick={handleDismiss}
          aria-label="Dismiss setup checklist"
          className="absolute top-3.5 right-3.5 p-1 cursor-pointer transition-colors text-ink-black/45 hover:text-ink-black/70 dark:text-ink-cream/45 dark:hover:text-ink-cream/70"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5 mb-1 pr-8">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-black/60 dark:text-ink-cream/60">
            {title}
          </p>
          {steps && steps.length > 0 && (
            <span className="font-mono text-[9px] tracking-[0.1em] px-2 py-0.5 rounded-full border border-ink-rust/25 bg-ink-rust/[0.06] text-ink-rust dark:border-ink-red/30 dark:bg-ink-red/[0.08] dark:text-ink-red">
              {completed}/{steps.length}
            </span>
          )}
        </div>
        <p className="text-[12px] pr-8 text-ink-black/60 dark:text-ink-cream/60">
          {subtitle}
        </p>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Studio setup progress"
          className="h-1.5 rounded-full mt-3.5 bg-ink-black/[0.06] dark:bg-ink-cream/[0.08]"
        >
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-ink-rust to-ink-sage dark:from-ink-red dark:to-ink-rust"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {steps && steps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {steps.map((step) =>
              step.completed ? (
                <span
                  key={step.id}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium border-ink-sage/30 bg-ink-sage/[0.08] text-ink-black/70 dark:border-ink-sage/40 dark:bg-ink-sage/[0.14] dark:text-ink-cream/70"
                >
                  <CheckIcon />
                  {step.label}
                  <span className="sr-only">(done)</span>
                </span>
              ) : onStepClick ? (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium cursor-pointer transition-colors border-ink-black/[0.14] text-ink-black/70 hover:border-ink-rust/50 hover:text-ink-rust dark:border-ink-cream/[0.16] dark:text-ink-cream/70 dark:hover:border-ink-red/50 dark:hover:text-ink-red"
                >
                  {step.label}
                </button>
              ) : (
                <span
                  key={step.id}
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium border-ink-black/[0.14] text-ink-black/70 dark:border-ink-cream/[0.16] dark:text-ink-cream/70"
                >
                  {step.label}
                </span>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);
OnboardingBanner.displayName = "OnboardingBanner";

export { OnboardingBanner };
