"use client";

import { useState, useEffect, useCallback } from "react";
import { BuilderProvider } from "@/components/builder/builder-provider";
import { BuilderTopBar } from "@/components/builder/builder-top-bar";
import { SplitScreenBuilder } from "@/components/builder/split-screen-builder";
import { InlineOverlayBuilder } from "@/components/builder/inline-overlay-builder";
import { TemplatePicker } from "@/components/builder/template-picker";
import { TierSelector } from "@/components/builder/tier-selector";
import { templates } from "@/lib/data/templates";
import type { BuilderMode, BuilderTier, TemplateSlug, StudioThemeConfig } from "@/lib/types/builder";

const BUILDER_MODE_KEY = "inked-builder-mode";
const BUILDER_TIER_KEY = "inked-builder-tier";
const DRAFT_KEY = "inked-builder-draft";

function getStoredMode(): BuilderMode {
  try {
    const stored = localStorage.getItem(BUILDER_MODE_KEY);
    if (stored === "split" || stored === "inline") return stored;
  } catch {
    // localStorage may be unavailable
  }
  return "inline";
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
    return JSON.parse(stored) as StudioThemeConfig;
  } catch {
    return null;
  }
}

export default function BuilderPage() {
  const [mode, setMode] = useState<BuilderMode>("inline");
  const [mounted, setMounted] = useState(false);
  const [hasTemplate, setHasTemplate] = useState(false);
  const [hasTier, setHasTier] = useState(false);
  const [selectedTier, setSelectedTier] = useState<BuilderTier>("flash");
  const [initialConfig, setInitialConfig] = useState<
    StudioThemeConfig | undefined
  >(undefined);

  useEffect(() => {
    const draft = getExistingDraft();

    if (draft?.template) {
      setInitialConfig(draft);
      setHasTemplate(true);
      // Draft already carries mode + tier — skip setup entirely
      setMode(draft.builderMode ?? getStoredMode());
      setHasTier(true);
      setSelectedTier(draft.builderTier ?? "flash");
    } else {
      setMode(getStoredMode());
      const storedTier = getStoredTier();
      if (storedTier) setSelectedTier(storedTier);
    }

    setMounted(true);
  }, []);

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
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-xs font-medium uppercase tracking-wider text-[#555]">
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
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
        <TierSelector onSelect={handleSelectTier} />
      </div>
    );
  }

  return (
    <BuilderProvider initial={initialConfig}>
      <div className="fixed inset-0 top-0 z-50 flex flex-col overflow-hidden bg-[#0a0a0a]">
        <BuilderTopBar />
        <div className="flex-1 overflow-hidden pt-12">
          {mode === "split" ? (
            <SplitScreenBuilder />
          ) : (
            <div className="h-full overflow-y-auto">
              <InlineOverlayBuilder />
            </div>
          )}
        </div>
      </div>
    </BuilderProvider>
  );
}
