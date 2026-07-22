import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
}

const DashboardSection = React.forwardRef<HTMLDivElement, DashboardSectionProps>(
  ({ title, action, children, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6", className)} {...props}>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-black/60 dark:text-ink-cream/60">
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
  )
);
DashboardSection.displayName = "DashboardSection";

export { DashboardSection };
