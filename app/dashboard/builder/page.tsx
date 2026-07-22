"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { BuilderProvider, useBuilder } from "@/components/builder/builder-provider";
import { BuilderContentPanel } from "@/components/builder/content-panel";
import { StudioPagePreview } from "@/components/builder/studio-page-preview";
import { useStudio } from "@/lib/providers/studio-provider";
import { BuilderTopBar } from "@/components/builder/builder-top-bar";
import { SplitScreenBuilder } from "@/components/builder/split-screen-builder";
import { InlineOverlayBuilder } from "@/components/builder/inline-overlay-builder";
import { UrlBar } from "@/components/builder/url-bar";
import { AuthGuard } from "@/components/providers/auth-guard";
import { MobileBuilder } from "@/components/builder/mobile";
import { TemplatePicker } from "@/components/builder/template-picker";
import { BuilderTutorial } from "@/components/builder/tutorial-overlay";
import { TierSelector } from "@/components/builder/tier-selector";
import { templates } from "@/lib/data/templates";
import type { BuilderMode, BuilderTier, TemplateSlug, StudioThemeConfig } from "@/lib/types/builder";
import { OverlayContext } from "@/lib/contexts/overlay-context";
import { remapLegacyTemplate } from "@/lib/utils/legacy-template";
import { resolveEditorChrome } from "@/lib/utils/editor-chrome";

/* ─── Mobile detection ────────────────────────────────────────────────── */

const mobileQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(max-width: 767px)")
    : null;

function subscribeMobile(cb: () => void) {
  mobileQuery?.addEventListener("change", cb);
  return () => mobileQuery?.removeEventListener("change", cb);
}

function getIsMobile() {
  return mobileQuery?.matches ?? false;
}

const serverSnapshot = () => false;

/**
 * Full-screen chrome-free render of the current config with real data — this
 * is exactly what publishing ships. Escape or the pill exits.
 */
function PreviewOverlay() {
  const { isPreviewing, setIsPreviewing } = useBuilder();

  useEffect(() => {
    if (!isPreviewing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPreviewing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPreviewing, setIsPreviewing]);

  if (!isPreviewing) return null;
  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto bg-chrome-bg">
      <StudioPagePreview />
      <button
        type="button"
        onClick={() => setIsPreviewing(false)}
        className="fixed bottom-6 left-1/2 z-[310] -translate-x-1/2 rounded-full border border-chrome-border-hover bg-ink-black/90 px-5 py-2.5 text-xs font-semibold text-chrome-text-light shadow-2xl backdrop-blur-xl transition-colors hover:text-white"
      >
        Exit preview
      </button>
    </div>
  );
}

/* ─── Storage keys ────────────────────────────────────────────────────── */

const BUILDER_MODE_KEY = "inked-builder-mode";
const BUILDER_TIER_KEY = "inked-builder-tier";
const DRAFT_KEY = "inked-builder-draft";

function getStoredMode(): BuilderMode | null {
  try {
    const stored = localStorage.getItem(BUILDER_MODE_KEY);
    if (stored === "split" || stored === "inline") return stored;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function getStoredTier(): BuilderTier | null {
  try {
    const stored = localStorage.getItem(BUILDER_TIER_KEY);
    if (stored === "flash" || stored === "custom") return stored;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function getExistingDraft(): StudioThemeConfig | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    return remapLegacyTemplate(JSON.parse(stored) as StudioThemeConfig);
  } catch {
    return null;
  }
}

export default function BuilderPage() {
  // The builder is owner-only tooling — never reachable signed-out (or by
  // customers/artists); AuthGuard bounces to /login (or /dashboard on role).
  return (
    <AuthGuard requiredRole="studio">
      <BuilderPageInner />
    </AuthGuard>
  );
}

function BuilderPageInner() {
  const isMobile = useSyncExternalStore(subscribeMobile, getIsMobile, serverSnapshot);
  const [mode, setMode] = useState<BuilderMode>("inline");
  const [mounted, setMounted] = useState(false);
  const [overlayEl, setOverlayEl] = useState<HTMLElement | null>(null);
  const [hasTemplate, setHasTemplate] = useState(false);
  const [hasTier, setHasTier] = useState(false);
  const [selectedTier, setSelectedTier] = useState<BuilderTier>("flash");
  const [initialConfig, setInitialConfig] = useState<
    StudioThemeConfig | undefined
  >(undefined);
  const { studio, loading } = useStudio();
  const hydratedRef = useRef(false);

  // Hydrate once, after the studio has loaded. Prefer the DB-saved theme_config
  // (source of truth across devices), then a local working draft, else the picker.
  useEffect(() => {
    if (hydratedRef.current || loading) return;
    hydratedRef.current = true;

    const dbConfig = studio?.themeConfig ? remapLegacyTemplate(studio.themeConfig) : undefined;
    const draft = getExistingDraft();
    const chosen = dbConfig?.template ? dbConfig : draft?.template ? draft : null;

    // Mode/tier are EDITOR preferences: the freshest local choice (written by
    // the dashboard toggle, settings page, and the builder itself) beats the
    // value captured inside a saved config — that value only seeds new devices.
    const chrome = resolveEditorChrome(
      { mode: getStoredMode(), tier: getStoredTier() },
      chosen,
    );

    if (chosen) {
      // Align the working config with the resolved preferences so the next
      // save doesn't write a stale mode/tier back to the DB.
      setInitialConfig({ ...chosen, builderMode: chrome.mode, builderTier: chrome.tier });
      setHasTemplate(true);
      setMode(chrome.mode);
      setHasTier(true);
      setSelectedTier(chrome.tier);
    } else {
      setMode(chrome.mode);
      setSelectedTier(chrome.tier);
    }

    setMounted(true);
  }, [loading, studio]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(BUILDER_MODE_KEY, mode);
    } catch {
      // localStorage may be unavailable
    }
  }, [mode, mounted]);

  const handleSelectTemplate = useCallback(
    (slug: TemplateSlug) => {
      const tmpl = templates[slug];
      const config: StudioThemeConfig = {
        ...tmpl.defaults,
        builderMode: mode,
        builderTier: selectedTier,
      };
      setInitialConfig(config);
      setHasTemplate(true);
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(config));
      } catch {
        // localStorage may be unavailable
      }
    },
    [mode, selectedTier],
  );

  const handleSelectTier = useCallback(
    (tier: BuilderTier, selectedMode: BuilderMode) => {
      setSelectedTier(tier);
      setMode(selectedMode);
      setHasTier(true);
      try {
        localStorage.setItem(BUILDER_TIER_KEY, tier);
        localStorage.setItem(BUILDER_MODE_KEY, selectedMode);
      } catch {
        // localStorage may be unavailable
      }

      if (initialConfig) {
        const updated = { ...initialConfig, builderTier: tier, builderMode: selectedMode };
        setInitialConfig(updated);
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
        } catch {
          // localStorage may be unavailable
        }
      }
    },
    [initialConfig],
  );

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-chrome-bg">
        <div className="text-xs font-medium uppercase tracking-wider text-chrome-text-dim">
          Loading builder...
        </div>
      </div>
    );
  }

  if (!hasTemplate) {
    return <TemplatePicker onSelectTemplate={handleSelectTemplate} />;
  }

  if (!hasTier) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-chrome-bg">
        <TierSelector onSelect={handleSelectTier} isMobile={isMobile} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <BuilderProvider initial={initialConfig}>
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-chrome-bg">
          <OverlayContext.Provider value={overlayEl}>
            <MobileBuilder />
            <div
              ref={setOverlayEl}
              className="absolute inset-0 pointer-events-none z-[100]"
            />
          </OverlayContext.Provider>
        </div>
        {/* Full-width drawer on phones — the mobile Content surface */}
        <BuilderContentPanel />
        <PreviewOverlay />
      </BuilderProvider>
    );
  }

  return (
    <BuilderProvider initial={initialConfig}>
      <div className="fixed inset-0 top-0 z-50 flex flex-col overflow-hidden bg-chrome-bg">
        <BuilderTopBar />
        <div className="flex-1 overflow-hidden pt-12">
          {mode === "split" ? (
            <SplitScreenBuilder />
          ) : (
            <OverlayContext.Provider value={overlayEl}>
              <div className="relative h-full overflow-hidden">
                <div className="absolute inset-0 overflow-y-auto">
                  <InlineOverlayBuilder />
                </div>
                {/* Floating URL pill — inline mode has no browser chrome */}
                <div className="absolute top-3 left-1/2 z-[60] w-[480px] max-w-[calc(100%-2rem)] -translate-x-1/2">
                  <UrlBar className="shadow-2xl backdrop-blur-xl" />
                </div>
                <div
                  ref={setOverlayEl}
                  className="absolute inset-0 pointer-events-none z-50"
                />
              </div>
            </OverlayContext.Provider>
          )}
        </div>
      </div>
      {/* Overlay drawer for inline mode; split mode docks Content in the editor panel */}
      {mode !== "split" ? <BuilderContentPanel /> : null}
      {/* Keyed by mode so first entry into each editor gets its own tour */}
      <BuilderTutorial key={mode} mode={mode} />
      <PreviewOverlay />
    </BuilderProvider>
  );
}
