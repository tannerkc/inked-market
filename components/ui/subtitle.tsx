import React from "react";
import { cn } from "@/lib/utils";

interface SubtitleProps {
  text: string;
  variant?: "plain" | "divider";
  /** Optional override class for the text color (plain variant only). */
  colorClass?: string;
  className?: string;
}

const Subtitle = React.forwardRef<HTMLDivElement, SubtitleProps>(
  ({ text, variant = "plain", colorClass, className }, ref) => {
    if (variant === "divider") {
      return (
        <div ref={ref} className={cn("flex items-center gap-3 justify-center mt-3", className)}>
          <div className="w-14 h-px bg-ink-black/10 dark:bg-ink-cream/10" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-black/25 dark:text-ink-cream/25">
            {text}
          </span>
          <div className="w-14 h-px bg-ink-black/10 dark:bg-ink-cream/10" />
        </div>
      );
    }

    return (
      <p
        ref={ref as React.Ref<HTMLParagraphElement>}
        className={cn(
          "text-sm leading-relaxed",
          colorClass || "text-ink-black/35 dark:text-ink-cream/35",
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
