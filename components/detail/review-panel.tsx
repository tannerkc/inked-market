import React from "react";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import type { Review } from "@/lib/types";

interface ReviewPanelProps {
  reviews: Review[];
  rating: number;
  headingFont: string;
}

const ReviewPanel = React.forwardRef<HTMLDivElement, ReviewPanelProps>(
  ({ reviews, rating, headingFont }, ref) => (
    <div
      ref={ref}
      className="relative bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6 md:p-8 overflow-hidden"
    >
      <FilmGrainOverlay className="opacity-[0.04]" />
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="w-4 h-px bg-ink-rust/40" />
        <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-ink-rust">
          Reviews — {rating.toFixed(1)} Average
        </span>
      </div>
      <h3
        className={`${headingFont} text-[26px] text-ink-cream mb-4 relative z-10`}
      >
        What Clients Say
      </h3>
      <div className="space-y-0 relative z-10">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="py-4 border-b border-ink-cream/[0.06] last:border-0"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-ink-cream/[0.08]" />
              <div>
                <div className="text-[13px] font-semibold text-ink-cream">
                  {review.authorName}
                </div>
                <div className="font-mono text-[9px] tracking-[0.1em] text-ink-cream/30">
                  {review.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · Verified Booking
                </div>
              </div>
            </div>
            <div className="text-xs text-ink-red mb-1.5">
              {"★".repeat(review.rating)}
            </div>
            <p className="text-[13px] text-ink-cream/55 leading-[1.7]">
              {review.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
);
ReviewPanel.displayName = "ReviewPanel";

export { ReviewPanel };
