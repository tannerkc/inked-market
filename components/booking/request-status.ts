import { BADGE_COLORS, type StatusBadgeColor } from "@/components/ui/status-badge";
import type { RequestStatus } from "@/lib/types/booking";

/** Single source for booking-request status → badge presentation (artist + customer surfaces). */
export const REQUEST_STATUS_CONFIG: Record<RequestStatus, { color: StatusBadgeColor; label: string }> = {
  pending: { color: BADGE_COLORS.rust, label: "Pending" },
  accepted: { color: BADGE_COLORS.sage, label: "Accepted" },
  declined: { color: BADGE_COLORS.red, label: "Declined" },
  expired: { color: BADGE_COLORS.muted, label: "Expired" },
  withdrawn: { color: BADGE_COLORS.muted, label: "Withdrawn" },
};
