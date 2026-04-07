"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  mode: "light" | "dark";
  onToggle: (mode: "light" | "dark") => void;
  className?: string;
}

const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(
  ({ mode, onToggle, className }, ref) => {
    const isLight = mode === "light";

    return (
      <div ref={ref} className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "inline-flex rounded-full overflow-hidden border transition-colors",
            isLight ? "border-ink-black/10" : "border-ink-cream/10"
          )}
        >
          <button
            onClick={() => onToggle("light")}
            className={cn(
              "px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-300 border-none cursor-pointer",
              isLight
                ? "bg-ink-black text-ink-cream"
                : "bg-transparent text-ink-cream/40"
            )}
          >
            Light
          </button>
          <button
            onClick={() => onToggle("dark")}
            className={cn(
              "px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-300 border-none cursor-pointer",
              !isLight
                ? "bg-ink-cream text-ink-black"
                : "bg-transparent text-ink-black/40"
            )}
          >
            Dark
          </button>
        </div>
      </div>
    );
  }
);
ThemeToggle.displayName = "ThemeToggle";

export { ThemeToggle };
