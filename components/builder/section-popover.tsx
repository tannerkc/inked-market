"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";

interface SectionPopoverProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** When set, the popover shows a Content tab that hands off to the Content panel. */
  contentGroup?: ContentGroup;
  contentSummary?: string;
}

export function SectionPopover({
  title,
  isOpen,
  onClose,
  children,
  contentGroup,
  contentSummary,
}: SectionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { openContentPanel } = useBuilder();
  const [tab, setTab] = useState<"style" | "content">("style");

  // Reset to Style on each open — render-phase adjustment, not an effect.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTab("style");
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      data-builder-popover
      onClick={(e) => e.stopPropagation()}
      className="absolute top-4 right-4 z-40 w-[320px] rounded-2xl border border-chrome-muted bg-chrome-surface/97 shadow-2xl backdrop-blur-xl [animation:popover-in_200ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
    >
      {/* Header — Style/Content tabs when the section has editable data */}
      <div className="flex items-center justify-between border-b border-chrome-muted px-3 py-2.5">
        {contentGroup ? (
          <div className="flex gap-1" role="tablist" aria-label={title}>
            {(["style", "content"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  tab === t
                    ? "bg-ink-red/15 text-ink-red"
                    : "text-chrome-text-dim hover:text-chrome-text-secondary",
                )}
              >
                {t === "style" ? "Style" : "Content"}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-[11px] font-medium uppercase tracking-wider text-chrome-text-dim">
            {title}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-chrome-raised text-chrome-text-tertiary transition-colors hover:bg-chrome-border hover:text-chrome-text-light"
        >
          <span className="text-xs leading-none">&times;</span>
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto p-3">
        {tab === "content" && contentGroup ? (
          <div className="space-y-3">
            {contentSummary ? (
              <p className="text-[11px] leading-relaxed text-chrome-text-dim">{contentSummary}</p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                openContentPanel(contentGroup);
                onClose();
              }}
              className="w-full rounded-lg border border-ink-red bg-ink-red/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-red transition-colors hover:bg-ink-red/20"
            >
              Edit Content
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
