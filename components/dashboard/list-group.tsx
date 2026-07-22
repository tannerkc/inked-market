import * as React from "react";
import { cn } from "@/lib/utils";

/** Contained list surface: rounded border, subtle fill, hairline dividers between rows. */
const ListGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-[14px] border divide-y border-ink-black/[0.06] bg-ink-black/[0.015] divide-ink-black/[0.04] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.015] dark:divide-ink-cream/[0.04]",
        className
      )}
      {...props}
    />
  )
);
ListGroup.displayName = "ListGroup";

export { ListGroup };
