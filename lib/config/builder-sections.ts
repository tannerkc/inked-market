/**
 * Single source of truth for builder section metadata.
 * Consumed by: mobile preview canvas, inline overlay builder, studio page preview,
 * section controls, and the mobile sheet orchestrator.
 */

export interface SectionDef {
  id: string;
  name: string;
  title: string; // used in sheet headers and popovers
}

export const SECTION_DEFS: SectionDef[] = [
  { id: "nav",           name: "Navigation", title: "Navigation Bar"  },
  { id: "hero",          name: "Hero",       title: "Hero Section"    },
  { id: "gallery",       name: "Gallery",    title: "Gallery Style"   },
  { id: "about",         name: "About",      title: "About Section"   },
  { id: "artist-strips", name: "Artists",    title: "Artist Strips"   },
  { id: "details",       name: "Details",    title: "Details Section" },
  { id: "footer-cta",    name: "CTA",        title: "CTA Section"    },
  { id: "footer",        name: "Footer",     title: "Footer"         },
];

export const SECTION_IDS = SECTION_DEFS.map((s) => s.id);

const sectionMap = new Map(SECTION_DEFS.map((s) => [s.id, s]));

export function getSectionDef(id: string): SectionDef | undefined {
  return sectionMap.get(id);
}

export function getSectionTitle(id: string): string {
  return sectionMap.get(id)?.title ?? id;
}

export function getSectionIndex(id: string): number {
  return SECTION_IDS.indexOf(id);
}

import type { ContentGroup } from "@/components/studio-site/studio-site-context";

/** Which Content-panel group edits each section's data. */
export const SECTION_CONTENT_GROUP: Record<string, ContentGroup> = {
  nav: "booking",
  hero: "photos",
  gallery: "photos",
  about: "story",
  "artist-strips": "artists",
  details: "contact-hours",
  "footer-cta": "booking",
  footer: "socials",
};
