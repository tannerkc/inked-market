"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: "dashed" | "subtle";
  className?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ message, description, action, variant = "dashed", className, ...props }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "text-center rounded-[14px] p-5",
          variant === "dashed"
            ? isDark
              ? "border border-dashed border-ink-cream/[0.1]"
              : "border border-dashed border-ink-black/[0.1]"
            : isDark
              ? "bg-ink-cream/[0.02]"
              : "bg-ink-black/[0.02]",
          className
        )}
        {...props}
      >
        <p className={cn(
          "text-[12px]",
          isDark ? "text-ink-cream/40" : "text-ink-black/40"
        )}>
          {message}
        </p>
        {description && (
          <p className={cn(
            "text-[11px] mt-1",
            isDark ? "text-ink-cream/25" : "text-ink-black/25"
          )}>
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-[12px] font-semibold text-ink-rust hover:text-ink-rust/70 transition-colors mt-2 cursor-pointer"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
