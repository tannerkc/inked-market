"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { TemplateSwitcher } from "@/components/builder/template-switcher";
import {
  ThemePresetPicker,
  AccentColorPicker,
  BackgroundPicker,
  TypographyPairPicker,
  HeroStylePicker,
  GalleryStylePicker,
  AboutLayoutPicker,
  DetailsLayoutPicker,
  FooterStylePicker,
  FooterLayoutPicker,
  NavStylePicker,
  TagStylePicker,
  MagnumUpsellHint,
} from "@/components/builder/controls";

type EditorTab = "theme" | "colors" | "type" | "sections";

const tabs: { label: string; value: EditorTab }[] = [
  { label: "Theme", value: "theme" },
  { label: "Colors", value: "colors" },
  { label: "Type", value: "type" },
  { label: "Sections", value: "sections" },
];

export function EditorPanel() {
  const [activeTab, setActiveTab] = useState<EditorTab>("theme");

  return (
    <div className="flex flex-col w-[380px] min-w-[380px] h-full bg-[#111] border-r border-[#222]">
      {/* Tab bar */}
      <div className="flex border-b border-[#222]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] transition-colors border-b-2",
              activeTab === tab.value
                ? "text-red-500 border-red-500"
                : "text-[#555] border-transparent hover:text-[#888]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "theme" && (
          <>
            <TemplateSwitcher />
            <ThemePresetPicker />
          </>
        )}

        {activeTab === "colors" && (
          <>
            <AccentColorPicker />
            <BackgroundPicker />
          </>
        )}

        {activeTab === "type" && <TypographyPairPicker />}

        {activeTab === "sections" && (
          <>
            <NavStylePicker />
            <HeroStylePicker />
            <AboutLayoutPicker />
            <TagStylePicker />
            <GalleryStylePicker />
            <DetailsLayoutPicker />
            <FooterStylePicker />
            <FooterLayoutPicker />
            <MagnumUpsellHint
              title="Section Reordering"
              description="Drag to rearrange sections"
            />
            <MagnumUpsellHint
              title="Premium Templates"
              description="+6 exclusive themes"
            />
          </>
        )}
      </div>
    </div>
  );
}
