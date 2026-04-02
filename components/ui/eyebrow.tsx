import React from "react";
import { cn } from "@/lib/utils";
import { permanentMarker } from "@/lib/fonts";
import { StatusDot } from "@/components/ui/button";

type EyebrowColor = "red" | "rust" | "sage";

interface EyebrowProps {
  text: string;
  variant?: "marker" | "badge";
  color?: EyebrowColor;
  className?: string;
}

const colorMap: Record<EyebrowColor, string> = {
  red: "text-ink-red",
  rust: "text-ink-rust",
  sage: "text-ink-sage",
};

const Eyebrow = React.forwardRef<HTMLDivElement, EyebrowProps>(
  ({ text, variant = "marker", color = "red", className }, ref) => {
    if (variant === "badge") {
      return (
        <div ref={ref} className={cn("inline-block", className)}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-ink-black/[0.08] bg-ink-black/[0.03]">
            <StatusDot className="w-1.5 h-1.5" />
            <span className="font-mono text-xs tracking-[0.15em] uppercase text-ink-black/50">
              {text}
            </span>
          </span>
        </div>
      );
    }

    return (
      <p
        ref={ref as React.Ref<HTMLParagraphElement>}
        className={cn(
          `${permanentMarker.className} text-xs tracking-[0.25em] uppercase -rotate-2 inline-block mb-2`,
          colorMap[color],
          className
        )}
      >
        {text}
      </p>
    );
  }
);
Eyebrow.displayName = "Eyebrow";

export { Eyebrow };
export type { EyebrowProps, EyebrowColor };
