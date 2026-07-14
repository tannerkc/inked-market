"use client";

import { useMemo, useState } from "react";
import { resolveTheme } from "@/lib/utils/resolve-theme";
import { StudioSiteRenderer } from "./studio-site-renderer";
import type { StudioThemeConfig } from "@/lib/types/builder";
import type { StudioSiteData } from "./studio-site-data";
import type { StudioSitePage } from "./studio-site-context";

interface StudioSitePublicProps {
  config: StudioThemeConfig;
  data: StudioSiteData;
  initialPage?: StudioSitePage;
}

/**
 * Client boundary for the public studio site. Resolves the theme to CSS vars and
 * manages in-page navigation between the studio view and the policies view (the
 * same interaction the builder has), so "View all policies" works without a
 * server→client function prop.
 */
export function StudioSitePublic({
  config,
  data,
  initialPage = "studio",
}: StudioSitePublicProps) {
  const [page, setPage] = useState<StudioSitePage>(initialPage);
  const resolvedVars = useMemo(() => resolveTheme(config), [config]);

  return (
    <StudioSiteRenderer
      config={config}
      resolvedVars={resolvedVars}
      data={data}
      page={page}
      onNavigatePage={setPage}
    />
  );
}
