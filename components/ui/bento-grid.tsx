import * as React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max columns at lg breakpoint. Defaults to 3. */
  cols?: 2 | 3 | 4;
}

const colsMap = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ cols = 3, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 max-w-6xl mx-auto",
        colsMap[cols],
        className
      )}
      {...props}
    />
  )
);
BentoGrid.displayName = "BentoGrid";

interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Span multiple columns. */
  colSpan?: 2 | 3;
  /** Span multiple rows. */
  rowSpan?: 2;
}

const colSpanMap = {
  2: "md:col-span-2",
  3: "md:col-span-3",
};

const rowSpanMap = {
  2: "lg:row-span-2",
};

const BentoItem = React.forwardRef<HTMLDivElement, BentoItemProps>(
  ({ colSpan, rowSpan, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        colSpan && colSpanMap[colSpan],
        rowSpan && rowSpanMap[rowSpan],
        className
      )}
      {...props}
    />
  )
);
BentoItem.displayName = "BentoItem";

export { BentoGrid, BentoItem };
