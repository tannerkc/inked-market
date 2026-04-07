"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Button, StatusDot } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { Logo } from "@/components/ui/logo";
import { SectionLabel } from "@/components/ui/section-label";
import { Divider } from "@/components/ui/divider";
import { IconBox } from "@/components/ui/icon-box";
import { NavPill } from "@/components/ui/nav-pill";
import { FeatureCard } from "@/components/ui/feature-card";
import { PricingTierCard } from "@/components/pricing/pricing-tier-card";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  permanentMarker,
  bebasNeue,
  pirataOne,
  limelight,
  rye,
  unifrakturCook,
} from "@/lib/fonts";

/* ─── New UI Primitives ────────────────────────────────────── */
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ProfileCard } from "@/components/ui/profile-card";

/* ─── Signup ───────────────────────────────────────────────── */
import { ProgressBar, TypeCard, AuthForm, StylePicker, IgImportCard, PhotoUploadGrid, BillingToggle, SignupTierCard } from "@/components/signup";
import { artistTiers } from "@/lib/data/signup-tiers";
import { tattooStyleOptions } from "@/lib/data/signup-styles";

/* ─── Pricing (extended) ───────────────────────────────────── */
import { PricingToggle } from "@/components/pricing/pricing-toggle";
import { PricingCta } from "@/components/pricing/pricing-cta";
import { SearchBoostCallout } from "@/components/pricing/search-boost-callout";

/* ─── Content ──────────────────────────────────────────────── */
import { PageHero } from "@/components/content/page-hero";
import { ContentCard } from "@/components/content/content-card";
import { ContentSection } from "@/components/content/content-section";
import { ContentSidebar } from "@/components/content/content-sidebar";
/* BackToTop and ReadingProgress are scroll-dependent fixed-position components — described in text only */

/* ─── Help ─────────────────────────────────────────────────── */
import { HelpSearch } from "@/components/help/help-search";
import { AudiencePills } from "@/components/help/audience-pills";
import { HelpCategoryCard } from "@/components/help/help-category-card";
import { FaqAccordion } from "@/components/help/faq-accordion";
import { ContactBanner } from "@/components/help/contact-banner";
import { PopularArticles } from "@/components/help/popular-articles";

/* ─── Legal ────────────────────────────────────────────────── */
import { LegalHero } from "@/components/legal/legal-hero";
import { LegalDocCard } from "@/components/legal/legal-doc-card";
import { LegalSection } from "@/components/legal/legal-section";
import { LegalSidebar } from "@/components/legal/legal-sidebar";

/* ─── Detail ───────────────────────────────────────────────── */
/* DetailHero requires coverImage + children composition — demonstrated via its sub-components below */
import { BioQuote } from "@/components/detail";
import { SplitName } from "@/components/detail";
import { IssueLabel } from "@/components/detail";
import { MetaRow, MetaItem, MetaHighlight } from "@/components/detail";
import { ReviewPanel } from "@/components/detail";
import { SocialLinks } from "@/components/detail";
import { VerifiedBadge } from "@/components/detail";
import { WidgetPanel, WidgetLabel, WidgetHeading } from "@/components/detail";
import { FooterCta } from "@/components/detail";

/* ─── Search & Discover ────────────────────────────────────── */
import { DiscoverSearch } from "@/components/discover/search-bar";
import { FilterPills } from "@/components/discover/filter-pills";
import { SearchResultCard } from "@/components/search/search-result-card";
import { FilterBar } from "@/components/search/filter-bar";
/* FilterChips is rendered automatically inside FilterBar — no separate demo needed */
import { SearchTabs } from "@/components/search/search-tabs";
import { SortSelect } from "@/components/search/sort-select";

/* ─── Artists ──────────────────────────────────────────────── */
import { PortfolioGallery } from "@/components/artists";

/* ─── Dashboard ───────────────────────────────────────────── */
import {
  OnboardingBanner,
  DashboardSection,
  StatCard,
  EmptyState,
  ProfileHeader,
  TimeSlotBlock,
  AffiliationRow,
} from "@/components/dashboard";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { type TimeSlot } from "@/lib/types";

/* ─── Lineup ──────────────────────────────────────────────── */
import {
  LineupTabs,
  CoverStory,
  NewsCard,
  BlastCard,
  PickRow,
  IssueCard,
} from "@/components/lineup";
import type { LineupTabValue } from "@/components/lineup";
import { lineupIssues, getAllSpotlights } from "@/lib/data/lineup";

/* ─── Deprecated ───────────────────────────────────────────── */
import { ComingSoon } from "@/components/ui/coming-soon";

/* ─── Showcase helpers ──────────────────────────────────────── */

function ShowcaseSection({
  id,
  title,
  description,
  dark = false,
  children,
}: {
  id: string;
  title: string;
  description: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6">
        <h2
          className={`${bebasNeue.className} text-3xl tracking-wide ${dark ? "text-ink-cream" : "text-ink-black"}`}
        >
          {title}
        </h2>
        <p
          className={`font-mono text-[10px] tracking-[0.15em] uppercase mt-1 ${dark ? "text-ink-cream/30" : "text-ink-black/35"}`}
        >
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function ComponentRow({
  label,
  dark = false,
  children,
}: {
  label: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p
        className={`font-mono text-[9px] tracking-[0.2em] uppercase mb-3 ${dark ? "text-ink-cream/25" : "text-ink-black/25"}`}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* ─── Sample icon ───────────────────────────────────────────── */

function SampleIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

/* ─── Nav items for sidebar ─────────────────────────────────── */

const sections = [
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "textareas", label: "Textareas" },
  { id: "selects", label: "Selects" },
  { id: "typography", label: "Typography" },
  { id: "icons-dots", label: "Icons & Dots" },
  { id: "labels-dividers", label: "Labels & Dividers" },
  { id: "cards", label: "Cards" },
  { id: "pricing-cards", label: "Pricing Cards" },
  { id: "headers", label: "Headers & Primitives" },
  { id: "signup", label: "Signup" },
  { id: "pricing-full", label: "Pricing (Full)" },
  { id: "content", label: "Content" },
  { id: "help", label: "Help" },
  { id: "legal", label: "Legal" },
  { id: "detail", label: "Detail Pages" },
  { id: "search-discover", label: "Search & Discover" },
  { id: "artists", label: "Artists" },
  { id: "dashboard-interactions", label: "Dashboard Interactions" },
  { id: "layout", label: "Layout" },
  { id: "effects", label: "Effects" },
  { id: "deprecated", label: "The Graveyard" },
  { id: "nav", label: "Navigation" },
  { id: "tokens", label: "Design Tokens" },
];

/* ─── Page ──────────────────────────────────────────────────── */

export default function ComponentLibraryPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [inputValue, setInputValue] = useState("");

  /* Signup section state */
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Fine Line", "Minimalist"]);
  const [isAnnualSignup, setIsAnnualSignup] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Free");

  /* Pricing section state */
  const [pricingAudience, setPricingAudience] = useState<"artists" | "studios">("artists");
  const [isPricingAnnual, setIsPricingAnnual] = useState(false);

  /* Discover section state */
  const [activeFilter, setActiveFilter] = useState("All");

  /* Dashboard interactions section state */
  const [toggleSmChecked, setToggleSmChecked] = useState(false);
  const [toggleMdChecked, setToggleMdChecked] = useState(true);
  const [mondayEnabled, setMondayEnabled] = useState(true);
  const [mondaySlots, setMondaySlots] = useState<TimeSlot[]>([
    { start: "10:00 AM", end: "6:00 PM" },
  ]);
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-black">
      <FilmGrainOverlay className="opacity-[0.03] fixed" />

      {/* ── HERO ── */}
      <header className="relative pt-28 pb-16 px-6 md:px-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-red)_8%,transparent),transparent_60%)]" />

        <div className="relative z-10">
          <p
            className={`${permanentMarker.className} text-xs text-ink-red tracking-[0.25em] uppercase -rotate-2 inline-block mb-2`}
          >
            Employees Only
          </p>
          <h1
            className={`${bebasNeue.className} text-6xl sm:text-7xl lg:text-8xl text-ink-cream tracking-wider`}
          >
            THE BACK ROOM
          </h1>
          <div className="flex items-center gap-3 justify-center mt-3">
            <div className="w-14 h-px bg-ink-cream/10" />
            <span className="font-mono text-[10px] text-ink-cream/25 tracking-[0.18em] uppercase">
              where the tools live
            </span>
            <div className="w-14 h-px bg-ink-cream/10" />
          </div>
          <p className="text-sm text-ink-cream/30 mt-4 max-w-lg mx-auto leading-relaxed">
            You found it. This is the workshop &mdash; every component, token,
            and pattern that powers Inked Market, pinned to the wall like flash
            sheets. Poke around. Try things. Nothing here bites.
          </p>

          {/* Warning badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-cream/[0.06] bg-ink-cream/[0.03]">
            <StatusDot className="w-1.5 h-1.5" />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
              Dev Build Only &mdash; Not for customers
            </span>
          </div>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div className="flex max-w-7xl mx-auto px-6 md:px-12 gap-12 pb-24">
        {/* Sidebar nav */}
        <nav className="hidden lg:block w-48 shrink-0 sticky top-24 self-start">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/20 mb-4">
            Components
          </p>
          <div className="flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink-cream/30 hover:text-ink-cream/60 transition-colors py-1.5"
              >
                {s.label}
              </a>
            ))}
          </div>

          <Divider variant="dark" className="my-6" />
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/15">
            {sections.length} component groups
          </p>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/15 mt-1">
            60+ primitives
          </p>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-20">
          {/* ═══════════════════════════════════════════════ */}
          {/* BUTTONS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="buttons"
            title="Buttons"
            description="The ink variants &mdash; pills, dots, arrows, and all"
            dark
          >
            <ComponentRow label="Ink Variants" dark>
              <Button variant="ink" size="md" statusDot>
                Primary
              </Button>
              <Button variant="ink-outline" size="md">
                Outline
              </Button>
              <Button variant="ink-ghost" size="md">
                Ghost
              </Button>
              <Button variant="ink-red" size="md" statusDot="bg-white shadow-none">
                Red CTA
              </Button>
              <Button variant="ink-light-outline" size="md">
                Light Outline
              </Button>
            </ComponentRow>

            <ComponentRow label="Sizes" dark>
              <Button variant="ink" size="sm" statusDot>
                Small
              </Button>
              <Button variant="ink" size="md" statusDot>
                Medium
              </Button>
              <Button variant="ink" size="lg" statusDot>
                Large
              </Button>
            </ComponentRow>

            <ComponentRow label="With Icons" dark>
              <Button variant="ink" size="md" statusDot>
                Status Dot
              </Button>
              <Button variant="ink-outline" size="md" rightIcon="arrow-right">
                Arrow Right
              </Button>
              <Button variant="ink-outline" size="md" rightIcon="arrow-down">
                Arrow Down
              </Button>
              <Button
                variant="ink-outline"
                size="md"
                leftIcon={<SampleIcon />}
              >
                Custom Icon
              </Button>
            </ComponentRow>

            <ComponentRow label="As Link" dark>
              <Button as={Link} href="#" variant="ink" size="md" statusDot>
                Link Button
              </Button>
              <Button
                as={Link}
                href="#"
                variant="ink-outline"
                size="md"
                rightIcon="arrow-right"
              >
                Link with Arrow
              </Button>
            </ComponentRow>

            <ComponentRow label="Custom StatusDot Colors" dark>
              <Button
                variant="ink-red"
                size="md"
                statusDot="bg-white shadow-none"
              >
                White Dot
              </Button>
              <Button
                variant="ink-red"
                size="md"
                statusDot="bg-ink-cream shadow-ink-cream-glow"
              >
                Cream Glow
              </Button>
              <Button
                variant="ink-outline"
                size="md"
                statusDot="bg-ink-red shadow-ink-red-glow"
              >
                Red Glow
              </Button>
            </ComponentRow>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* INPUTS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="inputs"
            title="Inputs"
            description="Floating label inputs &mdash; light and dark"
            dark
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <Input
                label="Email"
                type="email"
                placeholder="artist@studio.com"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Studio Name"
                type="text"
                placeholder="Iron & Ink Collective"
                variant="dark"
              />
              <Input
                label="City"
                type="text"
                placeholder="Portland"
                variant="dark"
              />
            </div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-cream/20 mt-4">
              Top row: light variant &middot; Bottom row: dark variant
            </p>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* TEXTAREAS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="textareas"
            title="Textareas"
            description="Multi-line input fields &mdash; light and dark"
            dark
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <Textarea
                label="Message"
                placeholder="Tell us more…"
                rows={4}
              />
              <Textarea
                label="Bio"
                placeholder="A few words about your style…"
                rows={4}
                variant="dark"
              />
            </div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-cream/20 mt-4">
              Left: light variant &middot; Right: dark variant
            </p>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* SELECTS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="selects"
            title="Selects"
            description="Dropdown selects with custom chevron &mdash; light and dark"
            dark
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <Select
                label="Topic"
                placeholder="Select a topic…"
                options={[
                  { value: "account", label: "Account Issue" },
                  { value: "booking", label: "Booking Problem" },
                  { value: "bug", label: "Report a Bug" },
                ]}
                defaultValue=""
              />
              <Select
                label="Style"
                placeholder="Choose a style…"
                options={[
                  { value: "traditional", label: "Traditional" },
                  { value: "realism", label: "Realism" },
                  { value: "blackwork", label: "Blackwork" },
                ]}
                variant="dark"
                defaultValue=""
              />
            </div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-cream/20 mt-4">
              Left: light variant &middot; Right: dark variant
            </p>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* TYPOGRAPHY */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="typography"
            title="Typography"
            description="The fonts that give this place its voice"
            dark
          >
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-2">
                  Display Fonts
                </p>
                <div className="space-y-3">
                  <p className={`${pirataOne.className} text-4xl text-ink-cream/60`}>
                    Pirata One &mdash; Discover Your Next
                  </p>
                  <p className={`${limelight.className} text-4xl text-ink-cream/60`}>
                    Limelight &mdash; Browse Portfolios
                  </p>
                  <p className={`${rye.className} text-4xl text-ink-cream/60`}>
                    Rye &mdash; Book Your Artist
                  </p>
                  <p
                    className={`${unifrakturCook.className} text-4xl text-ink-cream`}
                  >
                    UnifrakturCook &mdash; Tattoo Scene
                  </p>
                  <p className={`${permanentMarker.className} text-4xl text-ink-red`}>
                    Permanent Marker &mdash; Artist
                  </p>
                  <p className={`${bebasNeue.className} text-4xl text-ink-cream tracking-wider`}>
                    BEBAS NEUE &mdash; HEADLINES AND SECTIONS
                  </p>
                </div>
              </div>

              <Divider variant="dark" />

              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-2">
                  Functional Typography
                </p>
                <div className="space-y-2">
                  <p className="font-mono text-xs tracking-[0.15em] uppercase text-ink-cream/50">
                    Monospace Uppercase &mdash; Buttons, labels, metadata
                  </p>
                  <p className="text-base text-ink-cream/50">
                    System Sans &mdash; Body text, descriptions, readable content
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-cream/30">
                    Tracked Mono &mdash; Section labels, tiny metadata
                  </p>
                </div>
              </div>

              <Divider variant="dark" />

              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-2">
                  Mixed-Font Headline (Hero Pattern)
                </p>
                <h2 className="text-4xl text-ink-cream leading-tight">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className={`${pirataOne.className} text-ink-cream/40`}>
                      Discover
                    </span>
                    <span className={`${limelight.className} text-ink-cream/40`}>
                      Your
                    </span>
                    <span className={`${rye.className} text-ink-cream/40`}>
                      Next
                    </span>
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className={unifrakturCook.className}>Tattoo</span>
                    <span className={`${permanentMarker.className} text-ink-red`}>
                      Artist
                    </span>
                  </span>
                </h2>
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* ICONS & DOTS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="icons-dots"
            title="Icons & Dots"
            description="IconBox colors, sizes, and the almighty StatusDot"
            dark
          >
            <ComponentRow label="IconBox Colors" dark>
              <IconBox color="red">
                <SampleIcon />
              </IconBox>
              <IconBox color="rust">
                <SampleIcon />
              </IconBox>
              <IconBox color="sage">
                <SampleIcon />
              </IconBox>
            </ComponentRow>

            <ComponentRow label="IconBox Sizes" dark>
              <IconBox color="red" size="sm">
                <SampleIcon />
              </IconBox>
              <IconBox color="red" size="md">
                <SampleIcon />
              </IconBox>
              <IconBox color="red" size="lg">
                <SampleIcon />
              </IconBox>
            </ComponentRow>

            <ComponentRow label="StatusDot Variants" dark>
              <div className="flex items-center gap-2">
                <StatusDot />
                <span className="font-mono text-[9px] text-ink-cream/30 tracking-wide uppercase">Default Red</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot className="bg-ink-cream shadow-ink-cream-glow" />
                <span className="font-mono text-[9px] text-ink-cream/30 tracking-wide uppercase">Cream Glow</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot className="bg-white shadow-none" />
                <span className="font-mono text-[9px] text-ink-cream/30 tracking-wide uppercase">White (no glow)</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot className="w-1.5 h-1.5" />
                <span className="font-mono text-[9px] text-ink-cream/30 tracking-wide uppercase">Small (badge)</span>
              </div>
            </ComponentRow>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* LABELS & DIVIDERS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="labels-dividers"
            title="Labels & Dividers"
            description="Section labels and visual separators"
            dark
          >
            <div className="space-y-6 max-w-lg">
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                  SectionLabel Variants
                </p>
                <div className="space-y-4">
                  <SectionLabel label="Dark (default)" variant="dark" />
                  <SectionLabel label="Light" variant="light" />
                  <div className="bg-gradient-to-r from-ink-parchment-light to-ink-cream rounded-lg p-4">
                    <SectionLabel label="Parchment" variant="parchment" />
                  </div>
                  <SectionLabel label="Dark Muted" variant="dark-muted" />
                  <SectionLabel label="Stretched" variant="dark" stretch />
                </div>
              </div>

              <Divider variant="dark" />

              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                  Divider Variants
                </p>
                <div className="space-y-4">
                  <div>
                    <Divider variant="dark" />
                    <p className="font-mono text-[9px] text-ink-cream/20 mt-1">Dark</p>
                  </div>
                  <div className="bg-ink-cream rounded-lg p-4">
                    <Divider variant="light" />
                    <p className="font-mono text-[9px] text-ink-black/30 mt-1">Light</p>
                  </div>
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* CARDS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="cards"
            title="Cards"
            description="Feature cards with icons, accents, and tags"
            dark
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <FeatureCard
                title="With Tags"
                description="Feature card with accent color and tag pills."
                icon={<SampleIcon />}
                accentColor="red"
                tags={["fine-line", "blackwork", "realism"]}
              />
              <FeatureCard
                title="Rust Accent"
                description="Different accent color changes the IconBox and overall feel."
                icon={<SampleIcon />}
                accentColor="rust"
              />
              <FeatureCard
                title="Sage Accent"
                description="The earthy green variant for trust and verification signals."
                icon={<SampleIcon />}
                accentColor="sage"
              />
              <FeatureCard
                title="No Tags"
                description="Clean card without tag pills. Just icon, title, and description."
                icon={<SampleIcon />}
                accentColor="red"
              />
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* PRICING CARDS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="pricing-cards"
            title="Pricing Cards"
            description="Tier cards with price, features, and CTA — dark and light variants"
            dark
          >
            <ComponentRow label="Dark — Standard vs Recommended" dark>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                <PricingTierCard
                  name="Basic"
                  price={19.85}
                  description="A professional profile page for your studio."
                  features={[
                    { text: "Profile-style listing", included: true },
                    { text: "Discover presence", included: true },
                    { text: "Custom web page", included: false },
                  ]}
                  variant="dark"
                />
                <PricingTierCard
                  name="Pro"
                  price={59.85}
                  annualPrice={47.85}
                  description="A customizable template website for your brand."
                  features={[
                    { text: "Profile-style listing", included: true },
                    { text: "Custom web page", included: true },
                    { text: "Customize colors & fonts", included: true },
                  ]}
                  recommended
                  variant="dark"
                />
              </div>
            </ComponentRow>
            <ComponentRow label="Light variant" dark>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                <div className="rounded-2xl bg-ink-cream p-4">
                  <PricingTierCard
                    name="Free"
                    price={0}
                    description="Manage your profile on your studio's page."
                    features={[
                      { text: "Profile management", included: true },
                      { text: "Public listing", included: false },
                    ]}
                    ctaLabel="Get Started Free"
                    variant="light"
                  />
                </div>
                <div className="rounded-2xl bg-ink-cream p-4">
                  <PricingTierCard
                    name="Pro"
                    price={14.85}
                    annualPrice={11.85}
                    isAnnual
                    description="Go independent with your own listing."
                    features={[
                      { text: "Profile management", included: true },
                      { text: "Public listing", included: true },
                    ]}
                    recommended
                    variant="light"
                  />
                </div>
              </div>
            </ComponentRow>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* HEADERS & PRIMITIVES */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="headers"
            title="Headers & Primitives"
            description="Eyebrow, Headline, Subtitle, PageHeader, Card, and ProfileCard"
            dark
          >
            <ComponentRow label="Eyebrow &mdash; Marker Variant" dark>
              <Eyebrow text="Featured" color="red" />
              <Eyebrow text="New Arrival" color="rust" />
              <Eyebrow text="Verified" color="sage" />
            </ComponentRow>

            <ComponentRow label="Eyebrow &mdash; Badge Variant" dark>
              <div className="bg-ink-cream rounded-xl p-4">
                <Eyebrow text="Now Open" variant="badge" />
              </div>
            </ComponentRow>

            <ComponentRow label="Headline &mdash; Mixed Variant" dark>
              <div className="bg-ink-cream rounded-xl p-6">
                <Headline
                  variant="mixed"
                  size="md"
                  words={[
                    { text: "Join", font: "pirata", color: "text-ink-black/40" },
                    { text: "The", font: "limelight", color: "text-ink-black/40" },
                    { text: "Scene", font: "marker", color: "text-ink-red" },
                  ]}
                />
              </div>
            </ComponentRow>

            <ComponentRow label="Headline &mdash; Solid Variant" dark>
              <div className="bg-ink-cream rounded-xl p-6">
                <Headline variant="solid" text="HELP CENTER" size="md" />
              </div>
            </ComponentRow>

            <ComponentRow label="Headline Sizes" dark>
              <div className="bg-ink-cream rounded-xl p-6 space-y-4 w-full">
                <Headline variant="solid" text="SMALL" size="sm" />
                <Headline variant="solid" text="MEDIUM" size="md" />
                <Headline variant="solid" text="LARGE" size="lg" />
              </div>
            </ComponentRow>

            <ComponentRow label="Subtitle &mdash; Plain" dark>
              <div className="bg-ink-cream rounded-xl p-6">
                <Subtitle text="Your next tattoo artist is a search away." />
              </div>
            </ComponentRow>

            <ComponentRow label="Subtitle &mdash; Divider (light & dark)" dark>
              <div className="bg-ink-cream rounded-xl p-6 flex-1">
                <Subtitle text="where the ink meets the road" variant="divider" colorClass="light" />
              </div>
              <div className="bg-ink-black border border-ink-cream/10 rounded-xl p-6 flex-1">
                <Subtitle text="where the ink meets the road" variant="divider" colorClass="dark" />
              </div>
            </ComponentRow>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PageHeader &mdash; Composed
              </p>
              <div className="bg-ink-cream rounded-xl p-8">
                <PageHeader
                  eyebrow={{ text: "Employees Only", color: "red" }}
                  headline={{
                    variant: "mixed",
                    size: "md",
                    words: [
                      { text: "Discover", font: "pirata", color: "text-ink-black/40" },
                      { text: "Your", font: "limelight", color: "text-ink-black/40" },
                      { text: "Artist", font: "marker", color: "text-ink-red" },
                    ],
                  }}
                  subtitle={{ text: "browse portfolios and book", variant: "divider", colorClass: "light" }}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                Card (base)
              </p>
              <div className="max-w-sm">
                <Card>
                  <CardHeader>
                    <CardTitle>Iron & Ink Collective</CardTitle>
                    <CardDescription>A premier tattoo studio in downtown Portland.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Specializing in blackwork, fine-line, and neo-traditional styles.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ink" size="sm" statusDot>Visit Studio</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ProfileCard
              </p>
              <div className="max-w-xs">
                <ProfileCard
                  id="sarah-chen"
                  type="artist"
                  name="Sarah Chen"
                  image="/tattoos/rose-illustration-4-svgrepo-com.svg"
                  location="Los Angeles, CA"
                  rating={4.9}
                  reviewCount={156}
                  specialties={["Fine Line", "Minimalist", "Floral"]}
                  verified
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* SIGNUP */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="signup"
            title="Signup Components"
            description="Progress bars, type cards, style pickers, and tier selection"
            dark
          >
            <ComponentRow label="ProgressBar" dark>
              <div className="bg-ink-cream rounded-xl p-4 w-full max-w-md space-y-3">
                <ProgressBar currentStep={1} totalSteps={3} />
                <ProgressBar currentStep={2} totalSteps={4} />
                <ProgressBar currentStep={4} totalSteps={4} />
              </div>
            </ComponentRow>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                TypeCard
              </p>
              <div className="bg-ink-cream rounded-xl p-4 max-w-md">
                <TypeCard
                  href="#"
                  icon={
                    <svg className="w-6 h-6 text-ink-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  }
                  iconColor="sage"
                  title="I'm an Artist"
                  description="Build your portfolio and get discovered."
                  features={["Portfolio", "Bookings", "Reviews"]}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                StylePicker
              </p>
              <div className="bg-ink-cream rounded-xl p-4 max-w-lg">
                <StylePicker
                  options={tattooStyleOptions.slice(0, 8)}
                  selected={selectedStyles}
                  onChange={setSelectedStyles}
                  accentColor="red"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                IgImportCard
              </p>
              <div className="max-w-xs">
                <IgImportCard onConnect={() => {}} onSkip={() => {}} />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PhotoUploadGrid
              </p>
              <div className="bg-ink-cream rounded-xl p-4 max-w-xs">
                <PhotoUploadGrid slots={3} />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                BillingToggle
              </p>
              <div className="bg-ink-cream rounded-xl p-4 max-w-sm">
                <BillingToggle isAnnual={isAnnualSignup} onChange={setIsAnnualSignup} />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SignupTierCard (Free &amp; Pro)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                {artistTiers.map((tier) => (
                  <SignupTierCard
                    key={tier.name}
                    name={tier.name}
                    price={tier.price}
                    annualPrice={tier.annualPrice}
                    isAnnual={isAnnualSignup}
                    description={tier.description}
                    features={tier.features}
                    selected={selectedTier === tier.name}
                    onSelect={() => setSelectedTier(tier.name)}
                    badge={tier.badge}
                    badgeColor={tier.badgeColor}
                    freeBadge={tier.freeBadge}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                AuthForm
              </p>
              <div className="bg-ink-cream rounded-xl p-6 max-w-sm">
                <AuthForm
                  nameField={{ label: "Studio Name", placeholder: "Iron & Ink" }}
                  ctaLabel="Create Account"
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* PRICING (FULL) */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="pricing-full"
            title="Pricing (Full)"
            description="Toggle, search boost callout, and CTA banner"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PricingToggle
              </p>
              <PricingToggle
                audience={pricingAudience}
                onAudienceChange={setPricingAudience}
                isAnnual={isPricingAnnual}
                onBillingChange={setIsPricingAnnual}
                variant="dark"
              />
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SearchBoostCallout (dark)
              </p>
              <SearchBoostCallout variant="dark" />
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PricingCta (dark, artists)
              </p>
              <PricingCta variant="dark" audience="artists" />
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* CONTENT */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="content"
            title="Content Components"
            description="Page heroes, content cards, sections, sidebars, and reading helpers"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PageHero
              </p>
              <div className="rounded-2xl overflow-hidden border border-ink-cream/[0.06]">
                <PageHero
                  headline="SAMPLE PAGE"
                  subtitle="demo &middot; preview &middot; showcase"
                  eyebrow="Testing"
                  accentColor="rust"
                  variant="dark"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ContentCard
              </p>
              <div className="max-w-sm">
                <ContentCard
                  title="Getting Started"
                  subtitle="Learn the basics of setting up your profile."
                  href="#"
                  icon={<SampleIcon />}
                  accentColor="rust"
                  metadata={[
                    { label: "Updated", value: "Mar 2026" },
                    { label: "v", value: "1.2" },
                  ]}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ContentSection
              </p>
              <div className="rounded-2xl border border-ink-cream/[0.06] p-6 max-w-lg">
                <ContentSection
                  id="demo-section"
                  number="01"
                  title="What We Collect"
                  accentColor="rust"
                  variant="dark"
                >
                  <p>We collect information you provide when creating an account, including your name, email, and portfolio images.</p>
                </ContentSection>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ContentSidebar (static preview)
              </p>
              <div className="rounded-2xl border border-ink-cream/[0.06] p-6 max-w-xs">
                <ContentSidebar
                  sections={[
                    { id: "s1", number: "01", title: "Introduction" },
                    { id: "s2", number: "02", title: "What We Collect" },
                    { id: "s3", number: "03", title: "How We Use It" },
                  ]}
                  accentColor="rust"
                  variant="dark"
                  hubHref="/legal"
                  hubLabel="Legal Hub"
                />
              </div>
            </div>

            <ComponentRow label="BackToTop &amp; ReadingProgress" dark>
              <div className="text-ink-cream/25 font-mono text-[10px] tracking-wide">
                BackToTop: fixed button, visible when scrolled &gt; 400px
              </div>
              <div className="text-ink-cream/25 font-mono text-[10px] tracking-wide">
                ReadingProgress: fixed bar at top, tracks scroll progress
              </div>
            </ComponentRow>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* HELP */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="help"
            title="Help Components"
            description="Search, audience pills, category cards, FAQ, and contact"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                HelpSearch
              </p>
              <Suspense fallback={null}>
                <HelpSearch variant="dark" />
              </Suspense>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                AudiencePills
              </p>
              <Suspense fallback={null}>
                <AudiencePills variant="dark" />
              </Suspense>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                HelpCategoryCard
              </p>
              <div className="max-w-sm">
                <HelpCategoryCard
                  category={{
                    slug: "getting-started",
                    title: "Getting Started",
                    description: "Learn the basics of setting up your Inked Market profile.",
                    icon: "rocket",
                    accentColor: "rust",
                    audiences: ["artist", "studio-owner"],
                    articleCount: 5,
                    formats: ["guide", "faq"],
                  }}
                  variant="dark"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                FaqAccordion
              </p>
              <div className="max-w-lg">
                <FaqAccordion
                  items={[
                    {
                      id: "demo-faq-1",
                      question: "How do I create a portfolio?",
                      answer: <p>Sign up, go to your dashboard, and click &ldquo;Add Photos&rdquo; to start building your portfolio. You can import directly from Instagram.</p>,
                      audiences: ["artist"],
                    },
                    {
                      id: "demo-faq-2",
                      question: "Can I list multiple studios?",
                      answer: <p>Yes! Artists can be affiliated with multiple studios. Guest spots and multi-location artists are fully supported.</p>,
                      audiences: ["artist", "studio-owner"],
                    },
                  ]}
                  variant="dark"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ContactBanner
              </p>
              <ContactBanner variant="dark" />
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PopularArticles (empty &mdash; renders nothing when no articles)
              </p>
              <PopularArticles articles={[]} variant="dark" />
              <p className="font-mono text-[9px] text-ink-cream/20 mt-1">
                Pass an empty array &mdash; component returns null gracefully
              </p>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* LEGAL */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="legal"
            title="Legal Components"
            description="Legal hero, doc cards, sections, and sidebar"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                LegalHero
              </p>
              <div className="rounded-2xl overflow-hidden border border-ink-cream/[0.06]">
                <LegalHero
                  headline="PRIVACY POLICY"
                  subtitle="your data &middot; your rights"
                  accentColor="sage"
                  effectiveDate="April 1, 2026"
                  version="1.0"
                  badge="Legal"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                LegalDocCard
              </p>
              <div className="max-w-sm">
                <LegalDocCard
                  title="Terms of Service"
                  subtitle="The rules of engagement for using Inked Market."
                  href="#"
                  icon={<SampleIcon />}
                  accentColor="rust"
                  lastUpdated="Mar 2026"
                  version="2.1"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                LegalSection
              </p>
              <div className="rounded-2xl border border-ink-cream/[0.06] p-6 max-w-lg">
                <LegalSection
                  id="demo-legal-section"
                  number="01"
                  title="Acceptance of Terms"
                  variant="dark"
                >
                  <p>By accessing or using Inked Market, you agree to be bound by these Terms. If you do not agree, you may not use the platform.</p>
                </LegalSection>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                LegalSidebar (static preview)
              </p>
              <div className="rounded-2xl border border-ink-cream/[0.06] p-6 max-w-xs">
                <LegalSidebar
                  sections={[
                    { id: "ls1", number: "01", title: "Acceptance" },
                    { id: "ls2", number: "02", title: "User Accounts" },
                    { id: "ls3", number: "03", title: "Content Policy" },
                  ]}
                  accentColor="rust"
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* DETAIL PAGES */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="detail"
            title="Detail Page Components"
            description="Hero, bio, split name, meta, reviews, social, badges, widgets, and CTA"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SplitName
              </p>
              <div className="bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6">
                <SplitName
                  name="Sarah Chen"
                  primaryFont={bebasNeue.className}
                  accentFont={permanentMarker.className}
                  splitAt="first"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                IssueLabel
              </p>
              <div className="bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6">
                <IssueLabel
                  issueNumber={42}
                  subtitle="Fine Line Specialist"
                  font={permanentMarker.className}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                VerifiedBadge
              </p>
              <div className="bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6">
                <VerifiedBadge label="Verified Artist" />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                BioQuote
              </p>
              <div className="bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6">
                <BioQuote bio="I specialize in fine-line botanical work inspired by vintage botanical illustrations. Every piece tells a story rooted in nature and personal meaning." />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                MetaRow with MetaItem and MetaHighlight
              </p>
              <div className="bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6">
                <MetaRow>
                  <MetaItem>Los Angeles, CA</MetaItem>
                  <MetaItem><MetaHighlight>4.9</MetaHighlight> (156 reviews)</MetaItem>
                  <MetaItem>Est. 2019</MetaItem>
                </MetaRow>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SocialLinks
              </p>
              <div className="bg-ink-black border border-ink-cream/[0.06] rounded-xl p-6">
                <SocialLinks
                  links={{
                    instagram: "https://instagram.com/sarahchen",
                    website: "https://sarahchen.art",
                  }}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                WidgetPanel + WidgetLabel + WidgetHeading
              </p>
              <div className="max-w-md">
                <WidgetPanel>
                  <WidgetLabel label="Schedule" variant="rust" />
                  <WidgetHeading headingFont={bebasNeue.className}>Book a Session</WidgetHeading>
                  <p className="text-xs text-ink-cream/35 relative z-10">Select a date and time to book your consultation.</p>
                </WidgetPanel>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ReviewPanel
              </p>
              <div className="max-w-lg">
                <ReviewPanel
                  rating={4.9}
                  headingFont={bebasNeue.className}
                  reviews={[
                    {
                      id: "r1",
                      authorId: "u1",
                      authorName: "Alex Rivera",
                      targetId: "sarah-chen",
                      targetType: "artist",
                      rating: 5,
                      title: "Amazing work",
                      content: "Sarah did an incredible job on my botanical sleeve. The detail is stunning and healed beautifully.",
                      verified: true,
                      createdAt: new Date("2025-12-15"),
                      updatedAt: new Date("2025-12-15"),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                FooterCta
              </p>
              <div className="rounded-2xl overflow-hidden border border-ink-cream/[0.06]">
                <FooterCta
                  heading="Ready to Get Inked?"
                  subtitle="Browse artists near you"
                  buttonLabel="Find Artists"
                  headingFont={bebasNeue.className}
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* SEARCH & DISCOVER */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="search-discover"
            title="Search & Discover"
            description="Search bars, filter pills, tabs, sort, and result cards"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                DiscoverSearch (dark)
              </p>
              <DiscoverSearch variant="dark" />
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                DiscoverSearch (light)
              </p>
              <div className="bg-ink-cream rounded-xl p-6">
                <DiscoverSearch variant="light" />
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                FilterPills
              </p>
              <FilterPills
                filters={["All", "Traditional", "Realism", "Fine Line", "Blackwork"]}
                activeFilter={activeFilter}
                variant="dark"
                onFilterChange={setActiveFilter}
              />
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SearchTabs
              </p>
              <Suspense fallback={null}>
                <SearchTabs variant="dark" />
              </Suspense>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SortSelect
              </p>
              <Suspense fallback={null}>
                <SortSelect variant="dark" />
              </Suspense>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                FilterBar (full)
              </p>
              <Suspense fallback={null}>
                <FilterBar variant="dark" />
              </Suspense>
            </div>

            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                SearchResultCard
              </p>
              <div className="max-w-xs">
                <SearchResultCard
                  type="artist"
                  id="sarah-chen"
                  name="Sarah Chen"
                  avatar="/tattoos/rose-illustration-4-svgrepo-com.svg"
                  images={["/tattoos/rose-illustration-4-svgrepo-com.svg"]}
                  location="Los Angeles, CA"
                  rating={4.9}
                  reviewCount={156}
                  specialties={["Fine Line", "Minimalist"]}
                  verified
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* ARTISTS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="artists"
            title="Artists"
            description="Portfolio gallery with filter tags"
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                PortfolioGallery
              </p>
              <div className="rounded-2xl overflow-hidden border border-ink-cream/[0.06] bg-ink-black p-4">
                <PortfolioGallery
                  specialties={["Fine Line", "Botanical"]}
                  images={[
                    { id: "p1", url: "/tattoos/rose-illustration-4-svgrepo-com.svg", title: "Rose Study", tags: ["Fine Line", "Botanical"], uploadedAt: new Date() },
                    { id: "p2", url: "/tattoos/rose-illustration-4-svgrepo-com.svg", title: "Fern Detail", tags: ["Botanical"], uploadedAt: new Date() },
                    { id: "p3", url: "/tattoos/rose-illustration-4-svgrepo-com.svg", title: "Wildflower", tags: ["Fine Line"], uploadedAt: new Date() },
                  ]}
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* LAYOUT */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="layout"
            title="Layout"
            description="BentoGrid, BentoItem, and the Logo"
            dark
          >
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                BentoGrid (3 cols) with spanning items
              </p>
              <BentoGrid cols={3}>
                <BentoItem colSpan={2}>
                  <div className="rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] p-6 h-full">
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
                      colSpan=2
                    </p>
                  </div>
                </BentoItem>
                <BentoItem rowSpan={2}>
                  <div className="rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] p-6 h-full">
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
                      rowSpan=2
                    </p>
                  </div>
                </BentoItem>
                <div className="rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] p-6">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
                    1x1
                  </p>
                </div>
                <div className="rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] p-6">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
                    1x1
                  </p>
                </div>
              </BentoGrid>
            </div>

            <div className="mt-10">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                Logo Variants
              </p>
              <div className="flex flex-wrap items-end gap-8">
                <div>
                  <Logo size="sm" variant="light" />
                  <p className="font-mono text-[9px] text-ink-cream/20 mt-2">sm / light</p>
                </div>
                <div>
                  <Logo size="md" variant="light" />
                  <p className="font-mono text-[9px] text-ink-cream/20 mt-2">md / light</p>
                </div>
                <div>
                  <Logo size="lg" variant="light" />
                  <p className="font-mono text-[9px] text-ink-cream/20 mt-2">lg / light</p>
                </div>
                <div className="bg-ink-cream rounded-lg p-4">
                  <Logo size="md" variant="dark" />
                  <p className="font-mono text-[9px] text-ink-black/30 mt-2">md / dark</p>
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* EFFECTS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="effects"
            title="Effects"
            description="Film grain, glows, and the theme toggle"
            dark
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="relative rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] p-8 h-40 overflow-hidden">
                <FilmGrainOverlay className="opacity-[0.06]" />
                <p className="relative z-10 font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
                  Film Grain Overlay
                </p>
                <p className="relative z-10 text-sm text-ink-cream/25 mt-2">
                  Subtle analog texture. Opacity adjustable via className.
                </p>
              </div>

              <div className="relative rounded-2xl border border-ink-cream/[0.06] bg-ink-black p-8 h-40 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-red)_12%,transparent),transparent_60%)]" />
                <FilmGrainOverlay className="opacity-[0.04]" />
                <p className="relative z-10 font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
                  Red Glow + Grain
                </p>
                <p className="relative z-10 text-sm text-ink-cream/25 mt-2">
                  Radial gradient glow layered with film grain.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                ThemeToggle
              </p>
              <ThemeToggle mode={themeMode} onToggle={setThemeMode} />
              <p className="font-mono text-[9px] text-ink-cream/20 mt-2">
                Current: {themeMode}
              </p>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* THE GRAVEYARD */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="deprecated"
            title="The Graveyard"
            description="Components that peaked in high school. Still here. Still haunting the codebase."
            dark
          >
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3 text-ink-cream/25">
                ComingSoon
              </p>
              <div className="rounded-2xl overflow-hidden border border-ink-cream/[0.06] max-w-md" style={{ maxHeight: 280, overflow: "hidden" }}>
                <div className="scale-[0.5] origin-top-left" style={{ width: "200%", height: "200%" }}>
                  <ComingSoon
                    title="Booking System"
                    description="Real-time scheduling for artists and studios."
                    features={["Calendar sync", "Deposit collection"]}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 p-5 rounded-xl border border-ink-cream/[0.06] bg-ink-cream/[0.02]">
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-red/60 mb-2">
                RIP HeroHeadingDeprecated
              </p>
              <p className="text-sm text-ink-cream/30 leading-relaxed">
                Replaced by the <code className="text-ink-rust">Headline</code> component which actually knows what size it wants to be.
                HeroHeadingDeprecated tried to be everything to everyone and ended up being nothing to no one.
                We don&apos;t speak of it at dinner.
              </p>
            </div>

            <div className="mb-6 p-5 rounded-xl border border-ink-cream/[0.06] bg-ink-cream/[0.02]">
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-red/60 mb-2">
                The Navigation Trilogy
              </p>
              <p className="text-sm text-ink-cream/30 leading-relaxed">
                <code className="text-ink-rust">NavigationDeprecated</code>,{" "}
                <code className="text-ink-rust">NavigationSinglePill</code>,{" "}
                <code className="text-ink-rust">NavigationSplitPills</code> &mdash;
                three failed attempts before we got the nav right. Left here as a monument to iteration.
                Like tattoo flash that never made it off the wall.
              </p>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* NAVIGATION */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="nav"
            title="Navigation"
            description="NavPill containers used in the header"
            dark
          >
            <div className="flex flex-wrap gap-4">
              <NavPill className="h-10 flex items-center px-5 rounded-full">
                <Logo size="md" variant="dark" />
              </NavPill>
              <NavPill className="h-10 flex items-center gap-1 px-[var(--pill-inset)] rounded-full">
                <span className="px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.15em] uppercase bg-ink-black/[0.06] text-ink-black font-semibold">
                  Active
                </span>
                <span className="px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/35">
                  Inactive
                </span>
              </NavPill>
              <NavPill className="h-10 flex items-center gap-2.5 pl-4 pr-[var(--pill-inset)] rounded-full">
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/35">
                  Sign In
                </span>
                <Button
                  variant="ink"
                  size="sm"
                  statusDot="w-[5px] h-[5px]"
                  className="h-auto px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] text-[10px] font-semibold gap-1.5"
                >
                  Get Started
                </Button>
              </NavPill>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* DESIGN TOKENS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="tokens"
            title="Design Tokens"
            description="The palette, straight from globals.css"
            dark
          >
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                Core Colors
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { name: "ink-black", bg: "bg-ink-black", border: true },
                  { name: "ink-cream", bg: "bg-ink-cream", border: false },
                  { name: "ink-red", bg: "bg-ink-red", border: false },
                  { name: "ink-rust", bg: "bg-ink-rust", border: false },
                  { name: "ink-sage", bg: "bg-ink-sage", border: false },
                ].map((c) => (
                  <div key={c.name}>
                    <div
                      className={`${c.bg} w-full h-16 rounded-xl ${c.border ? "border border-ink-cream/10" : ""}`}
                    />
                    <p className="font-mono text-[9px] text-ink-cream/30 mt-2 tracking-wide">
                      --{c.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                Parchment Gradient
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "parchment-light", bg: "bg-ink-parchment-light" },
                  { name: "cream", bg: "bg-ink-cream" },
                  { name: "parchment-dark", bg: "bg-ink-parchment-dark" },
                ].map((c) => (
                  <div key={c.name}>
                    <div className={`${c.bg} w-full h-16 rounded-xl`} />
                    <p className="font-mono text-[9px] text-ink-cream/30 mt-2 tracking-wide">
                      --ink-{c.name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-16 rounded-xl bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark" />
              <p className="font-mono text-[9px] text-ink-cream/30 mt-2 tracking-wide">
                Hero gradient: from-ink-parchment-light via-ink-cream to-ink-parchment-dark
              </p>
            </div>

            <div className="mt-8">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3">
                Glow Effects
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ink-red shadow-[0_0_20px_rgba(255,51,51,0.4)] mx-auto" />
                  <p className="font-mono text-[9px] text-ink-cream/30 mt-2">ink-red-glow</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ink-cream shadow-ink-cream-glow mx-auto" />
                  <p className="font-mono text-[9px] text-ink-cream/30 mt-2">ink-cream-glow</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-ink-sage shadow-ink-sage-glow mx-auto" />
                  <p className="font-mono text-[9px] text-ink-cream/30 mt-2">ink-sage-glow</p>
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ── DASHBOARD ── */}
          <ShowcaseSection id="dashboard" title="Dashboard" description="Onboarding banners, stat cards, empty states, and section wrappers">
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Onboarding Banner — Artist (Indigo)
            </p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <OnboardingBanner
                title="Finish setting up your profile"
                subtitle="4 of 7 complete — artists with full profiles get 3× more views"
                progress={4 / 7}
              />
            </div>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Onboarding Banner — Studio (Amber)
            </p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <OnboardingBanner
                title="Finish setting up your studio"
                subtitle="3 of 6 complete — customize your page for free, publish when you&apos;re ready"
                progress={3 / 6}
              />
            </div>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Profile Header — Artist
            </p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <ProfileHeader
                name="Sarah Chen"
                tags={["Fine Line", "Minimalist", "Geometric"]}
                avatarShape="circle"
                onEdit={() => {}}
              />
            </div>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Profile Header — Studio
            </p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <ProfileHeader
                name="Iron Rose Tattoo"
                subtitle="Portland, OR · (503) 555-0142"
                tags={["Traditional", "Japanese", "Neo-Traditional"]}
                avatarShape="rounded"
                onEdit={() => {}}
              />
            </div>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Stat Cards
            </p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Profile views" value={0} empty />
                <StatCard label="Saves" value={38} />
                <StatCard label="Messages" value={12} />
              </div>
            </div>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Empty States
            </p>
            <div className="bg-white rounded-xl p-4 space-y-4 mb-6">
              <EmptyState
                message="No bio yet"
                description="Tell clients about your work and style"
                action={{ label: "+ Add a bio", onClick: () => {} }}
              />
              <EmptyState
                variant="subtle"
                message="No upcoming bookings"
                description="Bookings will appear here once clients find you"
              />
            </div>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              Dashboard Section
            </p>
            <div className="bg-white rounded-xl p-4">
              <DashboardSection title="Portfolio" action={{ label: "+ Add work", onClick: () => {} }}>
                <EmptyState
                  message="No portfolio pieces yet"
                  description="Show off your best work"
                  action={{ label: "+ Upload your first piece", onClick: () => {} }}
                />
              </DashboardSection>
            </div>
          </ShowcaseSection>

          {/* ═══════════════════════════════════════════════ */}
          {/* DASHBOARD INTERACTIONS */}
          {/* ═══════════════════════════════════════════════ */}
          <ShowcaseSection
            id="dashboard-interactions"
            title="Dashboard Interactions"
            description="Toggles, time blocks, affiliation rows, and slide-over panels"
            dark
          >
            {/* ToggleSwitch */}
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              ToggleSwitch — sm &amp; md sizes, live state
            </p>
            <div className="bg-ink-cream/[0.03] border border-ink-cream/[0.06] rounded-xl p-4 mb-6 flex items-center gap-8">
              <div className="flex items-center gap-3">
                <ToggleSwitch checked={toggleSmChecked} onChange={setToggleSmChecked} size="sm" />
                <span className="font-mono text-[10px] text-ink-cream/40 tracking-wide">
                  sm — {toggleSmChecked ? "on" : "off"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch checked={toggleMdChecked} onChange={setToggleMdChecked} size="md" />
                <span className="font-mono text-[10px] text-ink-cream/40 tracking-wide">
                  md — {toggleMdChecked ? "on" : "off"}
                </span>
              </div>
            </div>

            {/* TimeSlotBlock */}
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              TimeSlotBlock — interactive day block with add / remove / toggle
            </p>
            <div className="bg-ink-cream/[0.03] border border-ink-cream/[0.06] rounded-xl p-4 mb-6">
              <TimeSlotBlock
                dayName="Monday"
                enabled={mondayEnabled}
                onToggle={setMondayEnabled}
                slots={mondaySlots}
                onAddSlot={() =>
                  setMondaySlots((prev) => [...prev, { start: "10:00 AM", end: "6:00 PM" }])
                }
                onRemoveSlot={(i) =>
                  setMondaySlots((prev) => prev.filter((_, idx) => idx !== i))
                }
                onUpdateSlot={(i, field, value) =>
                  setMondaySlots((prev) =>
                    prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
                  )
                }
              />
            </div>

            {/* AffiliationRow */}
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              AffiliationRow — active, pending-invite, pending-request variants
            </p>
            <div className="bg-ink-cream/[0.03] border border-ink-cream/[0.06] rounded-xl px-4 mb-6">
              <AffiliationRow name="Sarah Chen" subtitle="Fine Line · Minimalist" status="active" />
              <AffiliationRow name="Marcus Rivera" subtitle="Traditional · Neo-Traditional" status="pending-invite" />
              <AffiliationRow
                name="Yuki Tanaka"
                subtitle="Geometric · Blackwork"
                status="pending-request"
                onAccept={() => {}}
                onDecline={() => {}}
              />
            </div>

            {/* SlideOverPanel */}
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-cream/25 mb-4">
              SlideOverPanel — right drawer on desktop, bottom sheet on mobile
            </p>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setSlideOverOpen(true)}
                className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-rust border border-ink-rust/20 rounded-lg px-4 py-2 hover:bg-ink-rust/[0.06] transition-colors"
              >
                Open Demo Panel
              </button>
              <SlideOverPanel
                open={slideOverOpen}
                onClose={() => setSlideOverOpen(false)}
                title="Demo Panel"
              >
                <p className="font-mono text-[11px] text-ink-cream/40 leading-relaxed mb-4">
                  This is the SlideOverPanel component. On mobile it slides up from the bottom; on desktop it animates in from the right edge.
                </p>
                <p className="font-mono text-[11px] text-ink-cream/40 leading-relaxed">
                  Press Escape or click the backdrop to close. Scroll is locked on the body while the panel is open.
                </p>
              </SlideOverPanel>
            </div>
          </ShowcaseSection>

          {/* ── LINE UP COMPONENTS ── */}
          <ShowcaseSection id="lineup" title="Line Up" description="Newsletter/feed components: tabs, cover stories, news cards, blast events, editor's picks, and archive issue cards" dark>
            <div className="space-y-8">
              <ComponentRow label="LineupTabs" dark>
                <div className="w-full">
                  <LineupTabs
                    activeTab={"this-week" as LineupTabValue}
                    onTabChange={() => {}}
                    eventCount={3}
                  />
                </div>
              </ComponentRow>

              <ComponentRow label="CoverStory" dark>
                <div className="w-full">
                  <CoverStory spotlight={getAllSpotlights()[0]} />
                </div>
              </ComponentRow>

              <ComponentRow label="NewsCard" dark>
                <div className="w-full">
                  <NewsCard
                    article={{
                      slug: "demo",
                      category: "Trending",
                      headline: "The Rise of Blue Ceramic Tattoos",
                      excerpt: "How Portuguese azulejo tile patterns became the most-requested style of 2026.",
                      readTime: "5 min read",
                      date: "2026-04-03",
                    }}
                  />
                </div>
              </ComponentRow>

              <ComponentRow label="BlastCard (active + past)" dark>
                <div className="w-full space-y-2">
                  <BlastCard
                    event={{
                      id: "demo-1",
                      type: "flash",
                      title: "Sacred Geometry — Spring Flash Day",
                      details: "Walk-ins welcome · 12 artists · Pieces from $80",
                      date: "2026-04-12",
                      location: "Austin, TX",
                      ctaLabel: "Save Event",
                    }}
                  />
                  <BlastCard
                    event={{
                      id: "demo-2",
                      type: "guest-spot",
                      title: "Past Event Demo",
                      details: "This event already happened",
                      date: "2025-01-01",
                      location: "NYC",
                      ctaLabel: "View",
                    }}
                    past
                  />
                </div>
              </ComponentRow>

              <ComponentRow label="PickRow" dark>
                <div className="w-full">
                  {lineupIssues[0].editorsPicks.slice(0, 3).map((p, i) => (
                    <PickRow key={p.id} profile={p} rank={i + 1} />
                  ))}
                </div>
              </ComponentRow>

              <ComponentRow label="IssueCard (Archive)" dark>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lineupIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      isActive={issue.id === lineupIssues[0].id}
                      onSelect={() => {}}
                    />
                  ))}
                </div>
              </ComponentRow>
            </div>
          </ShowcaseSection>

          {/* ── FOOTER ── */}
          <div className="text-center pt-10 border-t border-ink-cream/[0.04]">
            <p
              className={`${permanentMarker.className} text-sm text-ink-cream/[0.08] tracking-wider`}
            >
              tattoos or it didn&apos;t happen
            </p>
            <p className="font-mono text-[9px] text-ink-cream/15 tracking-[0.15em] uppercase mt-3">
              Built with ink, caffeine, and unreasonable attention to detail
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
