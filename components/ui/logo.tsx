import React from "react";
import { cn } from "@/lib/utils";
import { permanentMarker } from "@/lib/fonts";

interface TattooPenIconProps {
  size?: number;
  /** Force a specific color regardless of theme. Omit for auto (theme-aware). */
  variant?: "dark" | "light";
  className?: string;
}

const TattooPenIcon = React.forwardRef<SVGSVGElement, TattooPenIconProps>(
  ({ size = 28, variant, className, ...props }, ref) => {
    const height = Math.round(size * (88 / 34));

    // When `variant` is set, force fill via direct CSS var — overrides the dark: classes.
    const forcedFill = variant === "dark" ? "var(--ink-black)" : variant === "light" ? "var(--ink-cream)" : undefined;
    const forcedDetail = variant === "dark" ? "var(--ink-cream)" : variant === "light" ? "var(--ink-black)" : undefined;

    // When unforced, use Tailwind classes that respond to [data-theme="dark"].
    const fillClass = !variant ? "fill-ink-black dark:fill-ink-cream" : undefined;
    const detailStrokeClass = !variant ? "stroke-ink-cream dark:stroke-ink-black" : undefined;

    return (
      <svg
        ref={ref}
        width={size}
        height={height}
        viewBox="0 0 34 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect x="7" y="0" width="20" height="16" rx="3" className={fillClass} fill={forcedFill} />
        <rect x="11" y="3.5" width="12" height="9" rx="2.5" className={detailStrokeClass} stroke={forcedDetail} strokeWidth="2.5" fill="none" />
        <rect x="11" y="18" width="12" height="5" rx="2" className={fillClass} fill={forcedFill} />
        <rect x="9" y="23" width="16" height="38" rx="4" className={fillClass} fill={forcedFill} />
        <line x1="9" y1="32" x2="25" y2="32" className={detailStrokeClass} stroke={forcedDetail} strokeWidth="1.5" />
        <line x1="9" y1="52" x2="25" y2="52" className={detailStrokeClass} stroke={forcedDetail} strokeWidth="1.5" />
        <path d="M12 61 L22 61 L20 67 L14 67 Z" className={fillClass} fill={forcedFill} />
        <rect x="14" y="67" width="6" height="4" rx="1" className={fillClass} fill={forcedFill} />
        <path d="M15.5 71 L18.5 71 L17 78 Z" fill="var(--ink-red)" />
      </svg>
    );
  }
);
TattooPenIcon.displayName = "TattooPenIcon";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  /** Force a specific color regardless of theme. Omit for auto (theme-aware). */
  variant?: "dark" | "light";
  className?: string;
}

const sizeMap = {
  sm: { icon: 8, text: "text-base" },
  md: { icon: 11, text: "text-lg" },
  lg: { icon: 14, text: "text-2xl" },
};

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "md", variant, className, ...props }, ref) => {
    const { icon, text } = sizeMap[size];

    // When unforced, theme-aware via dark: classes.
    const boldColor =
      variant === "dark"
        ? "text-ink-black"
        : variant === "light"
          ? "text-ink-cream"
          : "text-ink-black dark:text-ink-cream";
    const mutedColor =
      variant === "dark"
        ? "text-ink-black/40"
        : variant === "light"
          ? "text-ink-cream/40"
          : "text-ink-black/40 dark:text-ink-cream/40";

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        <TattooPenIcon size={icon} variant={variant} className="-rotate-[15deg]" />
        <div className="flex items-baseline gap-1">
          <span className={cn(permanentMarker.className, text, "tracking-wide", boldColor)}>
            Inked
          </span>
          <span className={cn(text, "font-normal tracking-tight", mutedColor)}>
            Market
          </span>
        </div>
      </div>
    );
  }
);
Logo.displayName = "Logo";

export { TattooPenIcon, Logo };
