import * as React from "react";
import { cn } from "@/lib/utils";

type MetaChipSize = "sm" | "md";

interface MetaChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: MetaChipSize;
}

const sizeStyles: Record<MetaChipSize, string> = {
  sm: "px-1.5 py-px text-[9px]",
  md: "px-2.5 py-1 text-[10px]",
};

/** Quiet metadata token ("forearm", "$200–400", "45 min") — outline pill, mono type. */
const MetaChip = React.forwardRef<HTMLSpanElement, MetaChipProps>(
  ({ size = "sm", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "rounded-full border font-mono border-ink-black/[0.08] text-ink-black/40 dark:border-ink-cream/[0.08] dark:text-ink-cream/40",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);
MetaChip.displayName = "MetaChip";

export { MetaChip };
export type { MetaChipProps };
