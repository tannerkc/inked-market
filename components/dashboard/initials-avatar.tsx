import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

type InitialsAvatarSize = "sm" | "md" | "lg";
type InitialsAvatarTone = "muted" | "accent" | "strong";
type InitialsAvatarShape = "circle" | "rounded";

interface InitialsAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  imageUrl?: string | null;
  size?: InitialsAvatarSize;
  tone?: InitialsAvatarTone;
  /** Circle for people, rounded square for studios. */
  shape?: InitialsAvatarShape;
}

const sizeStyles: Record<InitialsAvatarSize, string> = {
  sm: "h-7 w-7 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-14 w-14 text-lg",
};

const toneStyles: Record<InitialsAvatarTone, string> = {
  muted:
    "border-ink-black/[0.08] bg-ink-black/[0.04] text-ink-black/40 dark:border-ink-cream/[0.08] dark:bg-ink-cream/[0.04] dark:text-ink-cream/40",
  accent: "border-ink-rust/[0.15] bg-ink-rust/[0.08] text-ink-rust",
  strong:
    "border-ink-black/[0.1] bg-ink-black/[0.06] font-semibold text-ink-black/50 dark:border-ink-cream/[0.1] dark:bg-ink-cream/[0.06] dark:text-ink-cream/50",
};

/** Row anchor: initials in a bordered circle, or the entity's photo when available. */
const InitialsAvatar = React.forwardRef<HTMLSpanElement, InitialsAvatarProps>(
  ({ name, imageUrl, size = "sm", tone = "muted", shape = "circle", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex shrink-0 select-none items-center justify-center overflow-hidden border font-mono",
        shape === "circle" ? "rounded-full" : "rounded-lg",
        sizeStyles[size],
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  )
);
InitialsAvatar.displayName = "InitialsAvatar";

export { InitialsAvatar };
export type { InitialsAvatarProps };
