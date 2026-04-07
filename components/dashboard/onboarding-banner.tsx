"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface OnboardingBannerProps {
  title: string;
  subtitle: string;
  progress: number;
  onDismiss?: () => void;
  className?: string;
}

const STORAGE_KEY = "inked-onboarding-banner-dismissed";

const OnboardingBanner = React.forwardRef<HTMLDivElement, OnboardingBannerProps>(
  (
    { title, subtitle, progress, onDismiss, className, ...props },
    ref
  ) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";
    const [dismissed, setDismissed] = React.useState(false);

    React.useEffect(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "true") setDismissed(true);
      } catch { /* noop */ }
    }, []);

    if (dismissed) return null;

    const handleDismiss = () => {
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* noop */ }
      setDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative p-4 rounded-2xl",
          isDark
            ? "bg-ink-cream/[0.03] border border-ink-cream/[0.08]"
            : "bg-ink-black/[0.02] border border-ink-black/[0.08]",
          className
        )}
        {...props}
      >
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className={cn(
            "absolute top-3 right-3 cursor-pointer transition-colors",
            isDark
              ? "text-ink-cream/30 hover:text-ink-cream/50"
              : "text-ink-black/30 hover:text-ink-black/50"
          )}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className={cn(
          "font-mono text-[9px] tracking-[0.2em] uppercase mb-1",
          isDark ? "text-ink-cream/40" : "text-ink-black/40"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-[12px] pr-6",
          isDark ? "text-ink-cream/65" : "text-ink-black/65"
        )}>
          {subtitle}
        </p>

        <div className={cn(
          "h-1 rounded-full mt-3",
          isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]"
        )}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isDark
                ? "bg-gradient-to-r from-ink-red to-ink-rust"
                : "bg-gradient-to-r from-ink-rust to-ink-sage"
            )}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }
);
OnboardingBanner.displayName = "OnboardingBanner";

export { OnboardingBanner };
