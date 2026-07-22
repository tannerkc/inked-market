"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { templates } from "@/lib/data/templates";
import type { TemplateSlug } from "@/lib/types/builder";

interface TemplateSwitchDialogProps {
  isOpen: boolean;
  targetTemplate: TemplateSlug | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TemplateSwitchDialog({
  isOpen,
  targetTemplate,
  onConfirm,
  onCancel,
}: TemplateSwitchDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  if (!isOpen || !targetTemplate) return null;

  const tmpl = templates[targetTemplate];

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "w-[420px] rounded-2xl bg-chrome-surface border border-chrome-muted shadow-2xl p-6",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        {/* Title */}
        <h2 className="text-[16px] font-semibold text-chrome-text-primary">
          Switch Template?
        </h2>

        {/* Body */}
        <p className="mt-3 text-[13px] leading-relaxed text-chrome-text-secondary">
          Switching to{" "}
          <span className="font-semibold text-chrome-text-primary">{tmpl.name}</span> loads
          its layout. Your work on the current template is saved automatically —
          switch back anytime to pick up right where you left off.
        </p>

        {/* Color preview dots */}
        <div className="flex items-center gap-2 mt-4">
          <span
            className="w-4 h-4 rounded-full border border-chrome-border-hover"
            style={{ backgroundColor: tmpl.previewAccent }}
          />
          <span
            className="w-4 h-4 rounded-full border border-chrome-border-hover"
            style={{ backgroundColor: tmpl.previewBg }}
          />
          <span
            className="w-4 h-4 rounded-full border border-chrome-border-hover"
            style={{ backgroundColor: "var(--chrome-text-dim)" }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-chrome-text-secondary border border-chrome-border-hover rounded-lg hover:text-chrome-text-primary hover:border-chrome-text-dim transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-medium text-white bg-ink-red rounded-lg hover:opacity-90 transition-opacity"
          >
            Switch Template
          </button>
        </div>
      </div>
    </div>
  );
}
