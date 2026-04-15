"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface EditableSectionProps {
  name: string;
  sectionId: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function EditableSection({
  name,
  sectionId,
  isActive,
  onClick,
  children,
}: EditableSectionProps) {
  return (
    <div
      data-section={sectionId}
      onClick={(e) => {
        // Don't toggle section if click originated inside a popover
        if ((e.target as HTMLElement).closest("[data-builder-popover]")) return;
        onClick();
      }}
      className={cn(
        "group/section relative cursor-pointer transition-[outline] duration-150",
        isActive
          ? "outline outline-2 outline-ink-red/80"
          : "outline outline-2 outline-transparent hover:outline-ink-red/40"
      )}
    >
      {/* Floating label */}
      <div
        className={cn(
          "absolute top-2 left-2 z-20 rounded-md bg-ink-red px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white transition-all duration-200 ease-out",
          isActive
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 group-hover/section:opacity-100 group-hover/section:translate-y-0"
        )}
      >
        {name}
      </div>

      {children}
    </div>
  );
}
