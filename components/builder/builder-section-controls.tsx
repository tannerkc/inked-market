"use client";

import React from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import {
  NavStylePicker,
  NavLayoutPicker,
  MobileMenuTypePicker,
  HeroStylePicker,
  GalleryStylePicker,
  GalleryPhotosPicker,
  AboutLayoutPicker,
  TagStylePicker,
  DetailsLayoutPicker,
  FooterStylePicker,
  FooterLayoutPicker,
  CtaStylePicker,
} from "@/components/builder/controls";

/**
 * Shared section control compositions.
 * Used by: mobile section sheets, desktop section popovers.
 */
export function SectionControls({ sectionId }: { sectionId: string }) {
  const { config } = useBuilder();
  const tier = config.builderTier ?? "flash";

  switch (sectionId) {
    case "nav":
      return (
        <div className="space-y-4">
          <NavStylePicker />
          {tier === "custom" && (
            <>
              <NavLayoutPicker />
              <MobileMenuTypePicker />
            </>
          )}
        </div>
      );

    case "hero":
      return <HeroStylePicker />;

    case "gallery":
      return <GalleryStylePicker />;

    case "about":
      return (
        <div className="space-y-4">
          <AboutLayoutPicker />
          <TagStylePicker />
        </div>
      );

    case "artist-strips":
      return <GalleryPhotosPicker />;

    case "details":
      return <DetailsLayoutPicker />;

    case "footer-cta":
      return (
        <div className="space-y-4">
          <CtaStylePicker />
          <FooterStylePicker />
        </div>
      );

    case "footer":
      return <FooterLayoutPicker />;

    default:
      return null;
  }
}
