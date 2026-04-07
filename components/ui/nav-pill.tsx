import React from "react";
import { cn } from "@/lib/utils";

interface NavPillProps {
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
}

const NavPill = React.forwardRef<HTMLDivElement, NavPillProps>(
  ({ children, variant = "light", className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border backdrop-blur",
        variant === "light"
          ? "border-ink-black/[0.06] bg-ink-cream/90 supports-[backdrop-filter]:bg-ink-cream/70"
          : "border-ink-cream/[0.06] bg-ink-black/90 supports-[backdrop-filter]:bg-ink-black/70",
        className
      )}
    >
      {children}
    </div>
  )
);
NavPill.displayName = "NavPill";

export { NavPill };
