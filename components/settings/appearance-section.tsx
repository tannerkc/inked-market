"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SettingsSection } from "./settings-section";
import type { BuilderMode } from "@/lib/types/builder";

const BUILDER_MODE_KEY = "inked-builder-mode";

export function AppearanceSection() {
  const { mode, setMode } = useTheme();
  const isDark = mode === "dark";
  const [builderMode, setBuilderMode] = useState<BuilderMode>("inline");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BUILDER_MODE_KEY);
      if (stored === "split" || stored === "inline") setBuilderMode(stored);
    } catch {
      // localStorage unavailable
    }
  }, []);

  function handleBuilderModeChange(newMode: BuilderMode) {
    setBuilderMode(newMode);
    try {
      localStorage.setItem(BUILDER_MODE_KEY, newMode);
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <SettingsSection title="Appearance" description="Choose how Inked Market looks to you">
      <div className="space-y-3">
        <div
          className={cn(
            "rounded-[16px] border p-5",
            isDark
              ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
              : "border-ink-black/[0.06] bg-ink-black/[0.02]"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                Theme
              </p>
              <p className={cn("text-[10px] mt-0.5", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle mode={mode} onToggle={setMode} />
          </div>
        </div>

        <div
          className={cn(
            "rounded-[16px] border p-5",
            isDark
              ? "border-ink-cream/[0.06] bg-ink-cream/[0.02]"
              : "border-ink-black/[0.06] bg-ink-black/[0.02]"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                Page Builder Style
              </p>
              <p className={cn("text-[10px] mt-0.5", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                Choose your preferred editing experience
              </p>
            </div>
            <div className="flex gap-1 rounded-lg border border-[#333] p-0.5">
              <button
                type="button"
                onClick={() => handleBuilderModeChange("inline")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                  builderMode === "inline"
                    ? isDark
                      ? "bg-ink-cream/10 text-ink-cream"
                      : "bg-ink-black/10 text-ink-black"
                    : isDark
                      ? "text-ink-cream/40 hover:text-ink-cream/60"
                      : "text-ink-black/40 hover:text-ink-black/60"
                )}
              >
                Inline
              </button>
              <button
                type="button"
                onClick={() => handleBuilderModeChange("split")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                  builderMode === "split"
                    ? isDark
                      ? "bg-ink-cream/10 text-ink-cream"
                      : "bg-ink-black/10 text-ink-black"
                    : isDark
                      ? "text-ink-cream/40 hover:text-ink-cream/60"
                      : "text-ink-black/40 hover:text-ink-black/60"
                )}
              >
                Split Screen
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
