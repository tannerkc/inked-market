import React from "react";
import { cn } from "@/lib/utils";
import { permanentMarker } from "@/lib/fonts";

type EyebrowColor = "red" | "rust" | "sage";

interface StepEyebrowProps {
  text: string;
  color?: EyebrowColor;
  className?: string;
}

const colorMap: Record<EyebrowColor, string> = {
  red: "text-ink-red",
  rust: "text-ink-rust",
  sage: "text-ink-sage",
};

const StepEyebrow = React.forwardRef<HTMLParagraphElement, StepEyebrowProps>(
  ({ text, color = "red", className }, ref) => (
    <p
      ref={ref}
      className={cn(
        `${permanentMarker.className} text-xs tracking-[0.25em] uppercase -rotate-2 inline-block mb-3`,
        colorMap[color],
        className
      )}
    >
      {text}
    </p>
  )
);
StepEyebrow.displayName = "StepEyebrow";

export { StepEyebrow };
export type { StepEyebrowProps, EyebrowColor };
