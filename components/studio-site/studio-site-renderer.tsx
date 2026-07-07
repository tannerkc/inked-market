"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cssVarsToStyle } from "@/lib/utils/builder";
import type { ResolvedThemeVars, StudioThemeConfig } from "@/lib/types/builder";
import {
  StudioSiteProvider,
  type ContentGroup,
  type StudioSitePage,
} from "./studio-site-context";
import type { StudioSiteData } from "./studio-site-data";
import { TemplateNavBar } from "@/components/builder/preview/template-nav-bar";
import { HeroSection } from "@/components/builder/preview/hero-section";
import { GallerySection } from "@/components/builder/preview/gallery-section";
import { ArtistStripsSection } from "@/components/builder/preview/artist-strips-section";
import { AboutSection } from "@/components/builder/preview/about-section";
import { DetailsSection } from "@/components/builder/preview/details-section";
import { FooterCTASection } from "@/components/builder/preview/footer-cta-section";
import { TemplateFooter } from "@/components/builder/preview/template-footer";
import { PoliciesSection } from "@/components/builder/preview/policies-section";
import { PoliciesPagePreview } from "@/components/builder/preview/policies-page-preview";

interface StudioSiteRendererProps {
  config: StudioThemeConfig;
  resolvedVars: ResolvedThemeVars;
  data: StudioSiteData;
  page?: StudioSitePage;
  /** Increment to replay scroll animations (builder only). */
  replayKey?: number;
  onNavigatePage?: (page: StudioSitePage) => void;
  /** Builder-only: enables prompt chips that deep-link into the Content panel. */
  onEditContent?: (group: ContentGroup) => void;
  className?: string;
}

function SectionDivider({ style }: { style: string }) {
  if (style === "none") return null;
  if (
    style === "solid" ||
    style === "gradient" ||
    style === "dotted" ||
    style === "ornament"
  ) {
    return <div data-divider={style} />;
  }
  return null;
}

/**
 * The single rendering engine for a studio's themed website. Used by both the
 * builder preview (StudioPagePreview adapter) and the public studio page. All
 * content flows in via `data`; styling via `config` + `resolvedVars`.
 */
export function StudioSiteRenderer({
  config,
  resolvedVars,
  data,
  page = "studio",
  replayKey = 0,
  onNavigatePage,
  onEditContent,
  className,
}: StudioSiteRendererProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cssVarStyle = cssVarsToStyle(resolvedVars);

  const animationStyle = config.animationStyle ?? "none";
  const dividerStyle = config.dividerStyle ?? "solid";
  const surfaceTexture = config.surfaceTexture ?? "none";

  // Scroll-triggered animation observer — re-runs when replayKey increments.
  useEffect(() => {
    if (animationStyle === "none") return;
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-animate]"),
    );
    if (!targets.length) return;

    targets.forEach((el) => {
      el.style.transition = "none";
      el.classList.remove("animate-visible");
    });

    void root.offsetHeight;

    targets.forEach((el) => {
      el.style.transition = "";
    });

    const scrollRoot = root.closest<HTMLElement>("[class*='overflow-y-auto']");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: scrollRoot, threshold: 0.1 },
    );

    const raf = requestAnimationFrame(() => {
      targets.forEach((el) => observer.observe(el));
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [animationStyle, replayKey]);

  const section = (
    name: string,
    children: React.ReactNode,
    density = true,
  ) => (
    <div
      data-section={name}
      {...(density ? { "data-density-section": "" } : {})}
      {...(animationStyle !== "none" ? { "data-animate": "" } : {})}
    >
      {children}
    </div>
  );

  const divider = () => <SectionDivider style={dividerStyle} />;
  const navigate = onNavigatePage ?? (() => {});

  return (
    <StudioSiteProvider value={{ config, data, onNavigatePage: navigate, onEditContent }}>
      <div
        ref={rootRef}
        data-builder-root
        data-texture={surfaceTexture}
        data-animation={animationStyle}
        className={cn("@container w-full", className)}
        style={
          {
            ...cssVarStyle,
            fontFamily: "var(--body-font)",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-primary)",
          } as React.CSSProperties & Record<string, string>
        }
      >
        {page === "policies" ? (
          <PoliciesPagePreview />
        ) : (
          <>
            <TemplateNavBar />

            <div data-builder-section="hero">
              {section("hero", <HeroSection />, false)}
            </div>

            {divider()}
            {config.galleryBeforeAbout ? (
              <>
                {section("gallery", <GallerySection />)}
                {divider()}
                {section("about", <AboutSection />)}
              </>
            ) : (
              section("about", <AboutSection />)
            )}
            {divider()}
            {section("artist-strips", <ArtistStripsSection />)}
            {divider()}
            {section("details", <DetailsSection />)}
            {divider()}
            {section("footer-cta", <FooterCTASection />, false)}
            {divider()}
            {section("policies", <PoliciesSection />)}
            {section("footer", <TemplateFooter />, false)}
          </>
        )}
      </div>
    </StudioSiteProvider>
  );
}
