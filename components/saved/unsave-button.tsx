"use client";

import React from "react";
import { cn } from "@/lib/utils";

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

export interface UnsaveButtonProps {
  onClick: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
  className?: string;
}

const UnsaveButton = React.forwardRef<HTMLButtonElement, UnsaveButtonProps>(
  ({ onClick, size = "md", className }, ref) => {
    const isSm = size === "sm";

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "rounded-full bg-ink-black/50 backdrop-blur-md flex items-center justify-center hover:bg-ink-black/70 transition-colors cursor-pointer",
          isSm ? "w-6 h-6" : "w-7 h-7",
          className
        )}
        aria-label="Unsave"
      >
        <svg
          className={cn(
            "text-ink-red fill-ink-red",
            isSm ? "w-3 h-3" : "w-3.5 h-3.5"
          )}
          viewBox="0 0 24 24"
        >
          <path d={HEART_PATH} />
        </svg>
      </button>
    );
  }
);

UnsaveButton.displayName = "UnsaveButton";

export { UnsaveButton, HEART_PATH };
