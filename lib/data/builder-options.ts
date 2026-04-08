import type {
  SectionVariantOption,
  HeroLayout,
  GalleryLayout,
  DetailsLayout,
  CtaLayout,
  CtaStyle,
  FooterLayout,
  TagStyle,
  NavStyle,
  NavLayout,
  AboutLayout,
  Vibe,
  Density,
  BorderShape,
  DividerStyle,
  AnimationStyle,
  SurfaceTexture,
  ImageTreatment,
  LogoPlacement,
  GradientDirection,
  GlowIntensity,
  HeadingLetterSpacing,
  HeadingTextTransform,
  HeadingFontWeight,
} from "@/lib/types/builder";

export const heroOptions: SectionVariantOption<HeroLayout>[] = [
  {
    label: "Split",
    value: "split",
    description: "Image left, text right",
  },
  {
    label: "Full Bleed",
    value: "fullbleed",
    description: "Full-width image with text overlay",
  },
  {
    label: "Centered",
    value: "centered",
    description: "Centered text over image",
  },
];

export const galleryOptions: SectionVariantOption<GalleryLayout>[] = [
  {
    label: "Featured Grid",
    value: "featured",
    description: "Hero image with supporting grid",
  },
  {
    label: "Uniform Grid",
    value: "uniform",
    description: "Equal-size tiles",
  },
  {
    label: "Masonry",
    value: "masonry",
    description: "Pinterest-style staggered layout",
  },
  {
    label: "Carousel",
    value: "carousel",
    description: "Horizontal scroll",
  },
];

export const detailsOptions: SectionVariantOption<DetailsLayout>[] = [
  {
    label: "3-Column",
    value: "three-col",
    description: "Classic magazine layout",
  },
  {
    label: "2 + 1",
    value: "two-one",
    description: "Wide reviews, stacked side panels",
  },
  {
    label: "Stacked",
    value: "stacked",
    description: "Full-width cards",
  },
];

export const ctaOptions: SectionVariantOption<CtaLayout>[] = [
  { label: "Minimal", value: "simple-minimal", description: "Clean centered CTA" },
  { label: "Contact Form", value: "contact-form", description: "Split layout with inquiry form" },
  { label: "Map + Info", value: "map-info", description: "Location details with map" },
  { label: "Booking", value: "booking", description: "Conversion-focused with trust signals" },
];

export const footerLayoutOptions: SectionVariantOption<FooterLayout>[] = [
  {
    label: "Columns",
    value: "columns",
    description: "Multi-column links with social icons",
  },
  {
    label: "Minimal Bar",
    value: "minimal-bar",
    description: "Single row: logo, links, social",
  },
  {
    label: "Centered",
    value: "centered",
    description: "Stacked center-aligned footer",
  },
  {
    label: "None",
    value: "none",
    description: "No footer",
  },
];

export const navOptions: SectionVariantOption<NavStyle>[] = [
  {
    label: "None",
    value: "none",
    description: "No navigation bar",
  },
  {
    label: "Static",
    value: "static",
    description: "Fixed bar at page top",
  },
  {
    label: "Floating",
    value: "floating",
    description: "Sticky glassmorphism bar",
  },
  {
    label: "Reveal",
    value: "reveal",
    description: "Slides in after scrolling past hero",
  },
];

export const navLayoutOptions: SectionVariantOption<NavLayout>[] = [
  { label: "Standard",    value: "standard",    description: "Logo left, links, CTA right" },
  { label: "Logo Center", value: "logo-center", description: "Links left, logo centered, CTA right" },
  { label: "Centered",    value: "centered",    description: "Logo, links, and CTA all centered" },
  { label: "Minimal",     value: "minimal",     description: "Logo and CTA only, no links" },
];

export const aboutOptions: SectionVariantOption<AboutLayout>[] = [
  {
    label: "Split",
    value: "split",
    description: "Two-column: text and details",
  },
  {
    label: "Full Width",
    value: "full-width",
    description: "Centered single column",
  },
  {
    label: "None",
    value: "none",
    description: "Hide about section",
  },
];

export const tagOptions: SectionVariantOption<TagStyle>[] = [
  {
    label: "Pill",
    value: "pill",
    description: "Rounded capsule tags",
  },
  {
    label: "Square",
    value: "square",
    description: "Slightly rounded rectangle tags",
  },
  {
    label: "Outline",
    value: "outline",
    description: "Border-only transparent tags",
  },
];

export interface VibeDefinition {
  label: string;
  value: Vibe;
  description: string;
  defaults: {
    density: Density;
    borderShape: BorderShape;
    dividerStyle: DividerStyle;
    animationStyle: AnimationStyle;
    imageTreatment: ImageTreatment;
    surfaceTexture: SurfaceTexture;
    headingTextTransform: HeadingTextTransform;
    headingLetterSpacing: HeadingLetterSpacing;
    headingFontWeight: HeadingFontWeight;
    tagStyle: TagStyle;
    ctaStyle: CtaStyle;
  };
}

export const vibeOptions: VibeDefinition[] = [
  {
    label: "Raw",
    value: "raw",
    description: "Underground grit. Maximum contrast, zero softness.",
    defaults: {
      density: "compact",
      borderShape: "sharp",
      dividerStyle: "solid",
      animationStyle: "none",
      imageTreatment: "bw",
      surfaceTexture: "concrete",
      headingTextTransform: "uppercase",
      headingLetterSpacing: "tight",
      headingFontWeight: "black",
      tagStyle: "square",
      ctaStyle: "outline",
    },
  },
  {
    label: "Ghost",
    value: "ghost",
    description: "Barely-there elegance. Light, airy, gallery-clean.",
    defaults: {
      density: "luxe",
      borderShape: "editorial",
      dividerStyle: "gradient",
      animationStyle: "fade-up",
      imageTreatment: "desat",
      surfaceTexture: "film-grain",
      headingTextTransform: "mixed",
      headingLetterSpacing: "wide",
      headingFontWeight: "light",
      tagStyle: "outline",
      ctaStyle: "outline",
    },
  },
  {
    label: "Americana",
    value: "americana",
    description: "Bold nostalgia. Traditional flash sheet energy.",
    defaults: {
      density: "balanced",
      borderShape: "editorial",
      dividerStyle: "ornament",
      animationStyle: "slide",
      imageTreatment: "film",
      surfaceTexture: "parchment",
      headingTextTransform: "uppercase",
      headingLetterSpacing: "normal",
      headingFontWeight: "black",
      tagStyle: "pill",
      ctaStyle: "filled",
    },
  },
  {
    label: "Noir",
    value: "noir",
    description: "Moody atmosphere. Vignette and grain, no decoration.",
    defaults: {
      density: "balanced",
      borderShape: "sharp",
      dividerStyle: "none",
      animationStyle: "scale",
      imageTreatment: "vignette",
      surfaceTexture: "film-grain",
      headingTextTransform: "uppercase",
      headingLetterSpacing: "tight",
      headingFontWeight: "bold",
      tagStyle: "outline",
      ctaStyle: "pill",
    },
  },
  {
    label: "Void",
    value: "void",
    description: "Clinical whitespace. The work speaks, nothing else does.",
    defaults: {
      density: "luxe",
      borderShape: "rounded",
      dividerStyle: "none",
      animationStyle: "fade-up",
      imageTreatment: "none",
      surfaceTexture: "none",
      headingTextTransform: "title",
      headingLetterSpacing: "wide",
      headingFontWeight: "light",
      tagStyle: "outline",
      ctaStyle: "outline",
    },
  },
  {
    label: "Sacred",
    value: "sacred",
    description: "Warm richness. Duotone and leather, editorial depth.",
    defaults: {
      density: "balanced",
      borderShape: "rounded",
      dividerStyle: "dotted",
      animationStyle: "fade-up",
      imageTreatment: "duotone",
      surfaceTexture: "leather",
      headingTextTransform: "mixed",
      headingLetterSpacing: "normal",
      headingFontWeight: "bold",
      tagStyle: "pill",
      ctaStyle: "filled",
    },
  },
];

export const densityOptions: SectionVariantOption<Density>[] = [
  { label: "Compact", value: "compact", description: "Tight spacing, dense layout" },
  { label: "Balanced", value: "balanced", description: "Comfortable default spacing" },
  { label: "Luxe", value: "luxe", description: "Generous whitespace throughout" },
];

export const borderShapeOptions: SectionVariantOption<BorderShape>[] = [
  { label: "Sharp", value: "sharp", description: "No border radius, hard edges" },
  { label: "Rounded", value: "rounded", description: "Soft rounded corners" },
  { label: "Editorial", value: "editorial", description: "Subtle rounding, magazine feel" },
];

export const dividerStyleOptions: SectionVariantOption<DividerStyle>[] = [
  { label: "None", value: "none", description: "No section dividers" },
  { label: "Solid", value: "solid", description: "Clean single-line dividers" },
  { label: "Gradient", value: "gradient", description: "Fading accent-colored dividers" },
  { label: "Dotted", value: "dotted", description: "Dotted line separators" },
  { label: "Ornament", value: "ornament", description: "Decorative flourish dividers" },
];

export const animationStyleOptions: SectionVariantOption<AnimationStyle>[] = [
  { label: "None", value: "none", description: "No scroll animations" },
  { label: "Fade Up", value: "fade-up", description: "Elements fade in from below" },
  { label: "Scale", value: "scale", description: "Elements scale up on enter" },
  { label: "Slide", value: "slide", description: "Elements slide in from the side" },
];

export const surfaceTextureOptions: SectionVariantOption<SurfaceTexture>[] = [
  { label: "None", value: "none", description: "Clean flat surfaces" },
  { label: "Film Grain", value: "film-grain", description: "Subtle analog film noise" },
  { label: "Parchment", value: "parchment", description: "Warm paper-like texture" },
  { label: "Concrete", value: "concrete", description: "Industrial rough surface" },
  { label: "Leather", value: "leather", description: "Rich textured material" },
  { label: "Geometric", value: "geometric", description: "Repeating geometric pattern" },
];

export const imageTreatmentOptions: SectionVariantOption<ImageTreatment>[] = [
  { label: "Raw", value: "none", description: "No filter applied" },
  { label: "B&W", value: "bw", description: "High-contrast black and white" },
  { label: "Duotone", value: "duotone", description: "Two-tone color overlay" },
  { label: "Film", value: "film", description: "Warm analog film look" },
  { label: "Desaturated", value: "desat", description: "Muted color palette" },
  { label: "Vignette", value: "vignette", description: "Darkened edges, focused center" },
];

export const logoPlacementOptions: SectionVariantOption<LogoPlacement>[] = [
  { label: "Nav", value: "nav", description: "Logo in the navigation bar" },
  { label: "Hero", value: "hero", description: "Logo in the hero section" },
  { label: "Watermark", value: "watermark", description: "Subtle watermark on gallery images" },
];

export const gradientDirectionOptions: SectionVariantOption<GradientDirection>[] = [
  { label: "Diagonal", value: "diagonal", description: "Corner-to-corner gradient" },
  { label: "Horizontal", value: "horizontal", description: "Left-to-right gradient" },
  { label: "Radial", value: "radial", description: "Center-outward gradient" },
  { label: "None", value: "none", description: "Flat solid color" },
];

export const glowIntensityOptions: SectionVariantOption<GlowIntensity>[] = [
  { label: "None", value: "none", description: "No glow effect" },
  { label: "Subtle", value: "subtle", description: "Faint ambient glow" },
  { label: "Medium", value: "medium", description: "Visible soft glow" },
  { label: "Intense", value: "intense", description: "Strong dramatic glow" },
];

export const headingLetterSpacingOptions: SectionVariantOption<HeadingLetterSpacing>[] = [
  { label: "Tight", value: "tight", description: "Condensed letter spacing" },
  { label: "Normal", value: "normal", description: "Default letter spacing" },
  { label: "Wide", value: "wide", description: "Expanded letter spacing" },
];

export const headingTextTransformOptions: SectionVariantOption<HeadingTextTransform>[] = [
  { label: "Uppercase", value: "uppercase", description: "All caps headings" },
  { label: "Mixed", value: "mixed", description: "No text transformation" },
  { label: "Title Case", value: "title", description: "Capitalize first letters" },
];

export const headingFontWeightOptions: SectionVariantOption<HeadingFontWeight>[] = [
  { label: "Light", value: "light", description: "Thin, delicate weight" },
  { label: "Regular", value: "regular", description: "Standard weight" },
  { label: "Bold", value: "bold", description: "Strong, prominent weight" },
  { label: "Black", value: "black", description: "Maximum heaviness" },
];
