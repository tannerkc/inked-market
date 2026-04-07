import React from "react";
import { cn } from "@/lib/utils";
import { permanentMarker } from "@/lib/fonts";

interface TattooPenIconProps {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
}

const TattooPenIcon = React.forwardRef<SVGSVGElement, TattooPenIconProps>(
  ({ size = 28, variant = "dark", className, ...props }, ref) => {
    const height = Math.round(size * (88 / 34));
    const fill = variant === "dark" ? "var(--ink-black)" : "var(--ink-cream)";
    const detail = variant === "dark" ? "var(--ink-cream)" : "var(--ink-black)";

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
        <rect x="7" y="0" width="20" height="16" rx="3" fill={fill} />
        <rect x="11" y="3.5" width="12" height="9" rx="2.5" stroke={detail} strokeWidth="2.5" fill="none" />
        <rect x="11" y="18" width="12" height="5" rx="2" fill={fill} />
        <rect x="9" y="23" width="16" height="38" rx="4" fill={fill} />
        <line x1="9" y1="32" x2="25" y2="32" stroke={detail} strokeWidth="1.5" />
        <line x1="9" y1="52" x2="25" y2="52" stroke={detail} strokeWidth="1.5" />
        <path d="M12 61 L22 61 L20 67 L14 67 Z" fill={fill} />
        <rect x="14" y="67" width="6" height="4" rx="1" fill={fill} />
        <path d="M15.5 71 L18.5 71 L17 78 Z" fill="var(--ink-red)" />
      </svg>
    );
  }
);
TattooPenIcon.displayName = "TattooPenIcon";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  className?: string;
}

const sizeMap = {
  sm: { icon: 8, text: "text-base" },
  md: { icon: 11, text: "text-lg" },
  lg: { icon: 14, text: "text-2xl" },
};

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "md", variant = "dark", className, ...props }, ref) => {
    const { icon, text } = sizeMap[size];
    const boldColor = variant === "dark" ? "text-ink-black" : "text-ink-cream";
    const mutedColor = variant === "dark" ? "text-ink-black/40" : "text-ink-cream/40";

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
