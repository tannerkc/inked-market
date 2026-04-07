"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn, formatDate } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
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
};

const CustomerBookingRequestsSection = React.forwardRef<
  HTMLDivElement,
  CustomerBookingRequestsSectionProps
>(({ requests, className, ...props }, ref) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
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
                  className={cn(
                    "flex items-start gap-3 py-3 border-b transition-colors",
                    isDark
                      ? "border-ink-cream/[0.04] hover:bg-ink-cream/[0.04]"
                      : "border-ink-black/[0.04] hover:bg-ink-black/[0.04]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[12px] font-medium truncate",
                        isDark ? "text-ink-cream" : "text-ink-black"
                      )}
                    >
                      {request.artistName}
                    </p>
                    {request.studioName && (
                      <p
                        className={cn(
                          "text-[11px] truncate",
                          isDark ? "text-ink-cream/40" : "text-ink-black/40"
                        )}
                      >
                        {request.studioName}
                      </p>
                    )}

                    <p
                      className={cn(
                        "text-[11px] mt-1 line-clamp-2",
                        isDark ? "text-ink-cream/35" : "text-ink-black/35"
                      )}
                    >
                      {request.summary}
                    </p>

                    {request.requestedDate && (
                      <p
                        className={cn(
                          "font-mono text-[10px] mt-1",
                          isDark ? "text-ink-cream/20" : "text-ink-black/20"
                        )}
                      >
                        Requested: {formatDate(request.requestedDate)}
                      </p>
                    )}
                    {request.flexibleDates && !request.requestedDate && (
                      <p
                        className={cn(
                          "font-mono text-[10px] mt-1",
                          isDark ? "text-ink-cream/20" : "text-ink-black/20"
                        )}
                      >
                        Flexible dates
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 pt-0.5">
                    <StatusBadge
                      label={config.label}
                      color={config.color}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerBookingRequestsSection.displayName = "CustomerBookingRequestsSection";

export { CustomerBookingRequestsSection };
export type { CustomerBookingRequestsSectionProps };
