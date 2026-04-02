import React from "react";
import { cn } from "@/lib/utils";
import { Eyebrow, type EyebrowColor } from "@/components/ui/eyebrow";
import { Headline, type HeadlineWord, type HeadlineSize } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";

interface PageHeaderProps {
  eyebrow?: {
    text: string;
    variant?: "marker" | "badge";
    color?: EyebrowColor;
  };
  headline:
    | { variant: "mixed"; words: HeadlineWord[]; size?: HeadlineSize; colorClass?: string }
    | { variant: "solid"; text: string; size?: HeadlineSize; colorClass?: string };
  subtitle?: {
    text: string;
    variant?: "plain" | "divider";
    colorClass?: string;
  };
  className?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ eyebrow, headline, subtitle, className }, ref) => (
    <div ref={ref} className={cn("text-center", className)}>
      {eyebrow && (
        <Eyebrow
          text={eyebrow.text}
          variant={eyebrow.variant}
          color={eyebrow.color}
        />
      )}
      <Headline {...headline} />
      {subtitle && (
        <Subtitle
          text={subtitle.text}
          variant={subtitle.variant}
          colorClass={subtitle.colorClass}
          className={subtitle.variant === "plain" ? "mt-2" : undefined}
        />
      )}
    </div>
  )
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
export type { PageHeaderProps };
