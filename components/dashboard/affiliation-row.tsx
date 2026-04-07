"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
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

const statusBadgeStyles: Record<AffiliationStatus, { className: string; label: string }> = {
  "pending-invite": {
    className: "border-ink-rust/20 text-ink-rust/60",
    label: "Pending",
  },
  "pending-request": {
    className: "border-ink-red/20 text-ink-red/60",
    label: "Wants to join",
  },
  active: {
    className: "border-ink-sage/20 text-ink-sage/60",
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
    const { mode } = useTheme();
    const isDark = mode === "dark";

    const badge = statusBadgeStyles[status];

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 py-3 border-b",
          isDark ? "border-ink-cream/[0.04]" : "border-ink-black/[0.04]",
          className
        )}
        {...props}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-9 h-9 flex-shrink-0 flex items-center justify-center overflow-hidden",
            avatarShape === "circle" ? "rounded-full" : "rounded-lg",
            !avatarUrl &&
              cn(
                "border border-dashed",
                isDark ? "border-ink-cream/[0.15]" : "border-ink-black/[0.15]"
              )
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className={cn(
                "text-[14px] leading-none select-none",
                isDark ? "text-ink-cream/30" : "text-ink-black/30"
              )}
            >
              +
            </span>
          )}
        </div>

        {/* Name area */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-[13px] font-medium truncate",
              isDark ? "text-ink-cream" : "text-ink-black"
            )}
          >
            {name}
          </p>
          {subtitle && (
            <p
              className={cn(
                "text-[10px] truncate",
                isDark ? "text-ink-cream/40" : "text-ink-black/40"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full border flex-shrink-0",
            badge.className
          )}
        >
          {badge.label}
        </span>

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
                className={cn(
                  "font-mono text-[9px] tracking-[0.12em] uppercase cursor-pointer",
                  isDark ? "text-ink-cream/30" : "text-ink-black/30"
                )}
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
