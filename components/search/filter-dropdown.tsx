import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterDropdownProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FilterDropdown = React.forwardRef<HTMLDivElement, FilterDropdownProps>(
  ({ open, title, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "max-w-[520px] mx-auto rounded-xl transition-all duration-[400ms] ease-in-out",
        "bg-ink-black/[0.03] border border-ink-black/[0.06]",
        "dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08]",
        open
          ? "max-h-[400px] overflow-y-auto opacity-100 py-5 px-5"
          : "max-h-0 opacity-0 overflow-hidden py-0 px-5 border-transparent",
        className
      )}
      {...props}
    >
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-rust">
        {title}
      </p>
      {children}
    </div>
  )
);

FilterDropdown.displayName = "FilterDropdown";

export { FilterDropdown };
