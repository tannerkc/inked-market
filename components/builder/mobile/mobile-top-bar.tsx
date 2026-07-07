"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { SetupProgressChip } from "@/components/builder/setup-progress-chip";

export function MobileTopBar() {
  const router = useRouter();
  const { isDirty, canUndo, canRedo, undo, redo, saveDraft, studio } =
    useBuilder();

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-chrome-border bg-ink-black/95 px-3 backdrop-blur-xl">
      {/* Left: back + studio name */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-chrome-text-secondary transition-colors active:bg-white/5"
          title="Back to dashboard"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <span className="truncate text-xs font-medium text-chrome-text-secondary">
          {studio?.name ?? "Your Studio"}
        </span>
      </div>

      {/* Right: setup + undo/redo + save + publish */}
      <div className="flex items-center gap-1.5">
        <SetupProgressChip compact />
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors",
            canUndo
              ? "text-chrome-text-secondary active:bg-white/5"
              : "text-chrome-border-hover",
          )}
          title="Undo"
        >
          &#8617;
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors",
            canRedo
              ? "text-chrome-text-secondary active:bg-white/5"
              : "text-chrome-border-hover",
          )}
          title="Redo"
        >
          &#8618;
        </button>

        <button
          type="button"
          onClick={saveDraft}
          className="relative rounded-lg border border-chrome-border-hover px-2.5 py-1 text-[11px] font-medium text-chrome-text-secondary transition-colors active:bg-white/5"
        >
          Save
          {isDirty ? <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-ink-red" /> : null}
        </button>
        <button
          type="button"
          className="rounded-lg bg-ink-red px-2.5 py-1 text-[11px] font-semibold text-white transition-colors active:brightness-90"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
