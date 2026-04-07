"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterDropdownProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
}

const FilterDropdown = React.forwardRef<HTMLDivElement, FilterDropdownProps>(
  ({ open, title, children, variant = "dark", className, ...props }, ref) => {
    const isDark = variant === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "max-w-[520px] mx-auto rounded-xl transition-all duration-[400ms] ease-in-out",
          isDark
            ? "bg-ink-cream/[0.04] border border-ink-cream/[0.08]"
            : "bg-ink-black/[0.03] border border-ink-black/[0.06]",
          open
            ? "max-h-[300px] opacity-100 py-5 px-5"
            : "max-h-0 opacity-0 overflow-hidden py-0 px-5 border-transparent",
          className
        )}
        {...props}
      >
        <p
          className={cn(
            "font-mono text-[9px] tracking-[0.2em] uppercase mb-3",
            isDark ? "text-ink-rust" : "text-ink-rust"
          )}
        >
          {title}
        </p>
        {children}
      </div>
    );
  }
);

FilterDropdown.displayName = "FilterDropdown";

export { FilterDropdown };
