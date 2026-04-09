"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import {
  ThemePresetPicker,
  AccentColorPicker,
  BackgroundPicker,
  TypographyPairPicker,
  AdvancedColorPanel,
  TypographyTuner,
  NavStylePicker,
  NavLayoutPicker,
  MobileMenuTypePicker,
  HeroStylePicker,
  AboutLayoutPicker,
  TagStylePicker,
  GalleryStylePicker,
  DetailsLayoutPicker,
  FooterStylePicker,
  FooterLayoutPicker,
  PageStyleGroup,
  TexturePicker,
  ImageTreatmentPicker,
  LogoUpload,
  LogoPlacementPicker,
  ToggleRow,
} from "@/components/builder/controls";

type CustomTab = "theme" | "type" | "sections" | "effects" | "brand";

const tabs: { label: string; value: CustomTab }[] = [
  { label: "Theme", value: "theme" },
  { label: "Type", value: "type" },
  { label: "Sections", value: "sections" },
  { label: "Effects", value: "effects" },
  { label: "Brand", value: "brand" },
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#222] bg-[#0d0d0d] p-3">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#666]">
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function CustomEditor() {
  const { config, applyChange } = useBuilder();
  const [activeTab, setActiveTab] = useState<CustomTab>("theme");
  const [showAdvancedColor, setShowAdvancedColor] = useState(false);
  const [showTypeTuner, setShowTypeTuner] = useState(false);

  return (
    <>
      <div className="flex border-b border-[#222]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 py-3 text-[10px] font-semibold uppercase tracking-[1.5px] transition-colors border-b-2",
              activeTab === tab.value
                ? "text-red-500 border-red-500"
                : "text-[#555] border-transparent hover:text-[#888]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ─── Theme Tab ────────────────────────── */}
        {activeTab === "theme" && (
          <>
            <TemplateSwitcher />
            <ThemePresetPicker />
            <AccentColorPicker />
            <BackgroundPicker />
            <ExpandToggle
              label="Advanced Color"
              open={showAdvancedColor}
              onToggle={() => setShowAdvancedColor(!showAdvancedColor)}
            />
            {showAdvancedColor && <AdvancedColorPanel />}
          </>
        )}

        {/* ─── Typography Tab ───────────────────── */}
        {activeTab === "type" && (
          <>
            <TypographyPairPicker />
            <ExpandToggle
              label="Fine-tune Typography"
              open={showTypeTuner}
              onToggle={() => setShowTypeTuner(!showTypeTuner)}
            />
            {showTypeTuner && <TypographyTuner />}
          </>
        )}

        {/* ─── Sections Tab ─────────────────────── */}
        {activeTab === "sections" && (
          <>
            <SectionCard title="Navigation">
              <NavStylePicker />
              <NavLayoutPicker />
              <MobileMenuTypePicker />
            </SectionCard>

            <SectionCard title="Hero">
              <HeroStylePicker />
            </SectionCard>

            <SectionCard title="About">
              <AboutLayoutPicker />
              <TagStylePicker />
            </SectionCard>

            <SectionCard title="Gallery">
              <GalleryStylePicker />
            </SectionCard>

            <SectionCard title="Details">
              <DetailsLayoutPicker />
            </SectionCard>

            <SectionCard title="Footer">
              <FooterStylePicker />
              <FooterLayoutPicker />
            </SectionCard>

            <PageStyleGroup />
          </>
        )}

        {/* ─── Effects Tab ──────────────────────── */}
        {activeTab === "effects" && (
          <>
            <TexturePicker />

            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
                Texture Opacity
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round((config.textureOpacity ?? 0.5) * 100)}
                  onChange={(e) =>
                    applyChange({ textureOpacity: Number(e.target.value) / 100 })
                  }
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#333] accent-[#FF3333] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF3333]"
                />
                <span className="w-8 text-right text-[10px] font-mono text-[#555]">
                  {Math.round((config.textureOpacity ?? 0.5) * 100)}%
                </span>
              </div>
            </div>

            <ImageTreatmentPicker />
          </>
        )}

        {/* ─── Brand Tab ────────────────────────── */}
        {activeTab === "brand" && (
          <>
            <LogoUpload />
            {config.logoUrl && <LogoPlacementPicker />}
            <div className="rounded-lg border border-[#222] bg-[#0d0d0d] p-3 space-y-1">
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
          </>
        )}
      </div>
    </>
  );
}

CustomEditor.displayName = "CustomEditor";

function ExpandToggle({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-[#222] bg-[#0d0d0d] px-3 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555] transition-colors hover:border-[#333] hover:text-[#888]"
    >
      <span>{label}</span>
      <svg
        className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
    </button>
  );
}
