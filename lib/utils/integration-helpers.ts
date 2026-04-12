import type {
  IntegrationPlatform,
  IntegrationRecord,
  StudioIntegrations,
  IntegrationFeature,
} from "@/lib/types/integrations";
import type { TierSlug } from "@/lib/types";
import { getPlatformMeta } from "@/lib/data/integration-platforms";

// ─── Tier gating ────────────────────────────────────────────────────────────

const TIER_ORDER: Record<TierSlug, number> = { liner: 0, shader: 1, magnum: 2 };

const FEATURE_MIN_TIER: Record<IntegrationFeature, TierSlug> = {
  "link": "liner",
  "google-autofill": "liner",
  "review-badges": "liner",
  "booking-connect": "shader",
  "client-import": "magnum",
  "pos-connect": "magnum",
};

export function tierMeetsRequirement(userTier: TierSlug | null, required: TierSlug): boolean {
  if (!userTier) return false;
  return TIER_ORDER[userTier] >= TIER_ORDER[required];
}

export function isFeatureAvailable(userTier: TierSlug | null, feature: IntegrationFeature): boolean {
  return tierMeetsRequirement(userTier, FEATURE_MIN_TIER[feature]);
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
  return record.status === "linked" || record.status === "connected" || record.status === "syncing";
}

export function countActiveIntegrations(integrations: StudioIntegrations | undefined): number {
  if (!integrations) return 0;
  return Object.values(integrations).filter((r) => r && isIntegrationActive(r)).length;
}

// ─── Merge helpers for optimistic updates ───────────────────────────────────

export function makeIntegrationUpdate(
  current: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
  record: IntegrationRecord,
): { integrations: StudioIntegrations } {
  return {
    integrations: { ...(current ?? {}), [platform]: record },
  };
}

export function createLinkRecord(url: string): IntegrationRecord {
  return {
    status: "linked",
    linkUrl: url,
    linkedAt: new Date().toISOString(),
  };
}

export function removeIntegration(
  current: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
): { integrations: StudioIntegrations } {
  const next = { ...(current ?? {}) };
  delete next[platform];
  return { integrations: next };
}
