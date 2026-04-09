"use client";

import { useState } from "react";
import type { BuilderTier, BuilderMode } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

interface TierSelectorProps {
  onSelect: (tier: BuilderTier, mode: BuilderMode) => void;
}

/* ─── Step 1: Editor Style ─────────────────────────────────────────────── */

function ModeStep({ onSelect }: { onSelect: (mode: BuilderMode) => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#FF3333]/70">
          Step 1 of 2
        </p>
        <h2 className="mt-2 text-lg font-bold text-[#ccc]">How do you want to edit?</h2>
      </div>

      <div className="flex w-full max-w-md gap-3">
        {/* Inline */}
        <button
          type="button"
          onClick={() => onSelect("inline")}
          className="group relative flex flex-1 flex-col items-center gap-3 rounded-xl border-2 border-[#222] bg-[#111] px-5 py-8 text-center transition-all hover:border-[#FF3333] hover:bg-[rgba(255,51,51,0.05)]"
        >
          {/* Icon: single panel with left sidebar */}
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="text-[#444] transition-colors group-hover:text-[#FF3333]">
            <rect x="1" y="1" width="34" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="1" x2="10" y2="27" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="16" height="2" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="13" y="11" width="11" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
            <rect x="13" y="15" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          </svg>
          <div>
            <span className="block text-sm font-bold text-[#888] transition-colors group-hover:text-white">
              Inline
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#555] transition-colors group-hover:text-[#888]">
              Click to edit directly on your page
            </span>
          </div>
        </button>

        {/* Split-Screen */}
        <button
          type="button"
          onClick={() => onSelect("split")}
          className="group relative flex flex-1 flex-col items-center gap-3 rounded-xl border-2 border-[#222] bg-[#111] px-5 py-8 text-center transition-all hover:border-[#FF3333] hover:bg-[rgba(255,51,51,0.05)]"
        >
          {/* Icon: two-panel split */}
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="text-[#444] transition-colors group-hover:text-[#FF3333]">
            <rect x="1" y="1" width="34" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="1" x2="18" y2="27" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="6" width="10" height="2" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="4" y="11" width="7" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
            <rect x="4" y="15" width="9" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
            <rect x="21" y="6" width="12" height="8" rx="1.5" fill="currentColor" opacity="0.12" />
            <rect x="21" y="17" width="9" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          </svg>
          <div>
            <span className="block text-sm font-bold text-[#888] transition-colors group-hover:text-white">
              Split-Screen
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#555] transition-colors group-hover:text-[#888]">
              Editor panel beside live preview
            </span>
          </div>
        </button>
      </div>

      <p className="text-[11px] text-[#444]">You can change this in Settings later</p>
    </div>
  );
}

/* ─── Step 2: Customization Depth (Split-Screen only) ────────────────── */

function TierStep({
  onSelect,
  onBack,
}: {
  onSelect: (tier: BuilderTier) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#FF3333]/70">
          Step 2 of 2
        </p>
        <h2 className="mt-2 text-lg font-bold text-[#ccc]">How much do you want to customize?</h2>
      </div>

      <div className="flex w-full max-w-md gap-3">
        {/* Flash */}
        <button
          type="button"
          onClick={() => onSelect("flash")}
          className="group relative flex flex-1 flex-col items-center gap-3 rounded-xl border-2 border-[#222] bg-[#111] px-5 py-8 text-center transition-all hover:border-[#FF3333] hover:bg-[rgba(255,51,51,0.05)]"
        >
          {/* Icon: lightning bolt */}
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none" className="text-[#444] transition-colors group-hover:text-[#FF3333]">
            <path d="M14 2L3 18h8l-3 12 13-16h-8l3-12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <div>
            <span className="block text-sm font-bold text-[#888] transition-colors group-hover:text-white">
              Flash
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#555] transition-colors group-hover:text-[#888]">
              Pick a vibe and go — under a minute
            </span>
          </div>
        </button>

        {/* Custom */}
        <button
          type="button"
          onClick={() => onSelect("custom")}
          className="group relative flex flex-1 flex-col items-center gap-3 rounded-xl border-2 border-[#222] bg-[#111] px-5 py-8 text-center transition-all hover:border-[#FF3333] hover:bg-[rgba(255,51,51,0.05)]"
        >
          {/* Icon: sliders */}
          <svg width="30" height="28" viewBox="0 0 30 28" fill="none" className="text-[#444] transition-colors group-hover:text-[#FF3333]">
            <line x1="5" y1="7" x2="25" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="21" x2="25" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="7" r="3" fill="#111" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="19" cy="14" r="3" fill="#111" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="21" r="3" fill="#111" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div>
            <span className="block text-sm font-bold text-[#888] transition-colors group-hover:text-white">
              Custom
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#555] transition-colors group-hover:text-[#888]">
              Full control over every detail
            </span>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[11px] text-[#444] transition-colors hover:text-[#888]"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back
      </button>
    </div>
  );
}

/* ─── Orchestrator ─────────────────────────────────────────────────────── */

export function TierSelector({ onSelect }: TierSelectorProps) {
  const [step, setStep] = useState<"mode" | "tier">("mode");
  const [selectedMode, setSelectedMode] = useState<BuilderMode>("inline");

  const handleModeSelect = (mode: BuilderMode) => {
    setSelectedMode(mode);
    setStep("tier");
  };

  if (step === "mode") {
    return <ModeStep onSelect={handleModeSelect} />;
  }

  return (
    <TierStep
      onSelect={(tier) => onSelect(tier, selectedMode)}
      onBack={() => setStep("mode")}
    />
  );
}

TierSelector.displayName = "TierSelector";
