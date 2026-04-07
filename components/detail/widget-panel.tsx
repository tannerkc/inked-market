import React from "react";
import { cn } from "@/lib/utils";

interface WidgetPanelProps {
  children: React.ReactNode;
  variant?: "default" | "alt" | "dark";
  className?: string;
}

const panelBg = {
  default: "bg-ink-black",
  alt: "bg-ink-black-raised",
  dark: "bg-ink-black-sunken",
} as const;

const WidgetPanel = React.forwardRef<HTMLDivElement, WidgetPanelProps>(
  ({ children, variant = "default", className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative border border-ink-cream/[0.06] rounded-xl p-6 md:p-8 overflow-hidden",
        panelBg[variant],
        className
      )}
    >
      {children}
    </div>
  )
);
WidgetPanel.displayName = "WidgetPanel";

interface WidgetLabelProps {
  label: string;
  variant?: "rust" | "sage";
}

function WidgetLabel({ label, variant = "rust" }: WidgetLabelProps) {
  const color = variant === "rust" ? "text-ink-rust" : "text-ink-sage";
  const lineColor =
    variant === "rust" ? "bg-ink-rust/40" : "bg-ink-sage/40";

  return (
    <div className="flex items-center gap-2 mb-4 relative z-10">
      <div className={cn("w-4 h-px", lineColor)} />
      <span
        className={cn(
          "font-mono text-[9px] tracking-[0.25em] uppercase",
          color
        )}
      >
        {label}
      </span>
    </div>
  );
}
WidgetLabel.displayName = "WidgetLabel";

interface WidgetHeadingProps {
  children: React.ReactNode;
  headingFont: string;
}

function WidgetHeading({ children, headingFont }: WidgetHeadingProps) {
  return (
    <h3
      className={`${headingFont} text-[26px] text-ink-cream mb-4 relative z-10`}
    >
      {children}
    </h3>
  );
}
WidgetHeading.displayName = "WidgetHeading";

export { WidgetPanel, WidgetLabel, WidgetHeading };
