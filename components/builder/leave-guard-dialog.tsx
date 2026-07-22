"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LeaveGuardDialogProps {
  isOpen: boolean;
  onSaveAndLeave: () => void;
  onLeave: () => void;
  onCancel: () => void;
}

export function LeaveGuardDialog({
  isOpen,
  onSaveAndLeave,
  onLeave,
  onCancel,
}: LeaveGuardDialogProps) {
  // Escape cancels (stays in the builder — the safe default).
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onCancel();
    },
    [onCancel],
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{ animation: "dialog-backdrop-in 180ms ease-out" }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-ink-black/70 backdrop-blur-md"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-guard-title"
        aria-describedby="leave-guard-body"
        style={{ animation: "dialog-pop-in 260ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        className={cn(
          "relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-chrome-muted bg-chrome-surface",
          "shadow-[0_24px_70px_-12px_rgba(0,0,0,0.8)]",
        )}
      >
        {/* Ink-red aura bleeding down from the top edge — brand atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-ink-red-glow-top"
        />
        {/* Machined-metal hairline highlight across the top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chrome-subtle to-transparent"
        />

        <div className="relative p-7">
          {/* Live "unsaved" indicator — a red dot with a slow pulse ring */}
          <div className="mb-5 flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-red opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ink-red shadow-ink-red-glow" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-red">
              Unsaved changes
            </span>
          </div>

          <h2
            id="leave-guard-title"
            className="text-[19px] font-semibold leading-tight text-chrome-text-primary"
          >
            Save before you go?
          </h2>
          <p
            id="leave-guard-body"
            className="mt-2.5 text-[13px] leading-relaxed text-chrome-text-secondary"
          >
            Your edits to this studio site haven&rsquo;t been saved yet. Save them
            now, or leave and lose the changes you just made.
          </p>

          <div className="mt-7 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onSaveAndLeave}
              autoFocus
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-red px-4",
                "text-[13px] font-semibold text-white shadow-ink-red-glow transition-all",
                "hover:brightness-110 active:scale-[0.99]",
              )}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8M7 3v5h8" />
              </svg>
              Save &amp; leave
            </button>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-chrome-border-hover text-[13px] font-medium text-chrome-text-secondary transition-colors hover:border-chrome-text-dim hover:text-chrome-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onLeave}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[13px] font-medium text-chrome-text-dim transition-colors hover:text-chrome-text-light"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
