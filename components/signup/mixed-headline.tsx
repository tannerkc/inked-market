import React from "react";
import { cn } from "@/lib/utils";
import {
  pirataOne,
  rye,
  limelight,
  permanentMarker,
  unifrakturCook,
} from "@/lib/fonts";

type FontName = "pirata" | "rye" | "limelight" | "marker" | "cook";

interface HeadlineWord {
  text: string;
  font: FontName;
  color?: string;
}

interface MixedHeadlineProps {
  words: HeadlineWord[];
  className?: string;
}

const fontMap: Record<FontName, string> = {
  pirata: pirataOne.className,
  rye: rye.className,
  limelight: limelight.className,
  marker: permanentMarker.className,
  cook: unifrakturCook.className,
};

const MixedHeadline = React.forwardRef<HTMLHeadingElement, MixedHeadlineProps>(
  ({ words, className }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "text-[30px] sm:text-4xl text-ink-black leading-tight mb-2",
        className
      )}
    >
      <span className="flex flex-wrap items-baseline justify-center gap-x-2">
        {words.map((w, i) => (
          <span
            key={i}
            className={cn(fontMap[w.font], w.color || "text-ink-black/40")}
          >
            {w.text}
          </span>
        ))}
      </span>
    </h1>
  )
);
MixedHeadline.displayName = "MixedHeadline";

export { MixedHeadline };
export type { MixedHeadlineProps, HeadlineWord, FontName };
