"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { ListGroup } from "@/components/dashboard/list-group";
import { ListRow } from "@/components/dashboard/list-row";
import { REQUEST_STATUS_CONFIG } from "@/components/booking/request-status";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BookingRequest } from "@/lib/types";

interface CustomerBookingRequestsSectionProps {
  requests: BookingRequest[];
  onSelect?: (id: string) => void;
  className?: string;
}

const CustomerBookingRequestsSection = React.forwardRef<
  HTMLDivElement,
  CustomerBookingRequestsSectionProps
>(({ requests, onSelect, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    <DashboardSection title="Booking Requests">
      {requests.length === 0 ? (
        <EmptyState
          message="No booking requests"
          description="Find an artist and submit a consultation"
        />
      ) : (
        <ListGroup>
          {requests.map((request) => {
            const config = REQUEST_STATUS_CONFIG[request.status];

            return (
              <ListRow
                key={request.id}
                align="start"
                onClick={() => onSelect?.(request.id)}
              >
                <InitialsAvatar
                  name={request.artistName}
                  tone={request.status === "pending" ? "accent" : "muted"}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium truncate text-ink-black dark:text-ink-cream">
                        {request.artistName}
                      </p>
                      {request.studioName ? (
                        <p className="text-[11px] truncate text-ink-black/40 dark:text-ink-cream/40">
                          {request.studioName}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge
                      label={config.label}
                      color={config.color}
                      className="shrink-0"
                    />
                  </div>

                  <p className="text-[11px] mt-1 line-clamp-2 text-ink-black/35 dark:text-ink-cream/35">
                    {request.summary}
                  </p>

                  {request.requestedDate ? (
                    <p className="font-mono text-[9px] mt-1.5 text-ink-black/25 dark:text-ink-cream/25">
                      Requested: {formatDate(request.requestedDate)}
                    </p>
                  ) : null}
                  {request.flexibleDates && !request.requestedDate ? (
                    <p className="font-mono text-[9px] mt-1.5 text-ink-black/25 dark:text-ink-cream/25">
                      Flexible dates
                    </p>
                  ) : null}
                </div>
              </ListRow>
            );
          })}
        </ListGroup>
      )}
    </DashboardSection>
  </div>
));
CustomerBookingRequestsSection.displayName = "CustomerBookingRequestsSection";

export { CustomerBookingRequestsSection };
export type { CustomerBookingRequestsSectionProps };
