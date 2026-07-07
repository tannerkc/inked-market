"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { CONTENT_GROUPS } from "./groups";

/** Stacked content groups; scrolls to + highlights the active group. */
export function ContentGroupList({ activeGroup }: { activeGroup?: ContentGroup }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeGroup || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-content-group="${activeGroup}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeGroup]);

  return (
    <div ref={listRef} className="space-y-3">
      {CONTENT_GROUPS.map(({ id, Component }) => (
        <Component key={id} highlighted={id === activeGroup} />
      ))}
    </div>
  );
}

/**
 * Overlay drawer for inline/mobile-free modes. Chrome-styled (always-dark
 * editor shell), focus-trapped, focus returns to the invoking element on close.
 */
export function BuilderContentPanel() {
  const { contentPanel, closeContentPanel } = useBuilder();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Focus management: remember invoker, focus panel, restore on close.
  useEffect(() => {
    if (contentPanel.open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    }
  }, [contentPanel.open]);

  // Escape closes; Tab cycles within the panel (minimal focus trap).
  useEffect(() => {
    if (!contentPanel.open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeContentPanel();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contentPanel.open, closeContentPanel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={closeContentPanel}
        className={cn(
          "fixed inset-0 z-[210] bg-ink-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          "motion-reduce:transition-none",
          contentPanel.open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Studio content"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-[220] flex h-full w-full max-w-[400px] flex-col",
          "border-l border-chrome-border bg-chrome-surface shadow-2xl outline-none",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "motion-reduce:transition-none",
          contentPanel.open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-chrome-border px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-chrome-text-dim">
            Studio Content
          </span>
          <button
            type="button"
            onClick={closeContentPanel}
            aria-label="Close content panel"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-chrome-raised text-chrome-text-tertiary transition-colors hover:bg-chrome-border hover:text-chrome-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-red/60"
          >
            <span className="text-sm leading-none select-none">&times;</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {contentPanel.open ? <ContentGroupList activeGroup={contentPanel.group} /> : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
