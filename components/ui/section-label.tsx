import React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  label: string;
  variant?: "light" | "dark" | "parchment" | "dark-muted";
  stretch?: boolean;
  className?: string;
}

const SectionLabel = React.forwardRef<HTMLDivElement, SectionLabelProps>(
  ({ label, variant = "dark", stretch = false, className }, ref) => {
    const lineClass = {
      parchment: "bg-ink-black/[0.06]",
      "dark-muted": "bg-ink-cream/[0.06]",
      dark: "bg-ink-rust",
      light: "bg-ink-red/40",
    }[variant];
    const textClass = {
      parchment: "text-ink-black/30",
      "dark-muted": "text-ink-cream/30",
      dark: "text-ink-rust",
      light: "text-ink-cream/30",
    }[variant];

    return (
      <div ref={ref} className={cn("flex items-center justify-center gap-3", className)}>
        <div className={cn("h-px", stretch ? "flex-1" : "w-8", lineClass)} />
        <p className={cn("font-mono text-xs tracking-[0.25em] uppercase", textClass)}>
          {label}
        </p>
        <div className={cn("h-px", stretch ? "flex-1" : "w-8", lineClass)} />
      </div>
    );
  }
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
