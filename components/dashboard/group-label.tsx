import * as React from "react";
import { cn } from "@/lib/utils";

/** Mono uppercase eyebrow above a grouped list ("Needs response", "Upcoming"). */
const GroupLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "mb-2 font-mono text-[8px] tracking-[0.2em] uppercase text-ink-black/35 dark:text-ink-cream/35",
        className
      )}
      {...props}
    />
  )
);
GroupLabel.displayName = "GroupLabel";

export { GroupLabel };
