import * as React from "react";
import { cn } from "@/lib/utils";

interface StarIconProps {
  filled?: boolean;
  className?: string;
}

/** Canonical 5-point star (12px default; size via className). */
const StarIcon = ({ filled = true, className }: StarIconProps) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
    <path
      d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface StarRatingProps extends React.HTMLAttributes<HTMLSpanElement> {
  rating: number;
  /** svg: geometric icons; glyph: text ★ inheriting the surrounding font (editorial/template surfaces). */
  variant?: "svg" | "glyph";
  /** Render the unfilled remainder (outline stars / faded glyphs). */
  showEmpty?: boolean;
}

/** Row of 5 stars filled to `rating` (clamped + rounded). Color via className. */
const StarRating = React.forwardRef<HTMLSpanElement, StarRatingProps>(
  ({ rating, variant = "svg", showEmpty = true, className, ...props }, ref) => {
    const filled = Math.min(5, Math.max(0, Math.round(rating) || 0));

    return (
      <span
        ref={ref}
        aria-label={`${filled} out of 5 stars`}
        className={cn(
          variant === "svg" ? "inline-flex items-center gap-0.5" : "inline-block",
          className
        )}
        {...props}
      >
        {variant === "svg" ? (
          Array.from({ length: showEmpty ? 5 : filled }, (_, i) => (
            <StarIcon key={i} filled={i < filled} />
          ))
        ) : (
          <>
            {"★".repeat(filled)}
            {showEmpty && filled < 5 ? (
              <span className="opacity-25">{"★".repeat(5 - filled)}</span>
            ) : null}
          </>
        )}
      </span>
    );
  }
);
StarRating.displayName = "StarRating";

export { StarIcon, StarRating };
export type { StarRatingProps };
