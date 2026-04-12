import React from "react";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { cn } from "@/lib/utils";
import type { Review, ReviewSource } from "@/lib/types";

interface ReviewPanelProps {
  reviews: Review[];
  headingFont: string;
}

const SOURCE_LABELS: Record<ReviewSource, string> = {
  "inked-market": "Verified Booking",
  google: "Google",
  yelp: "Yelp",
  trustpilot: "Trustpilot",
};

function computeAggregateRating(reviews: Review[]): { average: number; count: number } {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}

function sortByDateDesc(reviews: Review[]): Review[] {
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const ReviewPanel = React.forwardRef<HTMLDivElement, ReviewPanelProps>(
  ({ reviews, headingFont }, ref) => {
    const sorted = sortByDateDesc(reviews);
    const { average, count } = computeAggregateRating(reviews);

    // Count reviews by source for the summary
    const sourceCounts = reviews.reduce<Partial<Record<ReviewSource, number>>>((acc, r) => {
      const src = r.source ?? "inked-market";
      acc[src] = (acc[src] ?? 0) + 1;
      return acc;
    }, {});
    const sourceNames = Object.keys(sourceCounts) as ReviewSource[];
    const hasMultipleSources = sourceNames.length > 1;

    return (
      <div
        ref={ref}
        className="relative bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6 md:p-8 overflow-hidden"
      >
        <FilmGrainOverlay className="opacity-[0.04]" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="w-4 h-px bg-ink-rust/40" />
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-ink-rust">
            Reviews — {average.toFixed(1)} Average
          </span>
        </div>

        <h3 className={`${headingFont} text-[26px] text-ink-cream mb-2 relative z-10`}>
          What Clients Say
        </h3>

        {/* Source summary */}
        {hasMultipleSources && (
          <p className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink-cream/20 mb-4 relative z-10">
            {count} reviews from {sourceNames.map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && (i === sourceNames.length - 1 ? " & " : ", ")}
                {SOURCE_LABELS[s]}
              </React.Fragment>
            ))}
          </p>
        )}

        {/* Reviews */}
        <div className="space-y-0 relative z-10">
          {sorted.map((review) => {
            const source = review.source ?? "inked-market";
            const isLocal = source === "inked-market";

            return (
              <div
                key={review.id}
                className="py-4 border-b border-ink-cream/[0.06] last:border-0"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-ink-cream/[0.08]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink-cream">
                      {review.authorName}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] tracking-[0.1em] text-ink-cream/30">
                        {review.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className={cn(
                        "font-mono text-[7px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full",
                        isLocal
                          ? "bg-ink-sage/[0.12] text-ink-sage/70"
                          : "bg-ink-cream/[0.05] text-ink-cream/25"
                      )}>
                        {SOURCE_LABELS[source]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink-red mb-1.5" aria-label={`${Math.min(5, Math.max(0, Math.round(review.rating) || 0))} out of 5 stars`}>
                  {"\u2605".repeat(Math.min(5, Math.max(0, Math.round(review.rating) || 0)))}
                </div>
                <p className="text-[13px] text-ink-cream/55 leading-[1.7]">
                  {review.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ReviewPanel.displayName = "ReviewPanel";

export { ReviewPanel };
