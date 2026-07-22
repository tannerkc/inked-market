import React from "react";
import { cn } from "@/lib/utils";

interface NavPillProps {
  children: React.ReactNode;
  className?: string;
}

const NavPill = React.forwardRef<HTMLDivElement, NavPillProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border backdrop-blur",
        "border-ink-black/[0.06] bg-ink-cream/90 supports-[backdrop-filter]:bg-ink-cream/70",
        "dark:border-ink-cream/[0.06] dark:bg-ink-black/90 dark:supports-[backdrop-filter]:bg-ink-black/70",
        className
      )}
    >
      {children}
    </div>
  )
);
NavPill.displayName = "NavPill";

export { NavPill };
