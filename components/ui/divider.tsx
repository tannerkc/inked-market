import React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-px",
        "bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]",
        className
      )}
    />
  )
);
Divider.displayName = "Divider";

export { Divider };
