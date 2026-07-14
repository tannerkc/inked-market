"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn, formatDate } from "@/lib/utils";
import type { Review, Appointment } from "@/lib/types";

interface CustomerReviewsSectionProps {
  reviews: Review[];
  pendingReviews: Appointment[];
  className?: string;
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
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
}

function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

const CustomerReviewsSection = React.forwardRef<
  HTMLDivElement,
  CustomerReviewsSectionProps
>(({ reviews, pendingReviews, className, ...props }, ref) => {
  const isEmpty = reviews.length === 0 && pendingReviews.length === 0;

  return (
    <div ref={ref} className={className} {...props}>
      <DashboardSection title="Reviews">
        {isEmpty ? (
          <EmptyState
            message="No reviews yet"
            description="Complete an appointment to leave a review"
          />
        ) : (
          <div className="space-y-4">
            {pendingReviews.length > 0 && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2 text-ink-black/25 dark:text-ink-cream/25">
                  Awaiting Your Review
                </p>
                <div className="space-y-1.5">
                  {pendingReviews.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors bg-ink-black/[0.03] hover:bg-ink-black/[0.04] dark:bg-ink-cream/[0.03] dark:hover:bg-ink-cream/[0.04]"
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] truncate text-ink-black dark:text-ink-cream">
                          {appt.artistName}
                        </p>
                        <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">
                          {formatDate(appt.date)}
                        </p>
                      </div>
                      <button className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer flex-shrink-0">
                        Write Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2 text-ink-black/25 dark:text-ink-cream/25">
                  Your Reviews
                </p>
                <div className="space-y-1.5">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="py-2.5 px-3 rounded-lg transition-colors bg-ink-black/[0.03] hover:bg-ink-black/[0.04] dark:bg-ink-cream/[0.03] dark:hover:bg-ink-cream/[0.04]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating
                          rating={review.rating}
                          className="text-ink-rust dark:text-ink-rust/70"
                        />
                        <span className="font-mono text-[9px] tracking-[0.1em] uppercase rounded-full px-1.5 py-0.5 bg-ink-black/[0.06] text-ink-black/35 dark:bg-ink-cream/[0.06] dark:text-ink-cream/35">
                          {review.targetType}
                        </span>
                      </div>
                      <p className="text-[12px] font-semibold text-ink-black dark:text-ink-cream">
                        {review.title}
                      </p>
                      <p className="text-[11px] line-clamp-2 mt-0.5 text-ink-black/40 dark:text-ink-cream/40">
                        {review.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-ink-black/20 dark:text-ink-cream/20">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerReviewsSection.displayName = "CustomerReviewsSection";

export { CustomerReviewsSection };
export type { CustomerReviewsSectionProps };
