"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ open, onClose, title, children, className }, ref) => {
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const [container, setContainer] = React.useState<HTMLElement | null>(null);

    // On mount, walk up the DOM to find [data-sheet-root] (builder scroll
    // container). Falls back to document.body for non-builder contexts.
    React.useEffect(() => {
      let el: HTMLElement | null = sentinelRef.current?.parentElement ?? null;
      while (el) {
        if (el.dataset.sheetRoot !== undefined) {
          setContainer(el);
          return;
        }
        el = el.parentElement;
      }
      setContainer(document.body);
    }, []);

    // Scroll lock on the found container
    React.useEffect(() => {
      if (!container) return;
      const prev = container.style.overflowY;
      if (open) container.style.overflowY = "hidden";
      return () => {
        container.style.overflowY = prev;
      };
    }, [open, container]);

    // Escape key
    React.useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Sentinel renders in the normal tree so we can find the container.
    // The actual sheet content portals into that container.
    return (
      <>
        <div ref={sentinelRef} style={{ display: "none" }} aria-hidden="true" />
        {container &&
          createPortal(
            <>
              {/* Backdrop */}
              <div
                aria-hidden="true"
                onClick={onClose}
                className={cn(
                  "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
                  "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  open ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              />

              {/* Sheet */}
              <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cn(
                  "fixed inset-x-0 bottom-0 z-50",
                  "max-h-[80vh] rounded-t-2xl",
                  "bg-white dark:bg-zinc-950",
                  "flex flex-col",
                  "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  open ? "translate-y-0" : "translate-y-full",
                  className
                )}
              >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-9 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                </div>
                <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-500 dark:text-neutral-400">
                    {title}
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <span className="text-sm leading-none select-none">×</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
              </div>
            </>,
            container
          )}
      </>
    );
  }
);

BottomSheet.displayName = "BottomSheet";

export { BottomSheet };
