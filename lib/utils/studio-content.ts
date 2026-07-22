import type { StudioIntegrations, IntegrationPlatform, IntegrationPlatformMeta } from "@/lib/types/integrations";
import type { HeroLayout, StudioThemeConfig } from "@/lib/types/builder";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import { getPlatformsByCategory } from "@/lib/data/integration-platforms";
import { isIntegrationActive } from "@/lib/utils/integration-helpers";
import {
  parseHttpUrl,
  urlHostMatches,
  googleWriteReviewUrl,
  yelpWriteReviewUrl,
  trustpilotWriteReviewUrl,
} from "@/lib/utils/external-links";

/**
 * Single source of truth for "does this studio have X content?".
 * Consumed by the site sections (empty states) AND useSetupProgress —
 * keeping the checklist and the preview incapable of disagreeing.
 */

/** The one selection point for the active booking platform, so the CTA link
 * and the embedded widget can never disagree about which provider is live. */
function getActiveBooking(
  integrations: StudioIntegrations | undefined,
): { platform: IntegrationPlatformMeta; url: string } | null {
  if (!integrations) return null;
  for (const platform of getPlatformsByCategory("booking")) {
    const record = integrations[platform.id];
    if (record && isIntegrationActive(record) && record.linkUrl) {
      return { platform, url: record.linkUrl };
    }
  }
  return null;
}

export function getBookingLink(
  integrations: StudioIntegrations | undefined,
): { url: string; platformName: string } | null {
  const active = getActiveBooking(integrations);
  return active ? { url: active.url, platformName: active.platform.name } : null;
}

/**
 * Iframe src for the active booking platform — only when the vendor officially
 * supports bare-iframe embedding AND the stored URL is https on the vendor's
 * own hosts. Anything else (link-out vendors, tampered URLs) returns null and
 * the UI falls back to the plain booking link.
 */
export function getBookingEmbed(
  integrations: StudioIntegrations | undefined,
): { src: string; platformName: string } | null {
  const active = getActiveBooking(integrations);
  if (!active?.platform.embed) return null;
  const url = parseHttpUrl(active.url);
  if (!url || url.protocol !== "https:") return null;
  if (!active.platform.embed.hosts.some((host) => urlHostMatches(url, host))) return null;
  return { src: url.toString(), platformName: active.platform.name };
}

export interface ReviewProfileLink {
  platform: IntegrationPlatform;
  name: string;
  /** The studio's public profile on the review platform. */
  url: string;
  /** Direct "write a review" deep link, when derivable for the platform. */
  writeReviewUrl?: string;
}

/** Connected review-platform profiles (Google, Yelp, Trustpilot, Facebook),
 * with write-a-review deep links derived where each vendor supports one. */
export function getReviewProfileLinks(
  integrations: StudioIntegrations | undefined,
  googlePlaceId?: string,
): ReviewProfileLink[] {
  const links: ReviewProfileLink[] = [];
  if (!integrations) return links;
  for (const platform of getPlatformsByCategory("reviews")) {
    const record = integrations[platform.id];
    if (!record || !isIntegrationActive(record) || !record.linkUrl) continue;
    const url = parseHttpUrl(record.linkUrl);
    if (!url) continue;
    const href = url.toString();
    let writeReviewUrl: string | undefined;
    if (platform.id === "google" && googlePlaceId) writeReviewUrl = googleWriteReviewUrl(googlePlaceId);
    else if (platform.id === "yelp") writeReviewUrl = yelpWriteReviewUrl(href) ?? undefined;
    else if (platform.id === "trustpilot") writeReviewUrl = trustpilotWriteReviewUrl(href) ?? undefined;
    links.push({ platform: platform.id, name: platform.name, url: href, writeReviewUrl });
  }
  return links;
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

/** Hero layouts whose signature is a multi-photo collage (Studio Minimal grid, Gutter Punk zine). */
export function supportsMultiCover(heroLayout: HeroLayout | undefined): boolean {
  return heroLayout === "grid-overlay" || heroLayout === "zine";
}

/**
 * Photo order for multi-photo heroes. Single-cover mode: the cover photo leads
 * and the gallery fills the remaining tiles. Multi-cover mode: dedicated cover
 * photos lead, then the single cover + gallery fill the rest. Always deduped.
 */
export function heroCollagePhotos(
  data: Pick<StudioSiteData, "images" | "coverImage" | "coverImages">,
  config: Pick<StudioThemeConfig, "heroCoverMode">,
): string[] {
  const base = data.coverImage
    ? [data.coverImage, ...data.images.filter((src) => src !== data.coverImage)]
    : data.images;
  if (config.heroCoverMode !== "multi") return base;
  return [...data.coverImages, ...base.filter((src) => !data.coverImages.includes(src))];
}
