"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { useMobileSheet } from "./mobile-sheet-orchestrator";
import { SECTION_DEFS } from "@/lib/config/builder-sections";
import { cssVarsToStyle } from "@/lib/utils/builder";
import { EditableSection } from "@/components/builder/editable-section";
import { TemplateNavBar } from "@/components/builder/preview/template-nav-bar";
import { HeroSection } from "@/components/builder/preview/hero-section";
import { GallerySection } from "@/components/builder/preview/gallery-section";
import { ArtistStripsSection } from "@/components/builder/preview/artist-strips-section";
import { AboutSection } from "@/components/builder/preview/about-section";
import { DetailsSection } from "@/components/builder/preview/details-section";
import { FooterCTASection } from "@/components/builder/preview/footer-cta-section";
import { TemplateFooter } from "@/components/builder/preview/template-footer";

export function MobilePreviewCanvas() {
  const { config, resolvedVars } = useBuilder();
  const { state, openSection, close } = useMobileSheet();

  const cssVarStyle = useMemo(() => cssVarsToStyle(resolvedVars), [resolvedVars]);

  const surfaceTexture = config.surfaceTexture ?? "none";
  const animationStyle = config.animationStyle ?? "none";

  // Map section IDs to their React components
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

  // Filter sections based on config (gallery position is conditional)
  const visibleSections = useMemo(
    () =>
      SECTION_DEFS.filter(
        (s) => s.id !== "gallery" || config.galleryBeforeAbout,
      ),
    [config.galleryBeforeAbout],
  );

  const handleSectionClick = useCallback(
    (sectionId: string) => openSection(sectionId),
    [openSection],
  );

  // Close sheet when tapping empty canvas area
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("[data-section]") &&
        !target.closest("[data-mobile-sheet]")
      ) {
        close();
      }
    },
    [close],
  );

  // Escape key closes sheet
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <div
      className="h-full overflow-y-auto"
      onClick={handleCanvasClick}
    >
      <div
        data-builder-root
        data-texture={surfaceTexture}
        data-animation={animationStyle}
        className="@container min-h-full pb-4"
        style={
          {
            ...cssVarStyle,
            fontFamily: "var(--body-font)",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-primary)",
          } as React.CSSProperties & Record<string, string>
        }
      >
        {visibleSections.map((section) => (
          <EditableSection
            key={section.id}
            name={section.name}
            sectionId={section.id}
            isActive={
              state.isOpen &&
              state.type === "section" &&
              state.sectionId === section.id
            }
            onClick={() => handleSectionClick(section.id)}
          >
            {sectionComponents[section.id]}
          </EditableSection>
        ))}
      </div>
    </div>
  );
}
