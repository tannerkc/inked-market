// Builder types for the Studio Template Customizer

import type {
  PolicyConfig,
  PoliciesDisplayMode,
  PoliciesCardStyle,
  PoliciesPageLayout,
} from "@/lib/types/policies";

export type ThemePreset =
  | "midnight"
  | "parchment"
  | "sage"
  | "ocean"
  | "gold"
  | "mono";

export type HeroLayout = "split" | "fullbleed" | "centered" | "masthead" | "grid-overlay" | "zine";
/** Multi-photo heroes only: whether the collage leads with dedicated cover photos. */
export type HeroCoverMode = "single" | "multi";
export type GalleryLayout = "featured" | "uniform" | "masonry" | "carousel" | "film-strip" | "flash-sheet";
export type GalleryPhotosPerArtist = 3 | 5 | 8;
export type DetailsLayout = "three-col" | "two-one" | "stacked";
export type CtaLayout = "simple-minimal" | "contact-form" | "map-info" | "booking";
export type FooterLayout = "columns" | "minimal-bar" | "centered" | "none";
export type AboutLayout = "split" | "full-width" | "none";
export type CtaStyle = "filled" | "outline" | "pill";
export type TagStyle = "pill" | "square" | "outline";
export type BuilderMode = "split" | "inline";
export type DevicePreview = "desktop" | "tablet" | "mobile";
export type NavStyle = "none" | "static" | "floating" | "reveal";
export type NavLayout = "standard" | "logo-center" | "centered" | "minimal";
export type MobileMenuType = "dropdown" | "fullscreen" | "drawer";
export type TemplateSlug =
  | "bold-editorial"
  | "studio-minimal"
  | "dark-cinematic"
  | "warm-artisan"
  | "gutter-punk"
  | "fine-line"
  | "traditional-flash";

export type BuilderTier = "flash" | "custom";
export type Vibe = "raw" | "ghost" | "americana" | "noir" | "void" | "sacred";
export type GradientDirection = "diagonal" | "horizontal" | "radial" | "none";
export type GlowIntensity = "none" | "subtle" | "medium" | "intense";
export type HeadingLetterSpacing = "tight" | "normal" | "wide";
export type HeadingTextTransform = "uppercase" | "mixed" | "title";
export type HeadingFontWeight = "light" | "regular" | "bold" | "black";
export type Density = "compact" | "balanced" | "luxe";
export type BorderShape = "sharp" | "rounded" | "editorial";
export type DividerStyle = "none" | "solid" | "gradient" | "dotted" | "ornament";
export type AnimationStyle = "none" | "fade-up" | "scale" | "slide";
export type SurfaceTexture = "none" | "film-grain" | "parchment" | "concrete" | "leather" | "geometric";
export type ImageTreatment = "none" | "bw" | "duotone" | "film" | "desat" | "vignette";
export type LogoPlacement = "nav" | "hero" | "watermark";

export interface StudioThemeConfig {
  template: TemplateSlug;
  preset: ThemePreset;
  accentColor?: string;
  backgroundColor?: string;
  backgroundMode?: "light" | "dark";
  headingFont: string;
  bodyFont: string;
  heroLayout: HeroLayout;
  heroCoverMode?: HeroCoverMode;
  showHeroCta: boolean;
  ctaStyle: CtaStyle;
  showHeroSubtext: boolean;
  heroSubtext: string;
  galleryLayout: GalleryLayout;
  galleryPhotosPerArtist: GalleryPhotosPerArtist;
  detailsLayout: DetailsLayout;
  ctaLayout: CtaLayout;
  ctaGlow: boolean;
  footerLayout: FooterLayout;
  aboutLayout: AboutLayout;
  showSpecialties: boolean;
  showStudioDetails: boolean;
  tagStyle: TagStyle;
  navStyle: NavStyle;
  navLayout?: NavLayout;
  mobileMenuType?: MobileMenuType;
  builderMode: BuilderMode;
  builderTier: BuilderTier;
  vibe?: Vibe;
  secondaryAccentColor?: string;
  gradientDirection?: GradientDirection;
  glowIntensity?: GlowIntensity;
  headingLetterSpacing?: HeadingLetterSpacing;
  headingTextTransform?: HeadingTextTransform;
  headingFontWeight?: HeadingFontWeight;
  density?: Density;
  borderShape?: BorderShape;
  dividerStyle?: DividerStyle;
  animationStyle?: AnimationStyle;
  surfaceTexture?: SurfaceTexture;
  textureOpacity?: number;
  imageTreatment?: ImageTreatment;
  logoUrl?: string;
  logoPlacement?: LogoPlacement;
  galleryWatermarks?: boolean;
  customSocialPreview?: boolean;
  galleryBeforeAbout?: boolean;
  showGalleryHeading?: boolean;
  showPoliciesSection?: boolean;
  policiesDisplayMode?: PoliciesDisplayMode;
  policiesCardStyle?: PoliciesCardStyle;
  policiesPageLayout?: PoliciesPageLayout;
  policies?: PolicyConfig[];
}

export interface ResolvedThemeVars {
  "--accent": string;
  "--accent-bg": string;
  "--accent-text": string;
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
  "--accent-secondary": string;
  "--gradient-direction": string;
  "--glow-intensity": string;
  "--heading-letter-spacing": string;
  "--heading-text-transform": string;
  "--heading-font-weight": string;
  "--section-padding": string;
  "--element-gap": string;
  "--border-radius": string;
  "--border-radius-lg": string;
  "--divider-style": string;
  "--animation-style": string;
  "--texture-opacity": string;
  "--image-filter": string;
  "--image-overlay": string;
  "--surface-texture": string;
  "--texture-bg": string;
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
  headingFontWeight: HeadingFontWeight;
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

export interface SectionVariantOption<T extends string | number> {
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
