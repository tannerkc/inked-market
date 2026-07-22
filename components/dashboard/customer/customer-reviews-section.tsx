"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GroupLabel } from "@/components/dashboard/group-label";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { ListGroup } from "@/components/dashboard/list-group";
import { ListRow } from "@/components/dashboard/list-row";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";
import type { Review, Appointment } from "@/lib/types";

interface CustomerReviewsSectionProps {
  reviews: Review[];
  pendingReviews: Appointment[];
  className?: string;
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
                <GroupLabel>Awaiting Your Review</GroupLabel>
                <ListGroup>
                  {pendingReviews.map((appt) => (
                    <ListRow key={appt.id} interactive>
                      <InitialsAvatar name={appt.artistName} tone="accent" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium truncate text-ink-black dark:text-ink-cream">
                          {appt.artistName}
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] text-ink-black/25 dark:text-ink-cream/25">
                          {formatDate(appt.date)}
                        </p>
                      </div>
                      <button className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer flex-shrink-0">
                        Write Review
                      </button>
                    </ListRow>
                  ))}
                </ListGroup>
              </div>
            )}

            {reviews.length > 0 && (
              <div>
                <GroupLabel>Your Reviews</GroupLabel>
                <ListGroup>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="px-3 py-2.5 transition-colors hover:bg-ink-black/[0.03] dark:hover:bg-ink-cream/[0.03]"
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
                </ListGroup>
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
