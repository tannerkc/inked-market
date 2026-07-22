"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PillToggle } from "@/components/ui/pill-toggle";
import { SettingsSection } from "./settings-section";
import type { BuilderMode, BuilderTier } from "@/lib/types/builder";

const BUILDER_MODE_KEY = "inked-builder-mode";
const BUILDER_TIER_KEY = "inked-builder-tier";
const DRAFT_KEY = "inked-builder-draft";

function patchDraft(patch: Partial<{ builderMode: BuilderMode; builderTier: BuilderTier }>) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, ...patch }));
  } catch {
    // localStorage unavailable or draft malformed
  }
}


const BUILDER_MODE_OPTIONS = [
  { label: "Inline", value: "inline" },
  { label: "Split", value: "split" },
];

const BUILDER_TIER_OPTIONS = [
  { label: "Flash", value: "flash" },
  { label: "Custom", value: "custom" },
];

export function AppearanceSection() {
  const { mode, setMode } = useTheme();
  const [builderMode, setBuilderMode] = useState<BuilderMode>("inline");
  const [builderTier, setBuilderTier] = useState<BuilderTier>("flash");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.builderMode === "split" || draft.builderMode === "inline") {
          setBuilderMode(draft.builderMode);
        }
        if (draft.builderTier === "flash" || draft.builderTier === "custom") {
          setBuilderTier(draft.builderTier);
        }
        return;
      }
    } catch {
      // fall through to individual keys
    }
    try {
      const storedMode = localStorage.getItem(BUILDER_MODE_KEY);
      if (storedMode === "split" || storedMode === "inline") setBuilderMode(storedMode);
      const storedTier = localStorage.getItem(BUILDER_TIER_KEY);
      if (storedTier === "flash" || storedTier === "custom") setBuilderTier(storedTier as BuilderTier);
    } catch {
      // localStorage unavailable
    }
  }, []);

  function handleBuilderModeChange(v: string) {
    const newMode = v as BuilderMode;
    setBuilderMode(newMode);
    try {
      localStorage.setItem(BUILDER_MODE_KEY, newMode);
      patchDraft({ builderMode: newMode });
    } catch {
      // localStorage unavailable
    }
  }

  function handleBuilderTierChange(v: string) {
    const newTier = v as BuilderTier;
    setBuilderTier(newTier);
    try {
      localStorage.setItem(BUILDER_TIER_KEY, newTier);
      patchDraft({ builderTier: newTier });
    } catch {
      // localStorage unavailable
    }
  }

  const rowClass =
    "rounded-[16px] border p-5 border-ink-black/[0.06] bg-ink-black/[0.02] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]";

  return (
    <SettingsSection title="Appearance" description="Choose how Inked Market looks to you">
      <div className="space-y-3">
        <div className={rowClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
                Theme
              </p>
              <p className="text-[10px] mt-0.5 text-ink-black/25 dark:text-ink-cream/25">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle mode={mode} onToggle={setMode} />
          </div>
        </div>

        <div className={rowClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
                Page Builder Style
              </p>
              <p className="text-[10px] mt-0.5 text-ink-black/25 dark:text-ink-cream/25">
                Choose your preferred editing experience
              </p>
            </div>
            <PillToggle
              options={BUILDER_MODE_OPTIONS}
              value={builderMode}
              onChange={handleBuilderModeChange}
            />
          </div>
        </div>

        <div className={rowClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
                Customization Depth
              </p>
              <p className="text-[10px] mt-0.5 text-ink-black/25 dark:text-ink-cream/25">
                Flash is quick; Custom unlocks full control
              </p>
            </div>
            <PillToggle
              options={BUILDER_TIER_OPTIONS}
              value={builderTier}
              onChange={handleBuilderTierChange}
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
