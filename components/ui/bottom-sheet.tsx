"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useOverlayContainer } from "@/lib/contexts/overlay-context";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ open, onClose, title, children, className }, ref) => {
    const overlayEl = useOverlayContainer();
    // When context provides an overlay layer, portal into it (absolute positioning).
    // Fall back to document.body with fixed positioning for non-builder contexts.
    const container = overlayEl ?? (typeof document !== "undefined" ? document.body : null);
    const posClass = overlayEl ? "absolute" : "fixed";

    // Escape key
    React.useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!container) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          aria-hidden="true"
          onClick={onClose}
          className={cn(
            `${posClass} inset-0 z-50 bg-black/60 backdrop-blur-sm`,
            "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        />

        {/* Sheet */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            `${posClass} inset-x-0 bottom-0 z-50`,
            "max-h-[80%] rounded-t-2xl",
            "flex flex-col",
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none",
            className
          )}
          style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-primary)" }}
        >
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
          </div>
          <div
            className="flex items-center justify-between px-6 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{ backgroundColor: "var(--bg-sunken)", color: "var(--text-secondary)" }}
            >
              <span className="text-sm leading-none select-none">×</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </>,
      container
    );
  }
);

BottomSheet.displayName = "BottomSheet";

export { BottomSheet };
