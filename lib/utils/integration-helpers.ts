import type {
  IntegrationPlatform,
  IntegrationRecord,
  IntegrationMode,
  StudioIntegrations,
} from "@/lib/types/integrations";
import type { TierSlug } from "@/lib/types";
import { getPlatformMeta } from "@/lib/data/integration-platforms";

// ─── Tier gating ────────────────────────────────────────────────────────────

export const TIER_ORDER: Record<TierSlug, number> = { liner: 0, shader: 1, magnum: 2 };

export function tierMeetsRequirement(userTier: TierSlug | null, required: TierSlug): boolean {
  if (!userTier) return false;
  return TIER_ORDER[userTier] >= TIER_ORDER[required];
}

// ─── URL validation ─────────────────────────────────────────────────────────

export function isValidIntegrationUrl(platform: IntegrationPlatform, url: string): boolean {
  const meta = getPlatformMeta(platform);
  if (!meta) return false;
  try {
    new URL(url);
    return meta.urlPattern.test(url);
  } catch {
    return false;
  }
}

// ─── Status helpers ─────────────────────────────────────────────────────────

export function getIntegrationRecord(
  integrations: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
): IntegrationRecord {
  return integrations?.[platform] ?? { status: "not-connected" };
}

export function isIntegrationActive(record: IntegrationRecord): boolean {
  return record.status === "connected" || record.status === "syncing";
}

export function countActiveIntegrations(integrations: StudioIntegrations | undefined): number {
  if (!integrations) return 0;
  return Object.values(integrations).filter((r) => r && isIntegrationActive(r)).length;
}

// ─── Connection helpers ─────────────────────────────────────────────────────

export function connectIntegration(
  current: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
  mode: IntegrationMode,
  url: string,
  importSummary?: { count: number; label: string },
): { integrations: StudioIntegrations } {
  const record: IntegrationRecord = {
    status: "connected",
    mode,
    linkUrl: url,
    connectedAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    importedCount: importSummary?.count,
    importedLabel: importSummary?.label,
  };
  return {
    integrations: { ...(current ?? {}), [platform]: record },
  };
}

export function disconnectIntegration(
  current: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
): { integrations: StudioIntegrations } {
  const next = { ...(current ?? {}) };
  delete next[platform];
  return { integrations: next };
}
