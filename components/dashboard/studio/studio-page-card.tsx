"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/ui/pill-toggle";
import type { BuilderMode, BuilderTier } from "@/lib/types/builder";
import type { ChecklistItem } from "@/lib/types";
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

interface StudioPageCardProps {
  /** Listed on the marketplace — the public page renders instead of a 404. */
  live: boolean;
  /** Custom builder design is published (vs the basic profile view). */
  published: boolean;
  /** Required steps complete + active plan → Go Live is one click away. */
  canGoLive: boolean;
  /** Required steps complete but no active plan — route to settings to pick one. */
  needsPlan: boolean;
  /** Required steps still incomplete — rendered as chips in the go-live callout. */
  missingSteps: ChecklistItem[];
  goingLive: boolean;
  onGoLive: () => void;
  /** Opens the plan-picker dialog (in-context — no navigation away). */
  onChoosePlan: () => void;
  /** Routes a missing step chip to its edit surface (same handler as the banner). */
  onStepClick?: (id: string) => void;
}

export function StudioPageCard({
  live,
  published,
  canGoLive,
  needsPlan,
  missingSteps,
  goingLive,
  onGoLive,
  onChoosePlan,
  onStepClick,
}: StudioPageCardProps) {
  const router = useRouter();

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
        <h3 className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-black/60 dark:text-ink-cream/60">
          Your Studio Page
        </h3>

        {/* Settings trigger */}
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-colors cursor-pointer text-ink-rust hover:text-ink-rust/70 dark:text-ink-red dark:hover:text-ink-red/70"
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
                "border-ink-black/[0.08] bg-white/95",
                "dark:border-ink-cream/[0.08] dark:bg-ink-black/95"
              )}
            >
              <p className="mb-3 font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/60 dark:text-ink-cream/60">
                Builder Settings
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-ink-black/60 dark:text-ink-cream/60">
                    Style
                  </span>
                  <PillToggle
                    options={MODE_OPTIONS}
                    value={builderMode}
                    onChange={handleModeChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-ink-black/60 dark:text-ink-cream/60">
                    Depth
                  </span>
                  <PillToggle
                    options={TIER_OPTIONS}
                    value={builderTier}
                    onChange={handleTierChange}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-ink-black/[0.06] dark:border-ink-cream/[0.06]">
                <p className="text-[10px] text-ink-black/60 dark:text-ink-cream/60">
                  Changes apply next time you open the builder
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="relative rounded-[20px] border-2 border-ink-rust/20 bg-ink-black/[0.02] dark:border-ink-red/[0.15] dark:bg-ink-cream/[0.02]">
        {/* Listing status badge */}
        <span
          className={cn(
            "absolute top-4 right-4 font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border",
            live
              ? "bg-ink-sage/[0.1] text-ink-sage border-ink-sage/[0.25]"
              : "bg-ink-rust/[0.08] text-ink-rust border-ink-rust/[0.15] dark:bg-ink-red/[0.08] dark:text-ink-red dark:border-ink-red/[0.15]"
          )}
        >
          {live ? (published ? "Live · Custom Site" : "Live · Basic Profile") : "Draft"}
        </span>

        <div className="p-7 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border bg-ink-rust/[0.06] border-ink-rust/[0.1] dark:bg-ink-red/[0.06] dark:border-ink-red/[0.1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-ink-rust dark:text-ink-red">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>

          <h3 className="text-[17px] font-semibold mb-1.5 text-ink-black dark:text-ink-cream">Your Studio Page</h3>
          <p className="text-[13px] max-w-[400px] text-ink-black/60 dark:text-ink-cream/60">
            Preview and customize your public listing before going live.
          </p>

          <div className="w-full my-5 flex items-center gap-3 text-ink-black/60 dark:text-ink-cream/60">
            <div className="flex-1 h-px bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase whitespace-nowrap">
              Templates on Shader &amp; Magnum · Premium on Magnum
            </span>
            <div className="flex-1 h-px bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
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

            <p className="text-[10px] mt-2.5 text-ink-black/60 dark:text-ink-cream/60">
              Free to build · Publish when you&apos;re ready
            </p>
          </div>

          {/* Status callout: rust while required steps remain, sage once
              ready or live. Draft studios 404 publicly until go-live flips. */}
          <div
            className={cn(
              "w-full mt-4 rounded-xl border px-3.5 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5",
              live || canGoLive || needsPlan
                ? "border-ink-sage/[0.3] bg-ink-sage/[0.06] dark:border-ink-sage/[0.25] dark:bg-ink-sage/[0.08]"
                : "border-ink-rust/[0.18] bg-ink-rust/[0.04] dark:border-ink-red/[0.18] dark:bg-ink-red/[0.05]"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  live || canGoLive || needsPlan
                    ? "bg-ink-sage"
                    : "bg-ink-rust dark:bg-ink-red"
                )}
              />
              {live ? (
                // The corner badge already names the live state — the strip
                // only carries the what-next guidance.
                <p className="text-[10px] text-ink-black/60 dark:text-ink-cream/60">
                  {published
                    ? "Edits go live when you republish from the builder"
                    : "Publish a custom design to upgrade your page"}
                </p>
              ) : (
                <p
                  className={cn(
                    "font-mono text-[9px] tracking-[0.2em] uppercase whitespace-nowrap",
                    canGoLive || needsPlan
                      ? "text-ink-sage"
                      : "text-ink-rust dark:text-ink-red"
                  )}
                >
                  {canGoLive
                    ? "Ready to go live"
                    : needsPlan
                      ? "Almost there"
                      : "To go live"}
                </p>
              )}
            </div>

            {live ? null : canGoLive ? (
              <button
                type="button"
                onClick={onGoLive}
                disabled={goingLive}
                className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium cursor-pointer transition-colors border-ink-sage/40 text-ink-sage hover:bg-ink-sage/[0.12] dark:border-ink-sage/50 disabled:opacity-50 disabled:cursor-default"
              >
                {goingLive ? "Going Live..." : "Go Live — Get Discovered"}
              </button>
            ) : needsPlan ? (
              <button
                type="button"
                onClick={onChoosePlan}
                className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium cursor-pointer transition-colors border-ink-sage/40 text-ink-sage hover:bg-ink-sage/[0.12] dark:border-ink-sage/50"
              >
                Choose a Plan to Go Live
              </button>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {missingSteps.map((step) =>
                  onStepClick ? (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => onStepClick(step.id)}
                      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium cursor-pointer transition-colors border-ink-black/[0.14] text-ink-black/70 hover:border-ink-rust/50 hover:text-ink-rust dark:border-ink-cream/[0.16] dark:text-ink-cream/70 dark:hover:border-ink-red/50 dark:hover:text-ink-red"
                    >
                      {step.label}
                    </button>
                  ) : (
                    <span
                      key={step.id}
                      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium border-ink-black/[0.14] text-ink-black/70 dark:border-ink-cream/[0.16] dark:text-ink-cream/70"
                    >
                      {step.label}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
