"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { useOverlayContainer } from "@/lib/contexts/overlay-context";
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
import { GlobalTabContent } from "@/components/builder/builder-global-controls";
import { SectionControls } from "@/components/builder/builder-section-controls";
import { SECTION_DEFS } from "@/lib/config/builder-sections";
import { FLASH_TABS, CUSTOM_TABS } from "@/lib/config/builder-toolbar-tabs";
import { cssVarsToStyle, syncCssVarsToElement } from "@/lib/utils/builder";
import type { DevicePreview } from "@/lib/types/builder";

const TAB_ICONS: Record<string, string> = {
  theme: "◐",
  type: "Aa",
  sections: "▤",
  effects: "◎",
  brand: "◇",
};

const FLASH_BUTTONS: ToolbarButtonDef[] = FLASH_TABS.map((t) => ({
  id: t.id,
  icon: TAB_ICONS[t.id],
  label: t.label,
}));

const CUSTOM_BUTTONS: ToolbarButtonDef[] = CUSTOM_TABS.map((t) => ({
  id: t.id,
  icon: TAB_ICONS[t.id],
  label: t.label,
}));

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

  const overlayEl = useOverlayContainer();

  useEffect(() => {
    if (overlayEl) syncCssVarsToElement(overlayEl, resolvedVars);
  }, [overlayEl, resolvedVars]);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [device, setDevice] = useState<DevicePreview>("desktop");

  // Constrain overlay to device frame width so bottom sheets stay within bounds
  useEffect(() => {
    if (!overlayEl) return;
    const mw = device === "desktop" ? "" : device === "tablet" ? "768px" : "390px";
    overlayEl.style.maxWidth = mw;
    overlayEl.style.marginLeft = mw ? "auto" : "";
    overlayEl.style.marginRight = mw ? "auto" : "";
    return () => {
      overlayEl.style.maxWidth = "";
      overlayEl.style.marginLeft = "";
      overlayEl.style.marginRight = "";
    };
  }, [overlayEl, device]);

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

  const cssVarStyle = cssVarsToStyle(resolvedVars);

  const surfaceTexture = config.surfaceTexture ?? "none";
  const animationStyle = config.animationStyle ?? "none";
  const toolbarButtons = tier === "custom" ? CUSTOM_BUTTONS : FLASH_BUTTONS;

  const sectionComponents: Record<string, React.ReactNode> = useMemo(
    () => ({
      nav: <TemplateNavBar />,
      hero: <HeroSection />,
      gallery: <GallerySection />,
      about: <AboutSection />,
      "artist-strips": <ArtistStripsSection />,
      details: <DetailsSection />,
      "footer-cta": <FooterCTASection />,
      footer: <TemplateFooter />,
    }),
    [],
  );

  const visibleSections = useMemo(
    () =>
      SECTION_DEFS.filter(
        (s) => s.id !== "gallery" || config.galleryBeforeAbout,
      ),
    [config.galleryBeforeAbout],
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
          {visibleSections.map((section) => (
            <EditableSection
              key={section.id}
              name={section.name}
              sectionId={section.id}
              isActive={activeSection === section.id}
              onClick={() => handleSectionClick(section.id)}
            >
              {sectionComponents[section.id]}

              <SectionPopover
                title={section.title}
                isOpen={activeSection === section.id}
                onClose={() => setActiveSection(null)}
              >
                <SectionControls sectionId={section.id} />
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

      {/* Flyouts — content from shared GlobalTabContent */}
      {toolbarButtons.map((btn) => (
        <ToolbarFlyout
          key={btn.id}
          title={btn.id === "theme" && tier === "flash" ? "Theme & Colors" : btn.label}
          isOpen={activeFlyout === btn.id}
          onClose={closeFlyout}
        >
          <GlobalTabContent tab={btn.id} />
        </ToolbarFlyout>
      ))}
    </>
  );
}
