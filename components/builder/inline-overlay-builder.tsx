"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { EditableSection } from "@/components/builder/editable-section";
import { SectionPopover } from "@/components/builder/section-popover";
import { BottomToolbar } from "@/components/builder/bottom-toolbar";
import { ToolbarFlyout } from "@/components/builder/toolbar-flyout";
import { DeviceFrameWrapper } from "@/components/builder/device-frame-wrapper";
import { TemplateNavBar } from "@/components/builder/preview/template-nav-bar";
import { HeroSection } from "@/components/builder/preview/hero-section";
import { GallerySection } from "@/components/builder/preview/gallery-section";
import { AboutSection } from "@/components/builder/preview/about-section";
import { DetailsSection } from "@/components/builder/preview/details-section";
import { FooterCTASection } from "@/components/builder/preview/footer-cta-section";
import { TemplateFooter } from "@/components/builder/preview/template-footer";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import { ThemePresetPicker } from "@/components/builder/controls/theme-preset-picker";
import { AccentColorPicker } from "@/components/builder/controls/accent-color-picker";
import { BackgroundPicker } from "@/components/builder/controls/background-picker";
import { TypographyPairPicker } from "@/components/builder/controls/typography-pair-picker";
import { HeroStylePicker } from "@/components/builder/controls/hero-style-picker";
import { GalleryStylePicker } from "@/components/builder/controls/gallery-style-picker";
import { AboutLayoutPicker } from "@/components/builder/controls/about-layout-picker";
import { DetailsLayoutPicker } from "@/components/builder/controls/details-layout-picker";
import { FooterStylePicker } from "@/components/builder/controls/footer-style-picker";
import { FooterLayoutPicker } from "@/components/builder/controls/footer-layout-picker";
import { NavStylePicker } from "@/components/builder/controls/nav-style-picker";
import { TagStylePicker } from "@/components/builder/controls/tag-style-picker";
import type { DevicePreview } from "@/lib/types/builder";

interface SectionConfig {
  id: string;
  name: string;
  component: React.ReactNode;
  popoverTitle: string;
  controls: React.ReactNode;
}

export function InlineOverlayBuilder() {
  const editor = useBuilder();
  const { resolvedVars } = editor;

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [device, setDevice] = useState<DevicePreview>("desktop");

  // Close all popovers and flyouts on Escape, and outside clicks
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveSection(null);
        setActiveFlyout(null);
      }
    }

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside a popover, flyout, or toolbar
      if (
        target.closest("[data-builder-popover]") ||
        target.closest("[data-builder-flyout]") ||
        target.closest("[data-builder-toolbar]")
      ) {
        return;
      }
      // Close flyouts if clicking outside them
      setActiveFlyout(null);
      // Close section popovers if clicking outside them
      // (but not when clicking a different section — that's handled by handleSectionClick)
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

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      // Close flyout when opening a section popover
      setActiveFlyout(null);
      setActiveSection((prev) => (prev === sectionId ? null : sectionId));
    },
    []
  );

  const handleFlyoutToggle = useCallback((name: string) => {
    // Close section popover when opening a flyout
    setActiveSection(null);
    setActiveFlyout((prev) => (prev === name ? null : name));
  }, []);

  // Convert resolved vars to inline CSS properties
  const cssVarStyle = Object.entries(resolvedVars).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  const sections: SectionConfig[] = [
    {
      id: "nav",
      name: "Navigation",
      component: <TemplateNavBar />,
      popoverTitle: "Navigation Bar",
      controls: <NavStylePicker />,
    },
    {
      id: "hero",
      name: "Hero",
      component: <HeroSection />,
      popoverTitle: "Hero Section",
      controls: (
        <>
          <HeroStylePicker />
          <TagStylePicker />
        </>
      ),
    },
    {
      id: "about",
      name: "About",
      component: <AboutSection />,
      popoverTitle: "About Section",
      controls: <AboutLayoutPicker />,
    },
    {
      id: "gallery",
      name: "Gallery",
      component: <GallerySection />,
      popoverTitle: "Gallery Section",
      controls: <GalleryStylePicker />,
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
  ];

  return (
    <>
      {/* Preview area with themed CSS variables */}
      <div
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
        activeFlyout={activeFlyout}
        onFlyoutToggle={handleFlyoutToggle}
        device={device}
        onDeviceChange={setDevice}
        onReset={editor.reset}
      />

      {/* Flyout panels */}
      <ToolbarFlyout
        title="Theme"
        isOpen={activeFlyout === "theme"}
        onClose={() => setActiveFlyout(null)}
      >
        <TemplateSwitcher />
        <ThemePresetPicker />
      </ToolbarFlyout>

      <ToolbarFlyout
        title="Colors"
        isOpen={activeFlyout === "colors"}
        onClose={() => setActiveFlyout(null)}
      >
        <div className="space-y-4">
          <AccentColorPicker />
          <BackgroundPicker />
        </div>
      </ToolbarFlyout>

      <ToolbarFlyout
        title="Typography"
        isOpen={activeFlyout === "type"}
        onClose={() => setActiveFlyout(null)}
      >
        <TypographyPairPicker />
      </ToolbarFlyout>
    </>
  );
}
