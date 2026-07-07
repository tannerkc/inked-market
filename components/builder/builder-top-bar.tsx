"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { SetupProgressChip } from "@/components/builder/setup-progress-chip";

export function BuilderTopBar() {
  const router = useRouter();
  const { isDirty, canUndo, canRedo, undo, redo, saveDraft, studio, useMockData, toggleMockData, setIsPreviewing } = useBuilder();

  return (
    <div className="fixed top-0 right-0 left-0 z-[200] flex h-12 items-center justify-between border-b border-chrome-border bg-ink-black/92 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-chrome-border-hover text-chrome-text-secondary transition-colors hover:border-chrome-text-dim hover:text-white"
          title="Back to dashboard"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <span className="font-[family-name:var(--font-permanent-marker)] text-[13px] tracking-wide text-ink-red">
          INKED MARKET
        </span>
        <div className="h-4 w-px bg-chrome-border-hover" />
        <span className="text-xs font-medium text-chrome-text-secondary">
          {studio?.name ?? "Your Studio"}
        </span>
        <span className="rounded bg-ink-red/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-red">
          Editing
        </span>
        {isDirty ? <span className="rounded bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-chrome-text-dim">
            Unsaved
          </span> : null}
      </div>

      <div className="flex items-center gap-2">
        <SetupProgressChip />
        {/* Undo / Redo */}
        <div className="mr-2 flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "rounded-lg border border-chrome-border-hover px-2.5 py-1.5 text-xs font-medium transition-colors",
              canUndo
                ? "text-chrome-text-secondary hover:border-chrome-text-dim hover:text-white"
                : "cursor-not-allowed text-chrome-border-hover",
            )}
            title="Undo (⌘Z)"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              "rounded-lg border border-chrome-border-hover px-2.5 py-1.5 text-xs font-medium transition-colors",
              canRedo
                ? "text-chrome-text-secondary hover:border-chrome-text-dim hover:text-white"
                : "cursor-not-allowed text-chrome-border-hover",
            )}
            title="Redo (⌘⇧Z)"
          >
            ↪
          </button>
        </div>

        <button
          type="button"
          onClick={toggleMockData}
          aria-pressed={useMockData}
          title="Preview with example content — never shown on your live site."
          className={cn(
            "rounded-lg border bg-transparent px-3.5 py-1.5 text-xs font-medium transition-colors",
            useMockData
              ? "border-ink-gold text-ink-gold"
              : "border-chrome-border-hover text-chrome-text-tertiary",
          )}
        >
          Sample Data
        </button>
        <button
          type="button"
          onClick={saveDraft}
          className="rounded-lg border border-chrome-border-hover bg-transparent px-3.5 py-1.5 text-xs font-medium text-chrome-text-secondary transition-colors hover:border-chrome-text-dim hover:text-white"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => setIsPreviewing(true)}
          title="See your site exactly as visitors will"
          className="rounded-lg border border-chrome-border-hover bg-transparent px-3.5 py-1.5 text-xs font-medium text-chrome-text-secondary transition-colors hover:border-chrome-text-dim hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1.5 -mt-px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>Preview
        </button>
        <button
          type="button"
          className="rounded-lg border border-ink-red bg-ink-red px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:brightness-110"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
