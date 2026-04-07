"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

export interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SlideOverPanel = React.forwardRef<HTMLDivElement, SlideOverPanelProps>(
  ({ open, onClose, title, children, className }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    // SSR guard: only mount portal after client hydration
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Body scroll lock
    React.useEffect(() => {
      if (typeof document === "undefined") return;
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    // Escape key to close
    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!mounted || typeof document === "undefined") return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          aria-hidden="true"
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-sm",
            "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />

        {/* Panel */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            // Positioning: bottom sheet on mobile, right drawer on desktop
            "fixed inset-x-0 bottom-0 lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-0",
            // Sizing
            "h-full w-full lg:w-[420px]",
            // Stacking
            "z-50",
            // Shape
            "rounded-t-2xl lg:rounded-none",
            // Colors
            isDark ? "bg-ink-black" : "bg-ink-cream",
            // Layout
            "flex flex-col",
            // Transition
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            // Open/closed state: translate-y for mobile, translate-x for desktop
            open
              ? "translate-y-0 lg:translate-x-0"
              : "translate-y-full lg:translate-y-0 lg:translate-x-full",
            className
          )}
        >
          {/* Sticky header */}
          <div
            className={cn(
              "sticky top-0 flex items-center justify-between px-6 py-4 border-b shrink-0",
              isDark ? "border-ink-cream/[0.06]" : "border-ink-black/[0.06]"
            )}
          >
            <span
              className={cn(
                "font-mono text-[9px] tracking-[0.2em] uppercase",
                isDark ? "text-ink-cream/50" : "text-ink-black/50"
              )}
            >
              {title}
            </span>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close panel"
              className={cn(
                "flex items-center justify-center w-[28px] h-[28px] rounded-lg border transition-colors",
                isDark
                  ? "border-ink-cream/[0.08] bg-ink-cream/[0.04] text-ink-cream/60 hover:bg-ink-cream/[0.08] hover:text-ink-cream"
                  : "border-ink-black/[0.08] bg-ink-black/[0.04] text-ink-black/60 hover:bg-ink-black/[0.08] hover:text-ink-black"
              )}
            >
              <span className="text-[14px] leading-none select-none">×</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </>,
      document.body
    );
  }
);

SlideOverPanel.displayName = "SlideOverPanel";

export { SlideOverPanel };
