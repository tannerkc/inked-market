"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface DashboardSectionProps {
  title: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
}

const DashboardSection = React.forwardRef<HTMLDivElement, DashboardSectionProps>(
  ({ title, action, children, className, ...props }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";

    return (
      <div ref={ref} className={cn("mb-6", className)} {...props}>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className={cn(
            "font-mono text-[9px] tracking-[0.2em] uppercase",
            isDark ? "text-ink-cream/35" : "text-ink-black/35"
          )}>
            {title}
          </h3>
          {action && (
            <button
              onClick={action.onClick}
              className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    );
  }
);
DashboardSection.displayName = "DashboardSection";

export { DashboardSection };
