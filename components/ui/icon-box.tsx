import React from "react";
import { cn } from "@/lib/utils";

type IconBoxColor = "red" | "rust" | "sage";

interface IconBoxProps {
  color?: IconBoxColor;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<IconBoxColor, string> = {
  red: "bg-ink-red/10 border-ink-red/15 text-ink-red",
  rust: "bg-ink-rust/10 border-ink-rust/15 text-ink-rust",
  sage: "bg-ink-sage/15 border-ink-sage/20 text-ink-sage",
};

const sizeMap = {
  sm: "w-10 h-10 rounded-lg",
  md: "w-12 h-12 rounded-xl",
  lg: "w-14 h-14 rounded-xl",
};

const IconBox = React.forwardRef<HTMLDivElement, IconBoxProps>(
  ({ color = "red", size = "md", children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center border shrink-0",
        colorMap[color],
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  )
);
IconBox.displayName = "IconBox";

export { IconBox };
export type { IconBoxColor };
