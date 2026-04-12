"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { IntegrationPlatformMeta, IntegrationRecord } from "@/lib/types/integrations";

interface StudioIntegrationRowProps {
  platform: IntegrationPlatformMeta;
  record: IntegrationRecord;
  locked: boolean;
  lockedTierLabel?: string;
  onLink: () => void;
  onUnlink: () => void;
}

export function StudioIntegrationRow({
  platform,
  record,
  locked,
  lockedTierLabel,
  onLink,
  onUnlink,
}: StudioIntegrationRowProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        locked && "opacity-40 pointer-events-none"
      )}
    >
      {/* Left: name + description */}
      <div className="flex-1 min-w-0 mr-3">
        <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
          {platform.name}
        </p>
        <p className={cn("text-[10px]", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
          {platform.description}
        </p>
        {record.status === "linked" && record.linkUrl && (
          <p className={cn("text-[9px] truncate max-w-[220px] mt-0.5", isDark ? "text-ink-sage/50" : "text-ink-sage/70")}>
            {record.linkUrl}
          </p>
        )}
      </div>

      {/* Right: action / status */}
      <div className="flex items-center gap-2 shrink-0">
        {locked && lockedTierLabel && (
          <StatusBadge label={lockedTierLabel} color={BADGE_COLORS.muted} />
        )}

        {!locked && record.status === "not-connected" && (
          <>
            <Button
              variant={isDark ? "ink-light-outline" : "ink-outline"}
              size="sm"
              onClick={onLink}
              className="text-[10px] h-7 px-3"
            >
              Link
            </Button>
            {platform.supportsConnect && (
              <span className={cn(
                "font-mono text-[8px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md",
                isDark ? "bg-ink-cream/[0.04] text-ink-cream/20" : "bg-ink-black/[0.04] text-ink-black/20"
              )}>
                Connect Soon
              </span>
            )}
          </>
        )}

        {!locked && record.status === "linked" && (
          <>
            <StatusBadge label="Linked" color={BADGE_COLORS.sage} />
            <button
              type="button"
              onClick={onUnlink}
              className={cn(
                "font-mono text-[8px] tracking-[0.1em] uppercase transition-colors cursor-pointer",
                isDark ? "text-ink-cream/20 hover:text-ink-red" : "text-ink-black/20 hover:text-ink-rust"
              )}
            >
              Unlink
            </button>
          </>
        )}

        {!locked && record.status === "connected" && (
          <StatusBadge label="Connected" color={BADGE_COLORS.sage} />
        )}

        {!locked && record.status === "syncing" && (
          <StatusBadge label="Syncing" color={BADGE_COLORS.rust} />
        )}

        {!locked && record.status === "error" && (
          <StatusBadge label="Error" color={BADGE_COLORS.red} />
        )}
      </div>
    </div>
  );
}
