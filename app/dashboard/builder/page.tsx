"use client";

import { useState, useEffect, useCallback } from "react";
import { BuilderProvider } from "@/components/builder/builder-provider";
import { BuilderTopBar } from "@/components/builder/builder-top-bar";
import { SplitScreenBuilder } from "@/components/builder/split-screen-builder";
import { InlineOverlayBuilder } from "@/components/builder/inline-overlay-builder";
import { TemplatePicker } from "@/components/builder/template-picker";
import { templates } from "@/lib/data/templates";
import type { BuilderMode, TemplateSlug, StudioThemeConfig } from "@/lib/types/builder";

const BUILDER_MODE_KEY = "inked-builder-mode";
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
  const [initialConfig, setInitialConfig] = useState<
    StudioThemeConfig | undefined
  >(undefined);

  useEffect(() => {
    setMode(getStoredMode());
    const draft = getExistingDraft();
    if (draft?.template) {
      setInitialConfig(draft);
      setHasTemplate(true);
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
      };
      setInitialConfig(config);
      setHasTemplate(true);
      // Save immediately so refreshing doesn't lose the selection
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(config));
      } catch {
        // localStorage may be unavailable
      }
    },
    [mode],
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

  // Show template picker if no template selected yet
  if (!hasTemplate) {
    return <TemplatePicker onSelectTemplate={handleSelectTemplate} />;
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
