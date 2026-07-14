"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { BookingRequestRecord, RequestStatus } from "@/lib/types/booking";

const STATUS_CONFIG: Record<RequestStatus, { color: (typeof BADGE_COLORS)[keyof typeof BADGE_COLORS]; label: string }> = {
  pending: { color: BADGE_COLORS.rust, label: "Pending" },
  accepted: { color: BADGE_COLORS.sage, label: "Accepted" },
  declined: { color: BADGE_COLORS.red, label: "Declined" },
  expired: { color: BADGE_COLORS.muted, label: "Expired" },
  withdrawn: { color: BADGE_COLORS.muted, label: "Withdrawn" },
};

function RequestRow({
  request,
  onSelect,
}: {
  request: BookingRequestRecord;
  onSelect: (r: BookingRequestRecord) => void;
}) {
  const status = effectiveRequestStatus(request, new Date());
  const config = STATUS_CONFIG[status];
  return (
    <button
      type="button"
      onClick={() => onSelect(request)}
      className="flex w-full items-start gap-3 border-b py-3 text-left transition-colors border-ink-black/[0.04] hover:bg-ink-black/[0.04] dark:border-ink-cream/[0.04] dark:hover:bg-ink-cream/[0.04]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
          {request.customerName ?? "Customer"}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] text-ink-black/35 dark:text-ink-cream/35">
          {request.description}
        </p>
        <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] text-ink-black/25 dark:text-ink-cream/25">
          {request.sizeCategory ? <span>{request.sizeCategory}</span> : null}
          {request.budgetRange ? <span>{request.budgetRange}</span> : null}
          {request.isMultiSession ? <span>multi-session</span> : null}
        </div>
      </div>
      <StatusBadge label={config.label} color={config.color} />
    </button>
  );
}

interface ArtistRequestsSectionProps {
  pending: BookingRequestRecord[];
  others: BookingRequestRecord[];
  loading: boolean;
  onSelect: (r: BookingRequestRecord) => void;
}

export function ArtistRequestsSection({
  pending,
  others,
  loading,
  onSelect,
}: ArtistRequestsSectionProps) {
  const title = pending.length > 0 ? `Booking Requests (${pending.length} new)` : "Booking Requests";
  return (
    <DashboardSection title={title}>
      {loading ? (
        <p className="py-4 text-[12px] text-ink-black/40 dark:text-ink-cream/40">Loading...</p>
      ) : pending.length === 0 && others.length === 0 ? (
        <EmptyState message="No requests yet" description="Requests land here when clients find you" />
      ) : (
        <div>
          {pending.map((r) => (
            <RequestRow key={r.id} request={r} onSelect={onSelect} />
          ))}
          {others.slice(0, 5).map((r) => (
            <RequestRow key={r.id} request={r} onSelect={onSelect} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
