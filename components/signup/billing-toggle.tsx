"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BillingToggleProps {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
  className?: string;
}

export function BillingToggle({ isAnnual, onChange, className }: BillingToggleProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black cursor-pointer transition-opacity",
          !isAnnual ? "opacity-80 font-semibold" : "opacity-30"
        )}
        onClick={() => onChange(false)}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={() => onChange(!isAnnual)}
        className={cn(
          "w-10 h-[22px] rounded-full relative transition-colors cursor-pointer",
          isAnnual ? "bg-ink-sage" : "bg-ink-black/10"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform",
            isAnnual && "translate-x-[18px]"
          )}
        />
      </button>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black cursor-pointer transition-opacity",
          isAnnual ? "opacity-80 font-semibold" : "opacity-30"
        )}
        onClick={() => onChange(true)}
      >
        Annual
      </span>
      <span className="font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-ink-sage/10 text-ink-sage border border-ink-sage/20">
        Save 20%
      </span>
    </div>
  );
}
