"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { FlashEditor } from "@/components/builder/flash-editor";
import { CustomEditor } from "@/components/builder/custom-editor";
import { ContentGroupList } from "@/components/builder/content-panel";
import type { BuilderTier } from "@/lib/types/builder";

export function EditorPanel() {
  const { config, applyChange, contentPanel } = useBuilder();
  const tier = config.builderTier ?? "flash";
  const [view, setView] = useState<"content" | "style">("style");

  // Chip/checklist deep-links land in the docked Content view in split mode —
  // render-phase adjustment (not an effect) so it never cascades renders.
  const [lastPanel, setLastPanel] = useState(contentPanel);
  if (contentPanel !== lastPanel) {
    setLastPanel(contentPanel);
    if (contentPanel.open) setView("content");
  }

  const switchTier = (newTier: BuilderTier) => {
    applyChange({ builderTier: newTier });
    try {
      localStorage.setItem("inked-builder-tier", newTier);
    } catch {
      // localStorage may be unavailable
    }
  };

  return (
    <div className="flex flex-col w-[380px] min-w-[380px] h-full bg-chrome-surface border-r border-chrome-border">
      {/* Content | Style switch + tier badges */}
      <div className="flex items-center justify-between border-b border-chrome-border px-4 py-2">
        <div className="flex gap-1" role="tablist" aria-label="Editor view">
          {(["content", "style"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors",
                view === v
                  ? "bg-ink-red/15 text-ink-red"
                  : "bg-transparent text-chrome-text-faint hover:text-chrome-text-secondary",
              )}
            >
              {v === "content" ? "Content" : "Style"}
            </button>
          ))}
        </div>
        {view === "style" ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => switchTier("flash")}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors",
                tier === "flash"
                  ? "bg-ink-red/15 text-ink-red"
                  : "bg-transparent text-chrome-text-faint hover:text-chrome-text-secondary"
              )}
            >
              Flash
            </button>
            <button
              type="button"
              onClick={() => switchTier("custom")}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors",
                tier === "custom"
                  ? "bg-ink-red/15 text-ink-red"
                  : "bg-transparent text-chrome-text-faint hover:text-chrome-text-secondary"
              )}
            >
              Custom
            </button>
          </div>
        ) : null}
      </div>

      {view === "content" ? (
        <div className="flex-1 overflow-y-auto p-4">
          <ContentGroupList activeGroup={contentPanel.group} />
        </div>
      ) : tier === "flash" ? (
        <FlashEditor />
      ) : (
        <CustomEditor />
      )}
    </div>
  );
}
