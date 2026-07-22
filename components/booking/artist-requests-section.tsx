"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GroupLabel } from "@/components/dashboard/group-label";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { ListGroup } from "@/components/dashboard/list-group";
import { ListRow } from "@/components/dashboard/list-row";
import { MetaChip } from "@/components/ui/meta-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import { REQUEST_STATUS_CONFIG } from "./request-status";
import type { BookingRequestRecord } from "@/lib/types/booking";

function expiryLabel(expiresAt: string): { label: string; urgent: boolean } | null {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.ceil(ms / 3_600_000);
  if (hours <= 24) return { label: `Expires in ${hours}h`, urgent: true };
  const days = Math.ceil(hours / 24);
  // ponytail: 2-day urgency threshold is a guess; tune once real response-time data exists
  return { label: `Expires in ${days}d`, urgent: days <= 2 };
}

function MetaChips({ request }: { request: BookingRequestRecord }) {
  const chips = [
    request.placement,
    request.sizeCategory,
    request.budgetRange,
    request.isMultiSession ? "multi-session" : null,
  ].filter(Boolean) as string[];
  if (chips.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {chips.map((chip) => (
        <MetaChip key={chip}>{chip.replace(/-/g, " ")}</MetaChip>
      ))}
    </div>
  );
}

function ReferenceThumbs({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex shrink-0 items-center -space-x-2">
      {urls.slice(0, 2).map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt="Reference"
          className="h-8 w-8 rounded-lg border object-cover border-ink-cream dark:border-ink-black"
        />
      ))}
      {urls.length > 2 ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[9px] border-ink-black/[0.08] bg-ink-black/[0.04] text-ink-black/50 dark:border-ink-cream/[0.08] dark:bg-ink-cream/[0.04] dark:text-ink-cream/50">
          +{urls.length - 2}
        </span>
      ) : null}
    </div>
  );
}

function PendingRequestCard({
  request,
  onSelect,
}: {
  request: BookingRequestRecord;
  onSelect: (r: BookingRequestRecord) => void;
}) {
  const expiry = expiryLabel(request.expiresAt);
  return (
    <button
      type="button"
      onClick={() => onSelect(request)}
      className="group w-full rounded-[14px] border p-3 text-left transition-colors border-ink-black/[0.07] bg-ink-black/[0.02] hover:border-ink-rust/25 hover:bg-ink-rust/[0.03] dark:border-ink-cream/[0.07] dark:bg-ink-cream/[0.02] dark:hover:border-ink-rust/30"
    >
      <div className="flex items-start gap-3">
        <InitialsAvatar name={request.customerName ?? "Customer"} size="md" tone="accent" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
              {request.customerName ?? "Customer"}
            </p>
            {expiry ? (
              <span
                className={`shrink-0 font-mono text-[9px] tracking-[0.05em] ${
                  expiry.urgent
                    ? "text-ink-rust"
                    : "text-ink-black/35 dark:text-ink-cream/35"
                }`}
              >
                {expiry.label}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-start gap-2">
            <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-ink-black/50 dark:text-ink-cream/50">
              {request.description}
            </p>
            <ReferenceThumbs urls={request.referenceImageUrls} />
          </div>
          <MetaChips request={request} />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30">
              {formatRelativeTime(new Date(request.createdAt))}
            </span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase transition-colors text-ink-rust/70 group-hover:text-ink-rust">
              Review &rarr;
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ResolvedRequestRow({
  request,
  onSelect,
}: {
  request: BookingRequestRecord;
  onSelect: (r: BookingRequestRecord) => void;
}) {
  const status = effectiveRequestStatus(request, new Date());
  const config = REQUEST_STATUS_CONFIG[status];
  return (
    <ListRow onClick={() => onSelect(request)}>
      <InitialsAvatar name={request.customerName ?? "Customer"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-ink-black/70 dark:text-ink-cream/70">
          {request.customerName ?? "Customer"}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-ink-black/35 dark:text-ink-cream/35">
          {request.description}
        </p>
      </div>
      <span className="shrink-0 font-mono text-[9px] text-ink-black/25 dark:text-ink-cream/25">
        {formatRelativeTime(new Date(request.createdAt))}
      </span>
      <StatusBadge label={config.label} color={config.color} />
    </ListRow>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-[14px] border p-3 border-ink-black/[0.05] dark:border-ink-cream/[0.05]"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-ink-black/[0.05] dark:bg-ink-cream/[0.05]" />
            <div className="flex-1 space-y-2 py-0.5">
              <div className="h-2.5 w-1/3 rounded bg-ink-black/[0.05] dark:bg-ink-cream/[0.05]" />
              <div className="h-2 w-4/5 rounded bg-ink-black/[0.04] dark:bg-ink-cream/[0.04]" />
            </div>
          </div>
        </div>
      ))}
    </div>
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
  const urgentFirst = [...pending].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  );
  return (
    <DashboardSection title={title}>
      {loading ? (
        <LoadingSkeleton />
      ) : pending.length === 0 && others.length === 0 ? (
        <EmptyState
          message="No booking requests yet"
          description="New client requests land here the moment they arrive"
        />
      ) : (
        <div>
          {urgentFirst.length > 0 ? (
            <div className="mb-4">
              <GroupLabel>Needs response</GroupLabel>
              <div className="space-y-2">
                {urgentFirst.map((r) => (
                  <PendingRequestCard key={r.id} request={r} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ) : null}
          {others.length > 0 ? (
            <div>
              <GroupLabel>Recent</GroupLabel>
              <ListGroup>
                {others.slice(0, 5).map((r) => (
                  <ResolvedRequestRow key={r.id} request={r} onSelect={onSelect} />
                ))}
              </ListGroup>
            </div>
          ) : null}
        </div>
      )}
    </DashboardSection>
  );
}
