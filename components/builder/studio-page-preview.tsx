"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { StudioSiteRenderer } from "@/components/studio-site/studio-site-renderer";

interface StudioPagePreviewProps {
  /** Accepted for caller compatibility; the shared renderer is always interactive. */
  interactive?: boolean;
  className?: string;
}

/**
 * Thin adapter: feeds the builder's assembled site data (the provider's single
 * truth source) into the shared StudioSiteRenderer. The public studio page uses
 * the same renderer with real data, so preview and live site stay pixel-identical.
 */
export function StudioPagePreview({ className }: StudioPagePreviewProps) {
  const { config, resolvedVars, replayKey, previewPage, siteData, setPreviewPage, openContentPanel } =
    useBuilder();

  return (
    <StudioSiteRenderer
      config={config}
      resolvedVars={resolvedVars}
      data={siteData}
      page={previewPage}
      replayKey={replayKey}
      onNavigatePage={setPreviewPage}
      onEditContent={openContentPanel}
      className={className}
    />
  );
}
