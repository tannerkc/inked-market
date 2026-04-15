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
  GalleryPhotosPicker,
  DetailsLayoutPicker,
  FooterStylePicker,
  FooterLayoutPicker,
  PageStyleGroup,
  TexturePicker,
  ImageTreatmentPicker,
  LogoUpload,
  LogoPlacementPicker,
  ToggleRow,
  PoliciesEditorCustom,
} from "@/components/builder/controls";

type CustomTab = "theme" | "type" | "sections" | "effects" | "brand" | "policies";

const tabs: { label: string; value: CustomTab }[] = [
  { label: "Theme", value: "theme" },
  { label: "Type", value: "type" },
  { label: "Sections", value: "sections" },
  { label: "Effects", value: "effects" },
  { label: "Brand", value: "brand" },
  { label: "Policies", value: "policies" },
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-chrome-border bg-ink-black-raised p-3">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-tertiary">
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
      <div className="flex overflow-x-auto border-b border-chrome-border scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "shrink-0 px-3 py-3 text-[10px] font-semibold uppercase tracking-[1.5px] transition-colors border-b-2 whitespace-nowrap",
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

            {config.galleryBeforeAbout && (
              <SectionCard title="Gallery">
                <GalleryStylePicker />
              </SectionCard>
            )}

            <SectionCard title="Artists">
              <GalleryPhotosPicker />
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
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
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
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-chrome-border-hover accent-ink-red [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-red"
                />
                <span className="w-8 text-right text-[10px] font-mono text-chrome-text-dim">
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
            <div className="rounded-lg border border-chrome-border bg-ink-black-raised p-3 space-y-1">
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

        {/* ─── Policies Tab ────────────────────── */}
        {activeTab === "policies" && <PoliciesEditorCustom />}
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
      className="flex w-full items-center justify-between rounded-lg border border-chrome-border bg-ink-black-raised px-3 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim transition-colors hover:border-chrome-border-hover hover:text-chrome-text-secondary"
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
