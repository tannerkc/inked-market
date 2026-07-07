"use client";

import { useMemo } from "react";
import type { StudioThemeConfig } from "@/lib/types/builder";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { useBuilder } from "@/components/builder/builder-provider";
import { hasBio, hasPhotos, hasHours, hasContact, hasAnySocial } from "@/lib/utils/studio-content";

export interface SetupItem {
  id: "story" | "photos" | "contact-hours" | "socials" | "booking" | "policies" | "artists";
  label: string;
  done: boolean;
  optional?: boolean;
  /** Content-panel deep-link target. */
  group: ContentGroup;
  /** Preview scroll target (data-section id). */
  sectionId: string;
}

/**
 * Pure derivation — shares the sections' own predicates so the checklist can
 * never disagree with what the preview renders. Exported for the check script.
 */
export function computeSetupItems(
  data: StudioSiteData,
  config: StudioThemeConfig,
  rosterCount: number,
): SetupItem[] {
  return [
    { id: "story", label: "Tell your story", done: hasBio(data), group: "story", sectionId: "about" },
    { id: "photos", label: "Add photos", done: hasPhotos(data), group: "photos", sectionId: "gallery" },
    { id: "contact-hours", label: "Hours & contact", done: hasContact(data) && hasHours(data), group: "contact-hours", sectionId: "details" },
    { id: "socials", label: "Social links", done: hasAnySocial(data), group: "socials", sectionId: "footer" },
    { id: "booking", label: "Booking link", done: Boolean(data.bookingLink), group: "booking", sectionId: "details" },
    { id: "policies", label: "Studio policies", done: (config.policies ?? []).some((p) => p.enabled), group: "booking", sectionId: "policies" },
    { id: "artists", label: "Artist roster", done: rosterCount > 0, optional: true, group: "artists", sectionId: "artist-strips" },
  ];
}

export function useSetupProgress() {
  const { siteData, config, liveContent } = useBuilder();
  return useMemo(() => {
    const items = computeSetupItems(siteData, config, liveContent.artists.length);
    const required = items.filter((i) => !i.optional);
    const requiredDone = required.filter((i) => i.done).length;
    return {
      items,
      requiredDone,
      requiredTotal: required.length,
      ready: requiredDone === required.length,
    };
  }, [siteData, config, liveContent.artists.length]);
}
