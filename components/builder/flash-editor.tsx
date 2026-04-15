"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import {
  ThemePresetPicker,
  AccentColorPicker,
  BackgroundPicker,
  TypographyPairPicker,
  VibePicker,
  AdvancedColorPanel,
  CtaStylePicker,
  HeroStylePicker,
  GalleryStylePicker,
  GalleryPhotosPicker,
  FooterStylePicker,
  ToggleRow,
  PoliciesEditor,
} from "@/components/builder/controls";

type FlashTab = "theme" | "type" | "sections" | "policies";

const tabs: { label: string; value: FlashTab }[] = [
  { label: "Theme", value: "theme" },
  { label: "Typography", value: "type" },
  { label: "Sections", value: "sections" },
  { label: "Policies", value: "policies" },
];

export function FlashEditor() {
  const { config, applyChange } = useBuilder();
  const [activeTab, setActiveTab] = useState<FlashTab>("theme");
  const [showAdvancedColor, setShowAdvancedColor] = useState(false);
  const [showOverrides, setShowOverrides] = useState(false);

  return (
    <>
      <div className="flex overflow-x-auto border-b border-chrome-border scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "shrink-0 px-3 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab.value
                ? "text-red-500 border-red-500"
                : "text-chrome-text-dim border-transparent hover:text-chrome-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "theme" && (
          <>
            <TemplateSwitcher />
            <ThemePresetPicker />
            <AccentColorPicker />
            <BackgroundPicker />
            <button
              type="button"
              onClick={() => setShowAdvancedColor(!showAdvancedColor)}
              className="flex w-full items-center justify-between rounded-lg border border-chrome-border bg-ink-black-raised px-3 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim transition-colors hover:border-chrome-border-hover hover:text-chrome-text-secondary"
            >
              <span>Advanced Color</span>
              <svg
                className={cn("h-3 w-3 transition-transform", showAdvancedColor && "rotate-180")}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 4.5 6 7.5 9 4.5" />
              </svg>
            </button>
            {showAdvancedColor && <AdvancedColorPanel />}
          </>
        )}

        {activeTab === "type" && <TypographyPairPicker />}

        {activeTab === "sections" && (
          <>
            <VibePicker />
            <CtaStylePicker />

            <div>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
                Show / Hide
              </div>
              <div className="rounded-lg border border-chrome-border bg-ink-black-raised p-3 space-y-1">
                <ToggleRow
                  label="About Section"
                  checked={config.aboutLayout !== "none"}
                  onChange={(v) => applyChange({ aboutLayout: v ? "split" : "none" })}
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
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOverrides(!showOverrides)}
              className="flex w-full items-center justify-between rounded-lg border border-chrome-border bg-ink-black-raised px-3 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim transition-colors hover:border-chrome-border-hover hover:text-chrome-text-secondary"
            >
              <span>Override Sections</span>
              <svg
                className={cn("h-3 w-3 transition-transform", showOverrides && "rotate-180")}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 4.5 6 7.5 9 4.5" />
              </svg>
            </button>
            {showOverrides && (
              <div className="space-y-6">
                <HeroStylePicker />
                {config.galleryBeforeAbout && <GalleryStylePicker />}
                <GalleryPhotosPicker />
                <FooterStylePicker />
              </div>
            )}
          </>
        )}

        {activeTab === "policies" && <PoliciesEditor />}
      </div>
    </>
  );
}

FlashEditor.displayName = "FlashEditor";
