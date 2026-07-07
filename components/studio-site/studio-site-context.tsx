"use client";

import { createContext, useContext } from "react";
import type { StudioThemeConfig } from "@/lib/types/builder";
import type { StudioSiteData } from "./studio-site-data";

export type StudioSitePage = "studio" | "policies";

/** Content groups the builder's Content panel can deep-link to. */
export type ContentGroup =
  | "story"
  | "contact-hours"
  | "photos"
  | "socials"
  | "booking"
  | "artists";

/**
 * Context shared by every studio-site section component. Both the builder preview
 * (via StudioPagePreview adapter) and the public studio page render through the
 * same sections by providing this — sections no longer depend on useBuilder().
 */
export interface StudioSiteContextValue {
  config: StudioThemeConfig;
  data: StudioSiteData;
  onNavigatePage: (page: StudioSitePage) => void;
  /**
   * Builder-only: open the Content panel at a group. The public site never
   * provides this, so builder prompt chips cannot render on live sites.
   */
  onEditContent?: (group: ContentGroup) => void;
}

const StudioSiteContext = createContext<StudioSiteContextValue | null>(null);

export function useStudioSite(): StudioSiteContextValue {
  const ctx = useContext(StudioSiteContext);
  if (!ctx) {
    throw new Error("useStudioSite must be used within a StudioSiteRenderer");
  }
  return ctx;
}

export const StudioSiteProvider = StudioSiteContext.Provider;
