import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── StatusDot ─────────────────────────────────────────────── */

interface StatusDotProps {
  className?: string;
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className }, ref) => (
    <span
      ref={ref}
      className={cn(
        "w-[7px] h-[7px] rounded-full bg-ink-red shadow-[0_0_8px_color-mix(in_srgb,var(--ink-red)_50%,transparent)]",
        className
      )}
    />
  )
);
StatusDot.displayName = "StatusDot";

/* ─── Arrow icons ───────────────────────────────────────────── */

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-3.5 h-3.5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-3.5 h-3.5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-3.5 h-3.5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

/* ─── Variant & size maps ───────────────────────────────────── */

const variants = {
  // Legacy variants
  primary:
    "rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600",
  secondary:
    "rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
  outline:
    "rounded-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-600",
  ghost:
    "rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
  link: "rounded-lg text-indigo-600 underline-offset-4 hover:underline focus-visible:ring-indigo-600",
  // Curated Chaos variants
  ink: "rounded-full bg-ink-black text-ink-cream hover:bg-ink-black/90 font-mono tracking-[0.15em] uppercase focus-visible:ring-ink-black",
  "ink-outline":
    "rounded-full border border-ink-black/10 text-ink-black/45 hover:bg-ink-black/[0.04] hover:border-ink-black/20 font-mono tracking-[0.15em] uppercase focus-visible:ring-ink-black",
  "ink-ghost":
    "rounded-full text-ink-black/45 hover:text-ink-black/70 hover:bg-ink-black/[0.04] focus-visible:ring-ink-black",
  "ink-red":
    "rounded-full bg-ink-red text-white hover:bg-ink-red/90 font-mono tracking-[0.15em] uppercase shadow-[0_4px_16px_color-mix(in_srgb,var(--ink-red)_20%,transparent)] focus-visible:ring-ink-red",
  "ink-light-outline":
    "rounded-full border border-ink-cream/15 text-ink-cream/60 hover:bg-ink-cream/[0.05] hover:border-ink-cream/25 hover:text-ink-cream/80 font-mono tracking-[0.15em] uppercase focus-visible:ring-ink-cream",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-13 px-8 text-lg",
};

const inkSizes = {
  sm: "h-9 px-5 text-[11px]",
  md: "h-11 px-7 text-xs",
  lg: "h-13 px-8 text-xs",
};

/* ─── Button ────────────────────────────────────────────────── */

type ButtonVariant = keyof typeof variants;

export type ButtonProps<T extends React.ElementType = "button"> = {
  /** Render as a different element (e.g. Link, "a"). Defaults to "button". */
  as?: T;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  /** Show a StatusDot on the left. Pass true for default red, or a className string for custom dot styling. */
  statusDot?: boolean | string;
  /** Leading icon (rendered before children). */
  leftIcon?: React.ReactNode;
  /** Trailing icon (rendered after children). Use "arrow-right", "arrow-left", "arrow-down" for built-in arrows, or pass a ReactNode. */
  rightIcon?: React.ReactNode | "arrow-right" | "arrow-left" | "arrow-down";
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const Button = React.forwardRef(
  <T extends React.ElementType = "button">(
    {
      as,
      className,
      variant = "primary" as ButtonVariant,
      size = "md",
      statusDot,
      leftIcon,
      rightIcon,
      children,
      ...props
    }: ButtonProps<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.Ref<any>
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const isInk = variant.startsWith("ink");

    // Resolve built-in arrow strings to components
    const resolvedRightIcon =
      rightIcon === "arrow-right" ? (
        <ArrowRight />
      ) : rightIcon === "arrow-left" ? (
        <ArrowLeft />
      ) : rightIcon === "arrow-down" ? (
        <ArrowDown />
      ) : (
        rightIcon
      );

    const Component = as || "button";

    return (
      <Component
        className={cn(
          baseStyles,
          variants[variant],
          isInk ? inkSizes[size] : sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {statusDot && (
          <StatusDot
            className={typeof statusDot === "string" ? statusDot : undefined}
          />
        )}
        {leftIcon}
        {children}
        {resolvedRightIcon}
      </Component>
    );
  }
) as <T extends React.ElementType = "button">(
  props: ButtonProps<T> & { ref?: React.Ref<Element> }
) => React.ReactElement | null;

(Button as { displayName?: string }).displayName = "Button";

export { Button, StatusDot };
