import React from "react";
import { cn } from "@/lib/utils";

interface SubtitleProps {
  text: string;
  variant?: "plain" | "divider";
  colorClass?: string;
  className?: string;
}

const Subtitle = React.forwardRef<HTMLDivElement, SubtitleProps>(
  ({ text, variant = "plain", colorClass, className }, ref) => {
    if (variant === "divider") {
      return (
        <div ref={ref} className={cn("flex items-center gap-3 justify-center mt-3", className)}>
          <div className={cn("w-14 h-px", colorClass === "dark" ? "bg-ink-cream/10" : "bg-ink-black/10")} />
          <span
            className={cn(
              "font-mono text-[10px] tracking-[0.18em] uppercase",
              colorClass === "dark" ? "text-ink-cream/25" : "text-ink-black/25"
            )}
          >
            {text}
          </span>
          <div className={cn("w-14 h-px", colorClass === "dark" ? "bg-ink-cream/10" : "bg-ink-black/10")} />
        </div>
      );
    }

    return (
      <p
        ref={ref as React.Ref<HTMLParagraphElement>}
        className={cn(
          "text-sm leading-relaxed",
          colorClass || "text-ink-black/35",
          className
        )}
      >
        {text}
      </p>
    );
  }
);
Subtitle.displayName = "Subtitle";

export { Subtitle };
export type { SubtitleProps };
