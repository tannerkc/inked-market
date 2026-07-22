import * as React from "react";
import { cn } from "@/lib/utils";

interface ListRowProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical alignment of the leading/body/trailing slots. */
  align?: "center" | "start";
  /** Hover tint. Defaults on when onClick is present. */
  interactive?: boolean;
}

/**
 * Row shell for ListGroup children: slot gap, padding, and hover treatment.
 * Renders a <button> when onClick is set, a <div> otherwise.
 */
const ListRow = React.forwardRef<HTMLElement, ListRowProps>(
  ({ align = "center", interactive, onClick, className, ...props }, ref) => {
    const Comp = (onClick ? "button" : "div") as "button";
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn(
          "flex w-full gap-3 px-3 py-2.5 text-left",
          align === "center" ? "items-center" : "items-start",
          (interactive ?? Boolean(onClick)) &&
            "transition-colors hover:bg-ink-black/[0.03] dark:hover:bg-ink-cream/[0.03]",
          className
        )}
        {...props}
      />
    );
  }
);
ListRow.displayName = "ListRow";

export { ListRow };
export type { ListRowProps };
