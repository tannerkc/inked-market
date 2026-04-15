"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMobileSheet } from "./mobile-sheet-orchestrator";
import { useSwipeDismiss } from "./use-swipe-dismiss";
import {
  SectionSheetContent,
  getSectionTitle,
  getSectionIndex,
  SECTION_IDS,
} from "./mobile-section-controls";
import { GlobalSheetContent, getGlobalTitle } from "./mobile-global-controls";

export function MobileControlSheet() {
  const { state, openSection, close } = useMobileSheet();
  const { isOpen, type, sectionId, globalTab } = state;

  const title =
    type === "section" && sectionId
      ? getSectionTitle(sectionId)
      : type === "global" && globalTab
        ? getGlobalTitle(globalTab)
        : "";

  const { dragStyle, onPointerDown } = useSwipeDismiss({
    onDismiss: close,
    enabled: isOpen,
  });

  const sectionIdx = sectionId ? getSectionIndex(sectionId) : -1;

  const goToSection = useCallback(
    (delta: number) => {
      if (sectionIdx < 0) return;
      const nextIdx =
        (sectionIdx + delta + SECTION_IDS.length) % SECTION_IDS.length;
      openSection(SECTION_IDS[nextIdx]);
    },
    [sectionIdx, openSection],
  );

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px]",
          "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Sheet */}
      <div
        data-mobile-sheet
        className={cn(
          "absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl",
          "bg-[var(--bg-raised,#1a1a1a)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-y-0" : "translate-y-full",
          type === "section" ? "max-h-[50%]" : "max-h-[70%]",
        )}
        style={{ color: "var(--text-primary, #e0e0e0)", ...dragStyle }}
      >
        {/* Drag handle -- swipe down to dismiss */}
        <div
          className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab touch-none"
          onPointerDown={onPointerDown}
        >
          <div
            className="h-1 w-9 rounded-full"
            style={{ backgroundColor: "var(--border, #333)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pb-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border, #2a2a2a)" }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--accent, #ff3333)" }}
          >
            {title}
          </span>

          <div className="flex items-center gap-2">
            {/* Section navigation arrows */}
            {type === "section" && sectionId && (
              <>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--text-muted, #666)" }}
                >
                  {sectionIdx + 1} of {SECTION_IDS.length}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => goToSection(-1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                    style={{
                      backgroundColor: "var(--bg-sunken, #222)",
                      color: "var(--text-secondary, #aaa)",
                    }}
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    onClick={() => goToSection(1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                    style={{
                      backgroundColor: "var(--bg-sunken, #222)",
                      color: "var(--text-secondary, #aaa)",
                    }}
                  >
                    &#8250;
                  </button>
                </div>
              </>
            )}

            {/* Global indicator */}
            {type === "global" && (
              <span
                className="text-[10px]"
                style={{ color: "var(--text-muted, #666)" }}
              >
                Global
              </span>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--bg-sunken, #222)",
                color: "var(--text-secondary, #aaa)",
              }}
            >
              <span className="text-sm leading-none select-none">x</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === "section" && sectionId && (
            <SectionSheetContent sectionId={sectionId} />
          )}
          {type === "global" && globalTab && (
            <GlobalSheetContent tab={globalTab} />
          )}
        </div>
      </div>
    </>
  );
}
