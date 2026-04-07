import React from "react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  label: string;
  className?: string;
}

const VerifiedBadge = React.forwardRef<HTMLDivElement, VerifiedBadgeProps>(
  ({ label, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-ink-sage mt-1 mb-3 relative z-10",
        className
      )}
    >
      <span className="w-[7px] h-[7px] rounded-full bg-ink-sage shadow-ink-sage-glow" />
      {label}
    </div>
  )
);
VerifiedBadge.displayName = "VerifiedBadge";

export { VerifiedBadge };
