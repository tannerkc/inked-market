"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { themePresets } from "@/lib/data/theme-presets";
import type { ThemePreset, ThemePresetDefinition } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function PresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset: ThemePresetDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const { accent, background, vars } = preset;
  const textPrimary = vars["--text-primary"];
  const textSecondary = vars["--text-secondary"];
  const border = vars["--border"];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border text-left transition-colors overflow-hidden",
        selected
          ? "border-ink-red bg-ink-red/10"
          : "border-chrome-border bg-chrome-surface hover:border-chrome-border-hover"
      )}
    >
      {/* Color preview bar */}
      <div
        className="h-16 w-full"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${background} 100%)`,
        }}
      />

      <div className="p-3">
        {/* Color dots */}
        <div className="mb-2 flex gap-1.5">
          {[accent, background, textPrimary, textSecondary].map(
            (color, i) => (
              <span
                key={i}
                className="block h-3.5 w-3.5 rounded-full border border-chrome-border-hover"
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>

        {/* Preset name */}
        <span className="text-xs font-medium text-chrome-text-primary">
          {preset.name}
        </span>
      </div>
    </button>
  );
}

export function ThemePresetPicker() {
  const { config, applyPreset } = useBuilder();

  const presetEntries = Object.entries(themePresets) as [
    ThemePreset,
    ThemePresetDefinition,
  ][];

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        Theme Preset
      </div>
      <div className="grid grid-cols-2 gap-2">
        {presetEntries.map(([slug, preset]) => (
          <PresetCard
            key={slug}
            preset={preset}
            selected={config.preset === slug}
            onSelect={() => applyPreset(slug)}
          />
        ))}
      </div>
    </div>
  );
}

ThemePresetPicker.displayName = "ThemePresetPicker";
