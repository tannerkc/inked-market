import React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  variant?: "light" | "dark";
  className?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ variant = "dark", className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-px",
        variant === "dark" ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]",
        className
      )}
    />
  )
);
Divider.displayName = "Divider";

export { Divider };
