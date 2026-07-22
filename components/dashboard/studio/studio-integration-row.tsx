"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import type { IntegrationPlatformMeta, IntegrationRecord, IntegrationMode } from "@/lib/types/integrations";

interface StudioIntegrationRowProps {
  platform: IntegrationPlatformMeta;
  record: IntegrationRecord;
  onConnect: (mode: IntegrationMode | "oauth") => void;
  onDisconnect: () => void;
  onImport?: () => void;
  importing?: boolean;
}

export function StudioIntegrationRow({
  platform,
  record,
  onConnect,
  onDisconnect,
  onImport,
  importing,
}: StudioIntegrationRowProps) {
  const isActive = record.status === "connected" || record.status === "syncing";
  const isOauthConnection = Boolean(platform.oauth && record.accountName);

  return (
    <div className="py-3.5">
      {/* Top: name + status */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
          {platform.name}
        </p>
        {isActive && record.mode ? (
          <div className="flex items-center gap-2">
            <StatusBadge
              label={isOauthConnection ? "Linked" : record.mode === "import" ? "Importing" : "Integrated"}
              color={BADGE_COLORS.sage}
            />
            <button
              type="button"
              onClick={onDisconnect}
              className="font-mono text-[8px] tracking-[0.1em] uppercase transition-colors cursor-pointer text-ink-black/20 hover:text-ink-rust dark:text-ink-cream/20 dark:hover:text-ink-red"
            >
              Disconnect
            </button>
          </div>
        ) : null}
        {record.status === "error" ? (
          <StatusBadge label="Error" color={BADGE_COLORS.red} />
        ) : null}
      </div>

      {/* Description / linked account */}
      <p className="text-[10px] mb-2.5 text-ink-black/25 dark:text-ink-cream/25">
        {isActive && record.accountName ? `Linked as ${record.accountName}` : platform.description}
      </p>

      {/* Error detail */}
      {record.status === "error" && record.errorMessage ? (
        <p className="text-[10px] mb-2.5 text-ink-red/70">{record.errorMessage}</p>
      ) : null}

      {/* Import summary when connected */}
      {isActive && record.importedCount != null ? (
        <p className="text-[10px] mb-2.5 text-ink-sage/70 dark:text-ink-sage/50">
          {record.importedCount} {record.importedLabel ?? "items"} imported
        </p>
      ) : null}

      {/* Data pull for linked accounts (Square hours, Instagram photos) */}
      {isActive && isOauthConnection && platform.oauthImportLabel && onImport ? (
        <Button
          variant="ink-outline"
          size="sm"
          onClick={onImport}
          disabled={importing}
          className="text-[10px] h-7 px-3"
        >
          {importing ? "Syncing…" : platform.oauthImportLabel}
        </Button>
      ) : null}

      {/* Actions when not connected */}
      {record.status === "not-connected" ? (
        <div className="flex items-center gap-2">
          {platform.oauth ? (
            <>
              <Button
                variant="ink-outline"
                size="sm"
                onClick={() => onConnect("oauth")}
                className="text-[10px] h-7 px-3"
              >
                Connect account
              </Button>
              {platform.integrateLabel ? (
                <Button
                  variant="ink-ghost"
                  size="sm"
                  onClick={() => onConnect("integrate")}
                  className="text-[10px] h-7 px-3 text-ink-black/30 dark:text-ink-cream/30"
                >
                  Paste link
                </Button>
              ) : null}
            </>
          ) : (
            <>
              {platform.importLabel ? (
                <Button
                  variant="ink-outline"
                  size="sm"
                  onClick={() => onConnect("import")}
                  className="text-[10px] h-7 px-3"
                >
                  Import
                </Button>
              ) : null}
              {platform.integrateLabel ? (
                <Button
                  variant="ink-ghost"
                  size="sm"
                  onClick={() => onConnect("integrate")}
                  className="text-[10px] h-7 px-3 text-ink-black/30 dark:text-ink-cream/30"
                >
                  Integrate
                </Button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
