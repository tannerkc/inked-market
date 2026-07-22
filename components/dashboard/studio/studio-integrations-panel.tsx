"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { SectionLabel } from "@/components/ui/section-label";
import { ListGroup } from "@/components/dashboard/list-group";
import { StudioIntegrationRow } from "./studio-integration-row";
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
  onConnect: (platformId: IntegrationPlatform, mode: IntegrationMode | "oauth") => void;
  onDisconnect: (platformId: IntegrationPlatform) => void;
  onImport?: (platformId: IntegrationPlatform) => void;
  importingPlatform?: IntegrationPlatform | null;
  notice?: string | null;
}

export function StudioIntegrationsPanel({
  open,
  onClose,
  integrations,
  onConnect,
  onDisconnect,
  onImport,
  importingPlatform,
  notice,
}: StudioIntegrationsPanelProps) {
  return (
    <SlideOverPanel open={open} onClose={onClose} title="Integrations">
      <div className="space-y-8">
        {notice ? (
          <p
            role="status"
            className="rounded-[12px] border px-3.5 py-2.5 text-[11px] border-ink-black/[0.08] bg-ink-black/[0.03] text-ink-black/60 dark:border-ink-cream/[0.08] dark:bg-ink-cream/[0.03] dark:text-ink-cream/60"
          >
            {notice}
          </p>
        ) : null}
        {INTEGRATION_CATEGORIES.map((category) => {
          const platforms = getPlatformsByCategory(category.id);
          if (platforms.length === 0) return null;

          return (
            <div key={category.id}>
              <SectionLabel
                label={category.label}
                variant="muted"
                stretch
                className="mb-1"
              />
              <p className="text-[10px] mb-3 text-ink-black/20 dark:text-ink-cream/20">
                {category.description}
              </p>
              <ListGroup>
                {platforms.map((platform) => {
                  const record = getIntegrationRecord(integrations, platform.id);

                  return (
                    <div key={platform.id} className="px-4">
                      <StudioIntegrationRow
                        platform={platform}
                        record={record}
                        onConnect={(m) => onConnect(platform.id, m)}
                        onDisconnect={() => onDisconnect(platform.id)}
                        onImport={onImport ? () => onImport(platform.id) : undefined}
                        importing={importingPlatform === platform.id}
                      />
                    </div>
                  );
                })}
              </ListGroup>
            </div>
          );
        })}
      </div>
    </SlideOverPanel>
  );
}
