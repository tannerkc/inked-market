"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { IntegrationPlatformMeta, IntegrationRecord } from "@/lib/types/integrations";

interface StudioIntegrationRowProps {
  platform: IntegrationPlatformMeta;
  record: IntegrationRecord;
  onConnect: (mode: "integrate" | "import") => void;
  onDisconnect: () => void;
}

export function StudioIntegrationRow({
  platform,
  record,
  onConnect,
  onDisconnect,
}: StudioIntegrationRowProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const isActive = record.status === "connected" || record.status === "syncing";

  return (
    <div className="py-3.5">
      {/* Top: name + status */}
      <div className="flex items-center justify-between mb-1">
        <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
          {platform.name}
        </p>
        {isActive && record.mode && (
          <div className="flex items-center gap-2">
            <StatusBadge
              label={record.mode === "import" ? "Importing" : "Integrated"}
              color={BADGE_COLORS.sage}
            />
            <button
              type="button"
              onClick={onDisconnect}
              className={cn(
                "font-mono text-[8px] tracking-[0.1em] uppercase transition-colors cursor-pointer",
                isDark ? "text-ink-cream/20 hover:text-ink-red" : "text-ink-black/20 hover:text-ink-rust"
              )}
            >
              Disconnect
            </button>
          </div>
        )}
        {record.status === "error" && (
          <StatusBadge label="Error" color={BADGE_COLORS.red} />
        )}
      </div>

      {/* Description */}
      <p className={cn("text-[10px] mb-2.5", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
        {platform.description}
      </p>

      {/* Import summary when connected */}
      {isActive && record.importedCount != null && (
        <p className={cn("text-[10px] mb-2.5", isDark ? "text-ink-sage/50" : "text-ink-sage/70")}>
          {record.importedCount} {record.importedLabel ?? "items"} imported
        </p>
      )}

      {/* Actions when not connected */}
      {record.status === "not-connected" && (
        <div className="flex items-center gap-2">
          {platform.importLabel && (
            <Button
              variant={isDark ? "ink-light-outline" : "ink-outline"}
              size="sm"
              onClick={() => onConnect("import")}
              className="text-[10px] h-7 px-3"
            >
              Import
            </Button>
          )}
          {platform.integrateLabel && (
            <Button
              variant="ink-ghost"
              size="sm"
              onClick={() => onConnect("integrate")}
              className={cn("text-[10px] h-7 px-3", isDark ? "text-ink-cream/30" : "text-ink-black/30")}
            >
              Integrate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
