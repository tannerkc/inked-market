"use client";

import { useEffect, useRef } from "react";
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

function SectionDivider({ style }: { style: string }) {
  if (style === "none" || style === "solid" || style === "gradient" || style === "dotted" || style === "ornament") {
    if (style === "none") return null;
    return <div data-divider={style} />;
  }
  return null;
}

export function StudioPagePreview({
  interactive = false,
  className,
}: StudioPagePreviewProps) {
  const { config, resolvedVars, replayKey } = useBuilder();
  const rootRef = useRef<HTMLDivElement>(null);

  const cssVarStyle = Object.entries(resolvedVars).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  const animationStyle = config.animationStyle ?? "none";
  const dividerStyle = config.dividerStyle ?? "solid";
  const surfaceTexture = config.surfaceTexture ?? "none";

  // Scroll-triggered animation observer — also re-runs when replayKey increments
  useEffect(() => {
    if (animationStyle === "none") return;
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-animate]"));
    if (!targets.length) return;

    // Disable transitions and reset to invisible state
    targets.forEach((el) => {
      el.style.transition = "none";
      el.classList.remove("animate-visible");
    });

    // Force a synchronous reflow so the browser commits the opacity:0 state
    // before transitions are re-enabled. Without this, adding animate-visible
    // back fires before the reset paint and the animation never plays.
    void root.offsetHeight;

    // Re-enable transitions now that the reset state is committed
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

  return (
    <div
      ref={rootRef}
      data-builder-root
      data-texture={surfaceTexture}
      data-animation={animationStyle}
      className={cn("@container w-full", className)}
      style={{
        ...cssVarStyle,
        fontFamily: "var(--body-font)",
        color: "var(--text-primary)",
        backgroundColor: "var(--bg-primary)",
      } as React.CSSProperties & Record<string, string>}
    >
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
        <>
          {section("about", <AboutSection />)}
          {divider()}
          {section("gallery", <GallerySection />)}
        </>
      )}
      {divider()}
      {section("details", <DetailsSection />)}
      {divider()}
      {section("footer-cta", <FooterCTASection />, false)}
      {section("footer", <TemplateFooter />, false)}
    </div>
  );
}
