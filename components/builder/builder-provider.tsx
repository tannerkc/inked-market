"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useThemeEditor,
  type UseThemeEditorReturn,
} from "@/lib/hooks/use-theme-editor";
import { LeaveGuardDialog } from "@/components/builder/leave-guard-dialog";
import { PublishPaywallDialog } from "@/components/builder/publish-paywall-dialog";
import { usePlanBilling } from "@/components/settings/use-plan-billing";
import { publishCurrentStudio } from "@/app/dashboard/builder/actions";
import { startCheckout } from "@/app/billing/actions";
import { tierMeetsRequirement } from "@/lib/utils/integration-helpers";
import type { TierSlug } from "@/lib/types";
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
  /** Push the current draft live (published_theme_config). Opens the plan
   *  paywall instead when the studio has no active Shader/Magnum plan. */
  publish: () => void;
  isPublishing: boolean;
  /** Last publish failure, if any — cleared on the next attempt. */
  publishError: string | null;
  /** The studio has a live custom site. */
  isPublished: boolean;
  /** Current draft differs from what's live (always true before first publish). */
  hasUnpublishedChanges: boolean;
  /** Navigate away from the builder, prompting to save first if there are
   *  unsaved changes. Use this instead of router.push for any exit link. */
  requestLeave: (href: string) => void;
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
  const { studio, update, applyLocal } = useStudio();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
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

  // ── Publish: copy the draft into published_theme_config (the live site) ──
  // Free studios design without limits; going live requires a plan that
  // includes a custom web page (Shader/Magnum). The client check is UX only —
  // publishCurrentStudio re-verifies the tier server-side, and the DB trigger
  // blocks any client write to the publish columns.
  const { currentPlan } = usePlanBilling();
  const [isPublishing, setIsPublishing] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const isPublished = Boolean(studio?.publishedThemeConfig);
  const hasUnpublishedChanges = useMemo(
    () =>
      !studio?.publishedThemeConfig ||
      JSON.stringify(editor.config) !== JSON.stringify(studio.publishedThemeConfig),
    [editor.config, studio?.publishedThemeConfig],
  );

  const doPublish = useCallback(async () => {
    setIsPublishing(true);
    setPublishError(null);
    try {
      // Persist the draft (client-writable), then the server copies it live
      // after re-checking the tier. Publishing also lists the studio — a live
      // custom site at a 404 URL is meaningless.
      editor.saveDraft();
      await update({ themeConfig: editor.config });
      const result = await publishCurrentStudio();
      if (result.ok) {
        applyLocal({
          publishedThemeConfig: editor.config,
          publishedAt: new Date().toISOString(),
          isVisible: true,
        });
      } else {
        setPublishError(result.error ?? "Publish failed.");
        if (result.error?.includes("plan")) setPaywallOpen(true);
      }
    } catch (err) {
      console.error("Publish failed", err);
      setPublishError("Publish failed.");
    } finally {
      setIsPublishing(false);
    }
  }, [editor, update, applyLocal]);

  const publish = useCallback(() => {
    if (isPublishing) return;
    if (tierMeetsRequirement(currentPlan, "shader")) void doPublish();
    else setPaywallOpen(true);
  }, [isPublishing, currentPlan, doPublish]);

  // Paywall pick: save the draft first so verify-on-return publishes this
  // exact config, then hand off to Stripe Checkout with intent=publish.
  const upgradeAndPublish = useCallback(
    (slug: TierSlug) => {
      setPaywallOpen(false);
      editor.saveDraft();
      void update({ themeConfig: editor.config }).then(async () => {
        const result = await startCheckout({ tier: slug, cycle: "monthly", intent: "publish" });
        if (result.url) window.location.assign(result.url);
        else setPublishError(result.error ?? "Could not start checkout.");
      });
    },
    [editor, update],
  );

  // Leave the builder, guarding unsaved work. Clean → navigate immediately;
  // dirty → open the save/leave/cancel dialog and stash the destination.
  const requestLeave = useCallback(
    (href: string) => {
      if (editor.isDirty) setPendingHref(href);
      else router.push(href);
    },
    [editor.isDirty, router],
  );

  const cancelLeave = useCallback(() => setPendingHref(null), []);

  const leaveWithoutSaving = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) router.push(href);
  }, [pendingHref, router]);

  const saveAndLeave = useCallback(() => {
    saveDraft();
    const href = pendingHref;
    setPendingHref(null);
    if (href) router.push(href);
  }, [saveDraft, pendingHref, router]);

  // Native guard for refresh / tab close / external nav — the browser owns
  // this dialog (no custom buttons possible), so it only fires when dirty.
  useEffect(() => {
    if (!editor.isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editor.isDirty]);

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
        publish,
        isPublishing,
        publishError,
        isPublished,
        hasUnpublishedChanges,
        requestLeave,
      }}
    >
      <StudioSiteProvider value={siteContext}>{children}</StudioSiteProvider>
      <LeaveGuardDialog
        isOpen={pendingHref !== null}
        onSaveAndLeave={saveAndLeave}
        onLeave={leaveWithoutSaving}
        onCancel={cancelLeave}
      />
      <PublishPaywallDialog
        isOpen={paywallOpen}
        onSelectPlan={upgradeAndPublish}
        onCancel={() => setPaywallOpen(false)}
      />
    </BuilderContext.Provider>
  );
}
