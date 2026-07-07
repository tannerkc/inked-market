import type { StudioIntegrations } from "@/lib/types/integrations";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import { getPlatformsByCategory } from "@/lib/data/integration-platforms";
import { isIntegrationActive } from "@/lib/utils/integration-helpers";

/**
 * Single source of truth for "does this studio have X content?".
 * Consumed by the site sections (empty states) AND useSetupProgress —
 * keeping the checklist and the preview incapable of disagreeing.
 */

export function getBookingLink(
  integrations: StudioIntegrations | undefined,
): { url: string; platformName: string } | null {
  if (!integrations) return null;
  for (const platform of getPlatformsByCategory("booking")) {
    const record = integrations[platform.id];
    if (record && isIntegrationActive(record) && record.linkUrl) {
      return { url: record.linkUrl, platformName: platform.name };
    }
  }
  return null;
}

export function hasBio(d: StudioSiteData): boolean {
  return Boolean(d.bio && d.bio.trim().length > 0);
}

export function hasHours(d: StudioSiteData): boolean {
  return Object.keys(d.hours ?? {}).length > 0;
}

export function hasAnySocial(d: StudioSiteData): boolean {
  return Boolean(d.instagram || d.tiktok || d.facebook || d.website);
}

export function hasContact(d: StudioSiteData): boolean {
  return Boolean(d.phone || d.email);
}

export function hasPhotos(d: StudioSiteData): boolean {
  return Boolean(d.coverImage) || (d.images?.length ?? 0) > 0;
}
