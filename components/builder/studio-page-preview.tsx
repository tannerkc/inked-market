"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { TemplateNavBar } from "@/components/builder/preview/template-nav-bar";
import { HeroSection } from "@/components/builder/preview/hero-section";
import { GallerySection } from "@/components/builder/preview/gallery-section";
import { AboutSection } from "@/components/builder/preview/about-section";
import { DetailsSection } from "@/components/builder/preview/details-section";
import { FooterCTASection } from "@/components/builder/preview/footer-cta-section";
import { TemplateFooter } from "@/components/builder/preview/template-footer";
import type { ResolvedThemeVars } from "@/lib/types/builder";

interface StudioPagePreviewProps {
  interactive?: boolean;
  className?: string;
}

export function StudioPagePreview({
  interactive = false,
  className,
}: StudioPagePreviewProps) {
  const { resolvedVars } = useBuilder();

  // Convert ResolvedThemeVars to inline style object
  const cssVarStyle = Object.entries(resolvedVars).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  const sectionWrapper = (
    sectionName: string,
    children: React.ReactNode,
  ) => {
    if (interactive) {
      return (
        <div data-section={sectionName}>
          {children}
        </div>
      );
    }
    return children;
  };

  return (
    <div
      data-builder-root
      className={cn("w-full", className)}
      style={{
        ...cssVarStyle,
        fontFamily: "var(--body-font)",
        color: "var(--text-primary)",
        backgroundColor: "var(--bg-primary)",
      } as React.CSSProperties & Record<string, string>}
    >
      {sectionWrapper("nav", <TemplateNavBar />)}
      <div data-builder-section="hero">
        {sectionWrapper("hero", <HeroSection />)}
      </div>
      {sectionWrapper("about", <AboutSection />)}
      {sectionWrapper("gallery", <GallerySection />)}
      {sectionWrapper("details", <DetailsSection />)}
      {sectionWrapper("footer-cta", <FooterCTASection />)}
      {sectionWrapper("footer", <TemplateFooter />)}
    </div>
  );
}
