"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDate } from "@/lib/utils";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import type { BookingRequest, BookingRequestStatus } from "@/lib/types";

interface CustomerBookingRequestsSectionProps {
  requests: BookingRequest[];
  className?: string;
}

const requestStatusConfig: Record<BookingRequestStatus, { color: typeof BADGE_COLORS[keyof typeof BADGE_COLORS]; label: string }> = {
  pending: { color: BADGE_COLORS.rust, label: "Pending" },
  accepted: { color: BADGE_COLORS.sage, label: "Accepted" },
  declined: { color: BADGE_COLORS.red, label: "Declined" },
  expired: { color: BADGE_COLORS.muted, label: "Expired" },
  withdrawn: { color: BADGE_COLORS.muted, label: "Withdrawn" },
};

const CustomerBookingRequestsSection = React.forwardRef<
  HTMLDivElement,
  CustomerBookingRequestsSectionProps
>(({ requests, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    <DashboardSection title="Booking Requests">
      {requests.length === 0 ? (
        <EmptyState
          message="No booking requests"
          description="Find an artist and submit a consultation"
        />
      ) : (
        <div>
          {requests.map((request) => {
            const config = requestStatusConfig[request.status];

            return (
              <div
                key={request.id}
                className="flex items-start gap-3 py-3 border-b transition-colors border-ink-black/[0.04] hover:bg-ink-black/[0.04] dark:border-ink-cream/[0.04] dark:hover:bg-ink-cream/[0.04]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate text-ink-black dark:text-ink-cream">
                    {request.artistName}
                  </p>
                  {request.studioName && (
                    <p className="text-[11px] truncate text-ink-black/40 dark:text-ink-cream/40">
                      {request.studioName}
                    </p>
                  )}

                  <p className="text-[11px] mt-1 line-clamp-2 text-ink-black/35 dark:text-ink-cream/35">
                    {request.summary}
                  </p>

                  {request.requestedDate && (
                    <p className="font-mono text-[10px] mt-1 text-ink-black/20 dark:text-ink-cream/20">
                      Requested: {formatDate(request.requestedDate)}
                    </p>
                  )}
                  {request.flexibleDates && !request.requestedDate && (
                    <p className="font-mono text-[10px] mt-1 text-ink-black/20 dark:text-ink-cream/20">
                      Flexible dates
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 pt-0.5">
                  <StatusBadge label={config.label} color={config.color} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  </div>
));
CustomerBookingRequestsSection.displayName = "CustomerBookingRequestsSection";

export { CustomerBookingRequestsSection };
export type { CustomerBookingRequestsSectionProps };
