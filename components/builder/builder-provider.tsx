"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  useThemeEditor,
  type UseThemeEditorReturn,
} from "@/lib/hooks/use-theme-editor";
import type { StudioThemeConfig } from "@/lib/types/builder";
import { useStudio } from "@/lib/providers/studio-provider";
import type { StudioData } from "@/lib/repositories";
import { StudioSiteProvider, type ContentGroup } from "@/components/studio-site/studio-site-context";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import { buildBuilderSiteData } from "@/components/studio-site/demo-site-data";
import { useStudioLiveContent, type LiveStudioContent } from "@/lib/hooks/use-studio-live-content";

export type PreviewPage = "studio" | "policies";

interface BuilderContextValue extends UseThemeEditorReturn {
  replayKey: number;
  triggerReplay: () => void;
  studio: StudioData | null;
  useMockData: boolean;
  toggleMockData: () => void;
  previewPage: PreviewPage;
  setPreviewPage: (page: PreviewPage) => void;
  /** Assembled site data — the ONLY source preview surfaces may render from. */
  siteData: StudioSiteData;
  liveContent: LiveStudioContent;
  contentPanel: { open: boolean; group: ContentGroup };
  openContentPanel: (group?: ContentGroup) => void;
  closeContentPanel: () => void;
  isPreviewing: boolean;
  setIsPreviewing: (v: boolean) => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilder(): BuilderContextValue {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
}

interface BuilderProviderProps {
  children: React.ReactNode;
  initial?: StudioThemeConfig;
}

export function BuilderProvider({ children, initial }: BuilderProviderProps) {
  const editor = useThemeEditor(initial);
  const { studio, update } = useStudio();
  const [replayKey, setReplayKey] = useState(0);
  const triggerReplay = useCallback(() => setReplayKey((k) => k + 1), []);
  const [useMockData, setUseMockData] = useState(false);
  const toggleMockData = useCallback(() => setUseMockData((v) => !v), []);
  const [previewPage, setPreviewPage] = useState<PreviewPage>("studio");
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Real earned content (roster, reviews) — skipped entirely in Sample mode.
  const liveContent = useStudioLiveContent(useMockData ? undefined : studio?.id);

  const [contentPanel, setContentPanel] = useState<{ open: boolean; group: ContentGroup }>({
    open: false,
    group: "story",
  });
  const openContentPanel = useCallback(
    (group: ContentGroup = "story") => setContentPanel({ open: true, group }),
    [],
  );
  const closeContentPanel = useCallback(
    () => setContentPanel((p) => ({ ...p, open: false })),
    [],
  );

  // THE truth gate: demo content only behind Sample; live mode = real everything.
  const siteData = useMemo(
    () =>
      buildBuilderSiteData(studio, useMockData, {
        artists: liveContent.artists,
        reviews: liveContent.reviews,
        ratingAverage: liveContent.ratingAverage,
        reviewCount: liveContent.reviewCount,
      }),
    [studio, useMockData, liveContent],
  );

  // Save persists the working draft locally AND the studio's theme to the DB.
  const saveDraft = useCallback(() => {
    editor.saveDraft();
    void update({ themeConfig: editor.config });
  }, [editor, update]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      } else if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        editor.redo();
      } else if (isMod && e.key === "s") {
        e.preventDefault();
        saveDraft();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, saveDraft]);

  // Studio-site context for every builder render path — the inline overlay and
  // mobile canvas compose section components directly (not via StudioSiteRenderer),
  // so the provider must sit above all of them.
  const siteContext = useMemo(
    () => ({
      config: editor.config,
      data: siteData,
      onNavigatePage: setPreviewPage,
      onEditContent: openContentPanel,
    }),
    [editor.config, siteData, openContentPanel],
  );

  return (
    <BuilderContext.Provider
      value={{
        ...editor,
        saveDraft,
        replayKey,
        triggerReplay,
        studio,
        useMockData,
        toggleMockData,
        previewPage,
        setPreviewPage,
        siteData,
        liveContent,
        contentPanel,
        openContentPanel,
        closeContentPanel,
        isPreviewing,
        setIsPreviewing,
      }}
    >
      <StudioSiteProvider value={siteContext}>{children}</StudioSiteProvider>
    </BuilderContext.Provider>
  );
}
