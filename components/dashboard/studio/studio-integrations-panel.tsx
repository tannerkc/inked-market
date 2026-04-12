"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { SectionLabel } from "@/components/ui/section-label";
import { StudioIntegrationRow } from "./studio-integration-row";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { getIntegrationRecord } from "@/lib/utils/integration-helpers";
import {
  INTEGRATION_CATEGORIES,
  getPlatformsByCategory,
} from "@/lib/data/integration-platforms";
import type { StudioIntegrations, IntegrationPlatform, IntegrationMode } from "@/lib/types/integrations";

interface StudioIntegrationsPanelProps {
  open: boolean;
  onClose: () => void;
  integrations: StudioIntegrations | undefined;
  onConnect: (platformId: IntegrationPlatform, mode: IntegrationMode) => void;
  onDisconnect: (platformId: IntegrationPlatform) => void;
}

export function StudioIntegrationsPanel({
  open,
  onClose,
  integrations,
  onConnect,
  onDisconnect,
}: StudioIntegrationsPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Integrations">
      <div className="space-y-8">
        {INTEGRATION_CATEGORIES.map((category) => {
          const platforms = getPlatformsByCategory(category.id);
          if (platforms.length === 0) return null;

          return (
            <div key={category.id}>
              <SectionLabel
                label={category.label}
                variant={isDark ? "dark-muted" : "parchment"}
                stretch
                className="mb-1"
              />
              <p className={cn(
                "text-[10px] mb-3",
                isDark ? "text-ink-cream/20" : "text-ink-black/20"
              )}>
                {category.description}
              </p>
              <div className={cn(
                "rounded-[16px] border divide-y overflow-hidden",
                isDark
                  ? "border-ink-cream/[0.06] bg-ink-cream/[0.02] divide-ink-cream/[0.04]"
                  : "border-ink-black/[0.06] bg-ink-black/[0.02] divide-ink-black/[0.04]"
              )}>
                {platforms.map((platform) => {
                  const record = getIntegrationRecord(integrations, platform.id);

                  return (
                    <div key={platform.id} className="px-4">
                      <StudioIntegrationRow
                        platform={platform}
                        record={record}
                        onConnect={(m) => onConnect(platform.id, m)}
                        onDisconnect={() => onDisconnect(platform.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SlideOverPanel>
  );
}
