"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SectionPopoverProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SectionPopover({
  title,
  isOpen,
  onClose,
  children,
}: SectionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chrome-muted px-3 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-chrome-text-dim">
          {title}
        </span>
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
        {children}
      </div>
    </div>
  );
}
