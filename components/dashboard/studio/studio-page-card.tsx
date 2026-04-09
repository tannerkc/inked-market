"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/ui/pill-toggle";
import { useTheme } from "@/components/providers/theme-provider";
import type { BuilderMode, BuilderTier } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

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
    // ignore
  }
}

const MODE_OPTIONS = [
  { label: "Inline", value: "inline" },
  { label: "Split", value: "split" },
];

const TIER_OPTIONS = [
  { label: "Flash", value: "flash" },
  { label: "Custom", value: "custom" },
];

export function StudioPageCard() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [builderMode, setBuilderMode] = useState<BuilderMode>("inline");
  const [builderTier, setBuilderTier] = useState<BuilderTier>("flash");
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.builderMode === "split" || draft.builderMode === "inline") setBuilderMode(draft.builderMode);
        if (draft.builderTier === "flash" || draft.builderTier === "custom") setBuilderTier(draft.builderTier);
        return;
      }
    } catch { /* ignore */ }
    try {
      const m = localStorage.getItem(BUILDER_MODE_KEY);
      if (m === "split" || m === "inline") setBuilderMode(m);
      const t = localStorage.getItem(BUILDER_TIER_KEY);
      if (t === "flash" || t === "custom") setBuilderTier(t as BuilderTier);
    } catch { /* ignore */ }
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [settingsOpen]);

  function handleModeChange(v: string) {
    const newMode = v as BuilderMode;
    setBuilderMode(newMode);
    try {
      localStorage.setItem(BUILDER_MODE_KEY, newMode);
      patchDraft({ builderMode: newMode });
    } catch { /* ignore */ }
  }

  function handleTierChange(v: string) {
    const newTier = v as BuilderTier;
    setBuilderTier(newTier);
    try {
      localStorage.setItem(BUILDER_TIER_KEY, newTier);
      patchDraft({ builderTier: newTier });
    } catch { /* ignore */ }
  }

  return (
    <div className="mb-6">
      {/* Section header row */}
      <div className="relative flex items-center justify-between mb-2.5 z-10">
        <h3 className={cn(
          "font-mono text-[9px] tracking-[0.2em] uppercase",
          isDark ? "text-ink-cream/35" : "text-ink-black/35"
        )}>
          Your Studio Page
        </h3>

        {/* Settings trigger */}
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className={cn(
              "flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-colors cursor-pointer",
              isDark ? "text-ink-red hover:text-ink-red/70" : "text-ink-rust hover:text-ink-rust/70"
            )}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>

          {/* Dropdown panel */}
          {settingsOpen && (
            <div
              ref={panelRef}
              className={cn(
                "absolute top-[calc(100%+8px)] right-0 z-50 w-[260px] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl",
                isDark
                  ? "border-ink-cream/[0.08] bg-ink-black/95"
                  : "border-ink-black/[0.08] bg-white/95"
              )}
            >
              <p className={cn("mb-3 font-mono text-[9px] tracking-[0.15em] uppercase", isDark ? "text-ink-cream/30" : "text-ink-black/30")}>
                Builder Settings
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[11px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                    Style
                  </span>
                  <PillToggle
                    options={MODE_OPTIONS}
                    value={builderMode}
                    onChange={handleModeChange}
                    isDark={isDark}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={cn("text-[11px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                    Depth
                  </span>
                  <PillToggle
                    options={TIER_OPTIONS}
                    value={builderTier}
                    onChange={handleTierChange}
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className={cn("mt-3 pt-3 border-t", isDark ? "border-ink-cream/[0.06]" : "border-ink-black/[0.06]")}>
                <p className={cn("text-[10px]", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>
                  Changes apply next time you open the builder
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card */}
      <div className={cn("relative rounded-[20px] border-2", isDark ? "border-ink-red/[0.15] bg-ink-cream/[0.02]" : "border-ink-rust/20 bg-ink-black/[0.02]")}>
        {/* Draft badge */}
        <span className={cn("absolute top-4 right-4 font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border", isDark ? "bg-ink-red/[0.08] text-ink-red border-ink-red/[0.15]" : "bg-ink-rust/[0.08] text-ink-rust border-ink-rust/[0.15]")}>
          Draft
        </span>

        <div className="p-7 flex flex-col items-center text-center">
          {/* Icon */}
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4 border", isDark ? "bg-ink-red/[0.06] border-ink-red/[0.1]" : "bg-ink-rust/[0.06] border-ink-rust/[0.1]")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={isDark ? "text-ink-red" : "text-ink-rust"}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>

          <h3 className={cn("text-[17px] font-semibold mb-1.5", isDark ? "text-ink-cream" : "text-ink-black")}>Your Studio Page</h3>
          <p className={cn("text-[13px] max-w-[400px]", isDark ? "text-ink-cream/40" : "text-ink-black/40")}>
            Preview and customize your public listing before going live.
          </p>

          <div className={cn("w-full my-5 flex items-center gap-3", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>
            <div className={cn("flex-1 h-px", isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]")} />
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase whitespace-nowrap">
              Templates on Shader &amp; Magnum · Premium on Magnum
            </span>
            <div className={cn("flex-1 h-px", isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]")} />
          </div>

          <div className="w-full sm:w-auto sm:min-w-[320px]">
            <Button
              variant="ink"
              size="lg"
              statusDot
              className="w-full"
              onClick={() => router.push("/dashboard/builder")}
            >
              Customize Your Studio Page
            </Button>

            <p className={cn("text-[10px] mt-2.5", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>
              Free to build · Publish when you&apos;re ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
