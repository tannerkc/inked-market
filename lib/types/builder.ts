// Builder types for the Studio Template Customizer

export type ThemePreset =
  | "midnight"
  | "parchment"
  | "sage"
  | "ocean"
  | "gold"
  | "mono";

export type HeroLayout = "split" | "fullbleed" | "centered";
export type GalleryLayout = "featured" | "uniform" | "masonry" | "carousel";
export type DetailsLayout = "three-col" | "two-one" | "stacked";
export type CtaLayout = "simple-minimal" | "contact-form" | "map-info" | "booking";
export type FooterLayout = "columns" | "minimal-bar" | "centered" | "none";
export type AboutLayout = "split" | "full-width" | "none";
export type HeroCtaStyle = "filled" | "outline" | "pill";
export type TagStyle = "pill" | "square" | "outline";
export type BuilderMode = "split" | "inline";
export type DevicePreview = "desktop" | "tablet" | "mobile";
export type NavStyle = "none" | "static" | "floating" | "reveal";
export type TemplateSlug =
  | "bold-editorial"
  | "clean-minimal"
  | "immersive-dark"
  | "warm-artisan";

export interface StudioThemeConfig {
  template: TemplateSlug;
  preset: ThemePreset;
  accentColor?: string;
  backgroundColor?: string;
  backgroundMode?: "light" | "dark";
  headingFont: string;
  bodyFont: string;
  heroLayout: HeroLayout;
  showHeroCta: boolean;
  heroCtaStyle: HeroCtaStyle;
  showHeroSubtext: boolean;
  heroSubtext: string;
  galleryLayout: GalleryLayout;
  detailsLayout: DetailsLayout;
  ctaLayout: CtaLayout;
  ctaGlow: boolean;
  footerLayout: FooterLayout;
  aboutLayout: AboutLayout;
  showSpecialties: boolean;
  showStudioDetails: boolean;
  tagStyle: TagStyle;
  navStyle: NavStyle;
  builderMode: BuilderMode;
}

export interface ResolvedThemeVars {
  "--accent": string;
  "--accent-bg": string;
  "--bg-primary": string;
  "--bg-raised": string;
  "--bg-sunken": string;
  "--bg-deep": string;
  "--text-primary": string;
  "--text-secondary": string;
  "--text-muted": string;
  "--border": string;
  "--tag-bg": string;
  "--tag-text": string;
  "--widget-1": string;
  "--widget-2": string;
  "--widget-3": string;
  "--widget-label": string;
  "--hero-bg": string;
  "--footer-glow": string;
  "--widget-border": string;
  "--heading-font": string;
  "--body-font": string;
}

export interface ThemePresetDefinition {
  name: string;
  slug: ThemePreset;
  accent: string;
  background: string;
  mode: "light" | "dark";
  description: string;
  vars: ResolvedThemeVars;
}

export interface TypographyPairing {
  name: string;
  headingFont: string;
  bodyFont: string;
  character: string;
}

export interface AccentColorOption {
  name: string;
  hex: string;
}

export interface BackgroundOption {
  name: string;
  hex: string;
  mode: "light" | "dark";
}

export interface SectionVariantOption<T extends string> {
  label: string;
  value: T;
  description: string;
}

export interface ThemeEditorState {
  config: StudioThemeConfig;
  resolvedVars: ResolvedThemeVars;
  history: StudioThemeConfig[];
  historyIndex: number;
  isDirty: boolean;
}

export interface TemplateDefinition {
  slug: TemplateSlug;
  name: string;
  description: string;
  badge?: string;
  defaults: Omit<StudioThemeConfig, "builderMode">;
  previewAccent: string;
  previewBg: string;
  previewMode: "light" | "dark";
}

export interface ThemeEditorActions {
  applyChange: (partial: Partial<StudioThemeConfig>) => void;
  applyPreset: (preset: ThemePreset) => void;
  applyTemplate: (slug: TemplateSlug) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;
  saveDraft: () => void;
  loadDraft: () => StudioThemeConfig | null;
}
