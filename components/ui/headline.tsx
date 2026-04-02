import React from "react";
import { cn } from "@/lib/utils";
import { bebasNeue, pirataOne, rye, limelight, permanentMarker, unifrakturCook } from "@/lib/fonts";

type FontName = "pirata" | "rye" | "limelight" | "marker" | "cook";
type HeadlineSize = "md" | "lg" | "xl";

interface HeadlineWord {
  text: string;
  font: FontName;
  color?: string;
}

interface HeadlineProps {
  variant: "mixed" | "solid";
  words?: HeadlineWord[];
  text?: string;
  size?: HeadlineSize;
  colorClass?: string;
  className?: string;
}

const fontMap: Record<FontName, string> = {
  pirata: pirataOne.className,
  rye: rye.className,
  limelight: limelight.className,
  marker: permanentMarker.className,
  cook: unifrakturCook.className,
};

const sizeMap: Record<HeadlineSize, string> = {
  md: "text-4xl sm:text-5xl",
  lg: "text-5xl sm:text-6xl lg:text-8xl",
  xl: "text-5xl sm:text-6xl lg:text-7xl",
};

const Headline = React.forwardRef<HTMLHeadingElement, HeadlineProps>(
  ({ variant, words, text, size = "md", colorClass, className }, ref) => {
    if (variant === "solid") {
      return (
        <h1
          ref={ref}
          className={cn(
            `${bebasNeue.className} tracking-wider`,
            sizeMap[size],
            colorClass || "text-ink-black",
            className
          )}
        >
          {text}
        </h1>
      );
    }

    return (
      <h1
        ref={ref}
        className={cn(
          "leading-tight mb-2",
          sizeMap[size],
          colorClass || "text-ink-black",
          className
        )}
      >
        <span className="flex flex-wrap items-baseline justify-center gap-x-3">
          {words?.map((w, i) => (
            <span
              key={i}
              className={cn(fontMap[w.font], w.color || "text-ink-black/40")}
            >
              {w.text}
            </span>
          ))}
        </span>
      </h1>
    );
  }
);
Headline.displayName = "Headline";

export { Headline };
export type { HeadlineProps, HeadlineWord, FontName, HeadlineSize };
