"use client";

import { useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import {
  gradientDirectionOptions,
  glowIntensityOptions,
} from "@/lib/data/builder-options";
import type { GradientDirection, GlowIntensity } from "@/lib/types/builder";
import { SegmentedPicker } from "./segmented-picker";

function HexInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const cleaned = draft.startsWith("#") ? draft : `#${draft}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      onChange(cleaned);
    } else {
      setDraft(value);
    }
  };

  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 shrink-0 rounded border border-[#333]"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={draft}
          maxLength={7}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="w-full rounded border border-[#222] bg-[#111] px-2.5 py-1.5 text-[11px] font-mono text-[#ccc] outline-none transition-colors focus:border-[#FF3333] focus:ring-1 focus:ring-[#FF3333]/30"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function AdvancedColorPanel() {
  const { config, resolvedVars, applyChange } = useBuilder();

  const currentAccent = config.accentColor ?? resolvedVars["--accent"] ?? "#FF3333";
  const currentSecondary = config.secondaryAccentColor ?? "";

  return (
    <div className="flex flex-col gap-4">
      <HexInput
        label="Brand Color"
        value={currentAccent}
        onChange={(hex) => applyChange({ accentColor: hex })}
      />
      <HexInput
        label="Secondary Accent"
        value={currentSecondary}
        onChange={(hex) => applyChange({ secondaryAccentColor: hex })}
      />
      <SegmentedPicker
        label="Gradient Direction"
        options={gradientDirectionOptions}
        value={config.gradientDirection}
        onChange={(v) => applyChange({ gradientDirection: v as GradientDirection })}
      />
      <SegmentedPicker
        label="Glow Intensity"
        options={glowIntensityOptions}
        value={config.glowIntensity}
        onChange={(v) => applyChange({ glowIntensity: v as GlowIntensity })}
      />
    </div>
  );
}

AdvancedColorPanel.displayName = "AdvancedColorPanel";
