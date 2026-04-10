"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { EditableSection } from "@/components/builder/editable-section";
import { SectionPopover } from "@/components/builder/section-popover";
import { BottomToolbar, type ToolbarButtonDef } from "@/components/builder/bottom-toolbar";
import { ToolbarFlyout } from "@/components/builder/toolbar-flyout";
import { DeviceFrameWrapper } from "@/components/builder/device-frame-wrapper";
import { TemplateNavBar } from "@/components/builder/preview/template-nav-bar";
import { HeroSection } from "@/components/builder/preview/hero-section";
import { GallerySection } from "@/components/builder/preview/gallery-section";
import { ArtistStripsSection } from "@/components/builder/preview/artist-strips-section";
import { AboutSection } from "@/components/builder/preview/about-section";
import { DetailsSection } from "@/components/builder/preview/details-section";
import { FooterCTASection } from "@/components/builder/preview/footer-cta-section";
import { TemplateFooter } from "@/components/builder/preview/template-footer";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import {
  ThemePresetPicker,
  AccentColorPicker,
  BackgroundPicker,
  TypographyPairPicker,
  HeroStylePicker,
  GalleryStylePicker,
  GalleryPhotosPicker,
  AboutLayoutPicker,
  DetailsLayoutPicker,
  FooterStylePicker,
  FooterLayoutPicker,
  NavStylePicker,
  NavLayoutPicker,
  TagStylePicker,
  AdvancedColorPanel,
  TypographyTuner,
  VibePicker,
  PageStyleGroup,
  TexturePicker,
  ImageTreatmentPicker,
  LogoUpload,
  LogoPlacementPicker,
  ToggleRow,
} from "@/components/builder/controls";
import type { DevicePreview } from "@/lib/types/builder";

interface SectionConfig {
  id: string;
  name: string;
  component: React.ReactNode;
  popoverTitle: string;
  controls: React.ReactNode;
}

const FLASH_BUTTONS: ToolbarButtonDef[] = [
  { id: "theme", icon: "◐", label: "Theme & Colors" },
  { id: "type", icon: "Aa", label: "Type" },
  { id: "sections", icon: "▤", label: "Sections" },
];

const CUSTOM_BUTTONS: ToolbarButtonDef[] = [
  { id: "theme", icon: "◐", label: "Theme" },
  { id: "type", icon: "Aa", label: "Type" },
  { id: "sections", icon: "▤", label: "Sections" },
  { id: "effects", icon: "◎", label: "Effects" },
  { id: "brand", icon: "◇", label: "Brand" },
];

export function InlineOverlayBuilder() {
  const editor = useBuilder();
  const { config, resolvedVars, applyChange } = editor;
  const tier = config.builderTier ?? "flash";

  const handleTierChange = useCallback((newTier: typeof tier) => {
    applyChange({ builderTier: newTier });
    try {
      localStorage.setItem("inked-builder-tier", newTier);
    } catch {
      // localStorage unavailable
    }
  }, [applyChange]);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [device, setDevice] = useState<DevicePreview>("desktop");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveSection(null);
        setActiveFlyout(null);
      }
    }

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (
        target.closest("[data-builder-popover]") ||
        target.closest("[data-builder-flyout]") ||
        target.closest("[data-builder-toolbar]")
      ) {
        return;
      }
      setActiveFlyout(null);
      if (!target.closest("[data-section]")) {
        setActiveSection(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveFlyout(null);
    setActiveSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const handleFlyoutToggle = useCallback((name: string) => {
    setActiveSection(null);
    setActiveFlyout((prev) => (prev === name ? null : name));
  }, []);

  const cssVarStyle = Object.entries(resolvedVars).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  const surfaceTexture = config.surfaceTexture ?? "none";
  const animationStyle = config.animationStyle ?? "none";
  const toolbarButtons = tier === "custom" ? CUSTOM_BUTTONS : FLASH_BUTTONS;

  const sections: SectionConfig[] = useMemo(
    () => [
      {
        id: "nav",
        name: "Navigation",
        component: <TemplateNavBar />,
        popoverTitle: "Navigation Bar",
        controls: (
          <>
            <NavStylePicker />
            {tier === "custom" && <NavLayoutPicker />}
          </>
        ),
      },
      {
        id: "hero",
        name: "Hero",
        component: <HeroSection />,
        popoverTitle: "Hero Section",
        controls: <HeroStylePicker />,
      },
      {
        id: "about",
        name: "About",
        component: <AboutSection />,
        popoverTitle: "About Section",
        controls: (
          <>
            <AboutLayoutPicker />
            <TagStylePicker />
          </>
        ),
      },
      ...(config.galleryBeforeAbout ? [{
        id: "gallery",
        name: "Gallery",
        component: <GallerySection />,
        popoverTitle: "Gallery Style",
        controls: <GalleryStylePicker />,
      }] : []),
      {
        id: "artist-strips",
        name: "Artists",
        component: <ArtistStripsSection />,
        popoverTitle: "Artist Strips",
        controls: <GalleryPhotosPicker />,
      },
      {
        id: "details",
        name: "Details",
        component: <DetailsSection />,
        popoverTitle: "Details Section",
        controls: <DetailsLayoutPicker />,
      },
      {
        id: "footer-cta",
        name: "CTA",
        component: <FooterCTASection />,
        popoverTitle: "CTA Section",
        controls: <FooterStylePicker />,
      },
      {
        id: "footer",
        name: "Footer",
        component: <TemplateFooter />,
        popoverTitle: "Footer",
        controls: <FooterLayoutPicker />,
      },
    ],
    [config.galleryBeforeAbout, tier],
  );

  const closeFlyout = useCallback(() => setActiveFlyout(null), []);

  return (
    <>
      {/* Preview area with themed CSS variables */}
      <div
        data-builder-root
        data-texture={surfaceTexture}
        data-animation={animationStyle}
        className="relative pb-[100px]"
        style={{
          ...cssVarStyle,
          fontFamily: "var(--body-font)",
          color: "var(--text-primary)",
          backgroundColor: "var(--bg-primary)",
        } as React.CSSProperties & Record<string, string>}
      >
        <DeviceFrameWrapper device={device}>
          {sections.map((section) => (
            <EditableSection
              key={section.id}
              name={section.name}
              sectionId={section.id}
              isActive={activeSection === section.id}
              onClick={() => handleSectionClick(section.id)}
            >
              {section.component}

              <SectionPopover
                title={section.popoverTitle}
                isOpen={activeSection === section.id}
                onClose={() => setActiveSection(null)}
              >
                {section.controls}
              </SectionPopover>
            </EditableSection>
          ))}
        </DeviceFrameWrapper>
      </div>

      {/* Bottom toolbar */}
      <BottomToolbar
        buttons={toolbarButtons}
        activeFlyout={activeFlyout}
        onFlyoutToggle={handleFlyoutToggle}
        device={device}
        onDeviceChange={setDevice}
        onReset={editor.reset}
        tier={tier}
        onTierChange={handleTierChange}
      />

      {/* ─── Shared flyouts (both tiers) ─────────────────────── */}
      <ToolbarFlyout
        title={tier === "flash" ? "Theme & Colors" : "Theme"}
        isOpen={activeFlyout === "theme"}
        onClose={closeFlyout}
      >
        <TemplateSwitcher />
        <ThemePresetPicker />
        {tier === "flash" && (
          <>
            <AccentColorPicker />
            <BackgroundPicker />
          </>
        )}
        {tier === "custom" && (
          <>
            <AccentColorPicker />
            <BackgroundPicker />
            <AdvancedColorPanel />
          </>
        )}
      </ToolbarFlyout>

      <ToolbarFlyout
        title="Typography"
        isOpen={activeFlyout === "type"}
        onClose={closeFlyout}
      >
        <TypographyPairPicker />
        {tier === "custom" && <TypographyTuner />}
      </ToolbarFlyout>

      <ToolbarFlyout
        title="Sections"
        isOpen={activeFlyout === "sections"}
        onClose={closeFlyout}
      >
        {tier === "flash" ? (
          <div className="space-y-6">
            <VibePicker />
            <div>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
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
        )}
      </ToolbarFlyout>

      {/* ─── Custom-only flyouts ─────────────────────────────── */}
      {tier === "custom" && (
        <>
          <ToolbarFlyout
            title="Effects"
            isOpen={activeFlyout === "effects"}
            onClose={closeFlyout}
          >
            <TexturePicker />
            <ImageTreatmentPicker />
          </ToolbarFlyout>

          <ToolbarFlyout
            title="Brand"
            isOpen={activeFlyout === "brand"}
            onClose={closeFlyout}
          >
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
          </ToolbarFlyout>
        </>
      )}
    </>
  );
}
