/**
 * Single source of truth for builder toolbar tab definitions.
 * Consumed by: mobile mini-bar, inline overlay builder bottom toolbar.
 * Each consumer augments with its own icon format (SVG elements vs unicode glyphs).
 */

export interface BuilderTabDef {
  id: string;
  label: string;
}

export const FLASH_TABS: BuilderTabDef[] = [
  { id: "theme",    label: "Theme"    },
  { id: "type",     label: "Type"     },
  { id: "sections", label: "Sections" },
];

export const CUSTOM_TABS: BuilderTabDef[] = [
  ...FLASH_TABS,
  { id: "effects", label: "Effects" },
  { id: "brand",   label: "Brand"   },
];

export const GLOBAL_TAB_TITLES: Record<string, string> = {
  theme:    "Theme & Colors",
  type:     "Typography",
  sections: "Sections",
  effects:  "Effects",
  brand:    "Brand & Logo",
};

export function getGlobalTabTitle(tab: string): string {
  return GLOBAL_TAB_TITLES[tab] ?? tab;
}
