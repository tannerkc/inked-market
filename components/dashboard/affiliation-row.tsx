"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusBadgeColor } from "@/components/ui/status-badge";
import { AffiliationStatus } from "@/lib/types";

interface AffiliationRowProps {
  name: string;
  avatarUrl?: string;
  avatarShape?: "circle" | "rounded";
  subtitle?: string;
  status: AffiliationStatus;
  onAccept?: () => void;
  onDecline?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

// Status color lives in the border/tint; text stays neutral so the 8px caps
// hold WCAG AA contrast in both modes.
const statusBadgeStyles: Record<AffiliationStatus, { color: StatusBadgeColor; label: string }> = {
  "pending-invite": {
    color: {
      light: "border-ink-rust/25 bg-ink-rust/[0.06] text-ink-black/70",
      dark: "border-ink-red/30 bg-ink-red/[0.08] text-ink-cream/70",
    },
    label: "Pending",
  },
  "pending-request": {
    color: {
      light: "border-ink-red/25 bg-ink-red/[0.06] text-ink-black/70",
      dark: "border-ink-red/30 bg-ink-red/[0.08] text-ink-cream/70",
    },
    label: "Wants to join",
  },
  active: {
    color: {
      light: "border-ink-sage/30 bg-ink-sage/[0.08] text-ink-black/70",
      dark: "border-ink-sage/40 bg-ink-sage/[0.14] text-ink-cream/70",
    },
    label: "Active",
  },
};

const AffiliationRow = React.forwardRef<HTMLDivElement, AffiliationRowProps>(
  (
    {
      name,
      avatarUrl,
      avatarShape = "circle",
      subtitle,
      status,
      onAccept,
      onDecline,
      onAction,
      actionLabel,
      className,
      ...props
    },
    ref
  ) => {
    const badge = statusBadgeStyles[status];

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 transition-colors",
          "hover:bg-ink-black/[0.03] dark:hover:bg-ink-cream/[0.03]",
          className
        )}
        {...props}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-9 h-9 flex-shrink-0 flex items-center justify-center overflow-hidden",
            avatarShape === "circle" ? "rounded-full" : "rounded-lg",
            !avatarUrl && "border border-dashed border-ink-black/[0.15] dark:border-ink-cream/[0.15]"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[14px] leading-none select-none text-ink-black/30 dark:text-ink-cream/30">
              +
            </span>
          )}
        </div>

        {/* Name area */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate text-ink-black dark:text-ink-cream">
            {name}
          </p>
          {subtitle && (
            <p className="text-[10px] truncate text-ink-black/60 dark:text-ink-cream/60">
              {subtitle}
            </p>
          )}
        </div>

        {/* Status badge */}
        <StatusBadge label={badge.label} color={badge.color} className="px-2.5 flex-shrink-0" />

        {/* Right side actions */}
        {status === "pending-request" && (onAccept || onDecline) ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            {onAccept && (
              <button
                type="button"
                onClick={onAccept}
                className="text-ink-rust font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer"
              >
                Accept
              </button>
            )}
            {onDecline && (
              <button
                type="button"
                onClick={onDecline}
                className="font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer text-ink-black/60 hover:text-ink-black dark:text-ink-cream/60 dark:hover:text-ink-cream"
              >
                Decline
              </button>
            )}
          </div>
        ) : onAction && actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="text-ink-rust font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer flex-shrink-0"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    );
  }
);
AffiliationRow.displayName = "AffiliationRow";

export { AffiliationRow };
