"use client";

import React from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import {
  ThemePresetPicker,
  AccentColorPicker,
  BackgroundPicker,
  AdvancedColorPanel,
  TypographyPairPicker,
  TypographyTuner,
  VibePicker,
  PageStyleGroup,
  TexturePicker,
  ImageTreatmentPicker,
  LogoUpload,
  LogoPlacementPicker,
  ToggleRow,
} from "@/components/builder/controls";

/**
 * Shared global control compositions for each builder tab.
 * Used by: mobile bottom sheets, desktop toolbar flyouts.
 */
export function GlobalTabContent({ tab }: { tab: string }) {
  const { config, applyChange } = useBuilder();
  const tier = config.builderTier ?? "flash";

  switch (tab) {
    case "theme":
      return (
        <div className="space-y-4">
          <TemplateSwitcher />
          <ThemePresetPicker />
          <AccentColorPicker />
          <BackgroundPicker />
          {tier === "custom" && <AdvancedColorPanel />}
        </div>
      );

    case "type":
      return (
        <div className="space-y-4">
          <TypographyPairPicker />
          {tier === "custom" && <TypographyTuner />}
        </div>
      );

    case "sections":
      return tier === "flash" ? (
        <div className="space-y-6">
          <VibePicker />
          <div>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
              Show / Hide
            </div>
            <div className="space-y-1">
              <ToggleRow
                label="Hero Tagline"
                checked={config.showHeroSubtext}
                onChange={(v) => applyChange({ showHeroSubtext: v })}
              />
              <ToggleRow
                label="Hero CTA"
                checked={config.showHeroCta}
                onChange={(v) => applyChange({ showHeroCta: v })}
              />
              <ToggleRow
                label="About Section"
                checked={config.aboutLayout !== "none"}
                onChange={(v) =>
                  applyChange({ aboutLayout: v ? "split" : "none" })
                }
              />
              <ToggleRow
                label="Specialties"
                checked={config.showSpecialties}
                onChange={(v) => applyChange({ showSpecialties: v })}
              />
              <ToggleRow
                label="Studio Details"
                checked={config.showStudioDetails}
                onChange={(v) => applyChange({ showStudioDetails: v })}
              />
              <ToggleRow
                label="CTA Glow"
                checked={config.ctaGlow}
                onChange={(v) => applyChange({ ctaGlow: v })}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <PageStyleGroup />
        </div>
      );

    case "effects":
      return (
        <div className="space-y-4">
          <TexturePicker />
          <ImageTreatmentPicker />
        </div>
      );

    case "brand":
      return (
        <div className="space-y-4">
          <LogoUpload />
          {config.logoUrl && <LogoPlacementPicker />}
          <div className="space-y-1">
            <ToggleRow
              label="Gallery Watermarks"
              checked={config.galleryWatermarks ?? false}
              onChange={(v) => applyChange({ galleryWatermarks: v })}
            />
            <ToggleRow
              label="Custom Social Preview"
              checked={config.customSocialPreview ?? false}
              onChange={(v) => applyChange({ customSocialPreview: v })}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
