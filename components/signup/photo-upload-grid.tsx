import React from "react";
import { cn } from "@/lib/utils";

interface PhotoUploadGridProps {
  slots?: number;
  className?: string;
}

export function PhotoUploadGrid({ slots = 3, className }: PhotoUploadGridProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {Array.from({ length: slots }, (_, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            "aspect-square rounded-[14px] border-[1.5px] border-dashed border-ink-black/[0.1] bg-ink-black/[0.015]",
            "flex flex-col items-center justify-center gap-1 cursor-pointer",
            "hover:border-ink-black/[0.2] hover:bg-ink-black/[0.03] transition-all",
            i === 0 ? "opacity-100" : "opacity-50"
          )}
        >
          <span className={cn("text-[22px] font-light text-ink-black", i === 0 ? "opacity-30" : "opacity-15")}>+</span>
          {i === 0 && (
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-black/30">Upload</span>
          )}
        </button>
      ))}
    </div>
  );
}
