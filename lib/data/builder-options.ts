import type {
  SectionVariantOption,
  HeroLayout,
  GalleryLayout,
  DetailsLayout,
  CtaLayout,
  FooterLayout,
  TagStyle,
  NavStyle,
  AboutLayout,
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
