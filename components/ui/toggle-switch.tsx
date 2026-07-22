"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}

const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onChange, size = "md", className }, ref) => {
    const trackClass = cn(
      "relative rounded-full transition-all duration-200",
      size === "md" ? "w-[36px] h-[20px]" : "w-[32px] h-[18px]",
      checked
        ? "bg-ink-rust"
        : "bg-ink-black/[0.08] dark:bg-ink-cream/[0.08]"
    );

    const thumbClass = cn(
      "absolute top-[2px] rounded-full transition-all duration-200",
      size === "md" ? "w-[16px] h-[16px]" : "w-[14px] h-[14px]",
      checked
        ? size === "md"
          ? "left-[18px]"
          : "left-[16px]"
        : "left-[2px]",
      checked
        ? "bg-ink-cream"
        : "bg-ink-black/40 dark:bg-ink-cream/40"
    );

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "cursor-pointer border-none p-0 bg-transparent inline-flex items-center",
          className
        )}
      >
        <span className={trackClass}>
          <span className={thumbClass} />
        </span>
      </button>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
