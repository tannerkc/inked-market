"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { SectionLabel } from "@/components/ui/section-label";
import { FeatureCard } from "@/components/ui/feature-card";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { IconBox } from "@/components/ui/icon-box";
import { DrawingCanvas } from "@/components/hero/drawing-canvas";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ZineSpread } from "@/components/discover/zine-spread";
import { mockArtists, mockShops } from "@/lib/data/discover";
import { useEffect, useState } from "react";
import { Permanent_Marker, Bebas_Neue, Pirata_One, Limelight, Rye, Abril_Fatface, UnifrakturCook } from "next/font/google";

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const pirataOne = Pirata_One({
  weight: "400",
  subsets: ["latin"],
});

const limelight = Limelight({
  weight: "400",
  subsets: ["latin"],
});

const rye = Rye({
  weight: "400",
  subsets: ["latin"],
});

const abrilFatface = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
});

const unifrakturCook = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
});

const heroDecorations = [
  { src: "/tattoos/bird-svgrepo-com.svg", alt: "Bird", w: 80, h: 80, pos: "top-12 left-12", opacity: "opacity-30", speed: 0.15 },
  { src: "/tattoos/bird-of-paradise-svgrepo-com.svg", alt: "Bird of Paradise", w: 70, h: 80, pos: "top-24 right-24", opacity: "opacity-25", speed: 0.25 },
  { src: "/tattoos/paper-airplane-svgrepo-com.svg", alt: "Paper Airplane", w: 60, h: 60, pos: "top-32 left-1/3", opacity: "opacity-20", speed: 0.2 },
  { src: "/tattoos/skull-emoji-smiley-svgrepo-com.svg", alt: "Skull", w: 60, h: 70, pos: "right-16 top-1/3", opacity: "opacity-30", speed: 0.1 },
  { src: "/tattoos/ghost-svgrepo-com.svg", alt: "Ghost", w: 60, h: 70, pos: "bottom-32 left-24", opacity: "opacity-25", speed: -0.1 },
  { src: "/tattoos/balloon-dog-svgrepo-com.svg", alt: "Balloon Dog", w: 70, h: 60, pos: "bottom-40 right-32", opacity: "opacity-20", speed: -0.15 },
  { src: "/tattoos/alien-svgrepo-com.svg", alt: "Alien", w: 60, h: 70, pos: "left-20 top-1/2", opacity: "opacity-25", speed: 0.18 },
  { src: "/tattoos/butterfly-svgrepo-com.svg", alt: "Butterfly", w: 70, h: 60, pos: "top-16 right-1/4", opacity: "opacity-20", speed: 0.22 },
  { src: "/tattoos/matchstick-cross-svgrepo-com.svg", alt: "Matchstick Cross", w: 60, h: 60, pos: "bottom-20 left-1/2", opacity: "opacity-25", speed: -0.12 },
  { src: "/tattoos/cards-svgrepo-com.svg", alt: "Playing Cards", w: 60, h: 70, pos: "bottom-24 right-1/4", opacity: "opacity-20", speed: -0.18 },
  { src: "/tattoos/mushroom-svgrepo-com.svg", alt: "Mushroom", w: 60, h: 60, pos: "bottom-1/3 left-1/4", opacity: "opacity-20", speed: -0.08 },
];

const featureIcons = {
  search: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  portfolio: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  verified: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  messaging: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
  bookmark: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  analytics: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

const heroTaglines: { text: string; weight: number }[] = [
  { text: "No Bad Tattoos", weight: 1 },
  { text: "Tattoos Or It Didn't Happen", weight: 5 },
  { text: "Mom Won't Hate This One", weight: 3 },
  { text: "No Ragrets", weight: 5 },
  { text: "Skip The Regert", weight: 3 },
  { text: "Art That Moves With You", weight: 1 },
  { text: "Real Artists, Real Ink", weight: 1 },
  { text: "Think Before You Ink", weight: 5 },
  { text: "Curated, Not Random", weight: 1 },
];

function pickTagline() {
  const total = heroTaglines.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;
  for (const t of heroTaglines) {
    roll -= t.weight;
    if (roll <= 0) return t.text;
  }
  return heroTaglines[0].text;
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [tagline, setTagline] = useState(heroTaglines[0].text);

  useEffect(() => {
    setTagline(pickTagline());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark min-h-screen flex items-center justify-center overflow-hidden pt-22">
        {/* Scattered Tattoo Decorations with Parallax */}
        {heroDecorations.map((d) => (
          <div
            key={d.alt}
            className={`absolute ${d.pos} ${d.opacity}`}
            style={{ transform: `translateY(${scrollY * d.speed}px)` }}
          >
            <img src={d.src} alt={d.alt} width={d.w} height={d.h} />
          </div>
        ))}

        {/* Drawing Canvas — desktop only */}
        <DrawingCanvas />

        {/* Center Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pointer-events-none">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Eyebrow variant="badge" text={tagline} />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-ink-black leading-tight">
              <span className="flex flex-wrap items-baseline justify-center gap-x-4">
                <span className={`${pirataOne.className} text-ink-black/40`}>Discover</span>
                <span className={`${limelight.className} text-ink-black/40`}>Your</span>
                <span className={`${rye.className} text-ink-black/40`}>Next</span>
              </span>
              <span className="flex flex-wrap items-baseline justify-center gap-x-4">
                <span className={unifrakturCook.className}>Tattoo</span>
                <span className={`${permanentMarker.className} text-ink-red`}>Artist</span>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-ink-black/45 leading-relaxed max-w-2xl mx-auto">
              Connect with talented tattoo artists and professional studios.
              Browse portfolios, read reviews, and book your next piece of art.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 pointer-events-auto">
              <Button as={Link} href="/discover" variant="ink" size="lg" statusDot>
                Find Artists
              </Button>
              <Button
                variant="ink-outline"
                size="lg"
                rightIcon="arrow-down"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                How It Works
              </Button>
            </div>
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-ink-black/30 pt-8">
              <span className="font-bold text-ink-black/50">10K+</span> artists
              <span className="mx-2 text-ink-black/12">/</span>
              <span className="font-bold text-ink-black/50">5K+</span> studios
              <span className="mx-2 text-ink-black/12">/</span>
              <span className="font-bold text-ink-black/50">50K+</span> designs
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-ink-black" />
        <FilmGrainOverlay />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--ink-rust)_6%,transparent),transparent_60%)]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel label="What We Do" variant="dark" className="mb-6" />
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl text-ink-cream mb-5 uppercase tracking-wide ${bebasNeue.className}`}>
              Find Your Next{" "}
              <span className="text-ink-red text-glow-red">Piece</span>
            </h2>
            <p className="text-base text-ink-cream/40 max-w-xl mx-auto">
              Real artists. Real studios. Browse by style, city, and vibe.
            </p>
          </div>

          {/* Bento grid */}
          <BentoGrid cols={3}>
            <BentoItem colSpan={2}>
              <FeatureCard
                title="Discover Artists"
                description="Browse thousands of verified tattoo artists and studios. Filter by style, city, and vibe."
                icon={featureIcons.search}
                accentColor="red"
                tags={["fine-line", "blackwork", "neo-trad", "realism", "japanese"]}
                className="h-full p-8 lg:p-10 [&_h3]:text-2xl [&_p]:text-lg [&_p]:max-w-lg"
              />
            </BentoItem>

            <BentoItem rowSpan={2}>
              <FeatureCard
                title="Portfolio Reviews"
                description="High-quality portfolios and authentic reviews from real clients. See the work before you book."
                icon={featureIcons.portfolio}
                accentColor="rust"
                className="h-full"
              />
            </BentoItem>

            <FeatureCard
              title="Verified Studios"
              description="Real shops, real artists, no BS. Every studio is verified for safety and quality."
              icon={featureIcons.verified}
              accentColor="sage"
            />

            <FeatureCard
              title="Direct Messaging"
              description="Talk to artists directly about your ideas, pricing, and availability. No middleman."
              icon={featureIcons.messaging}
              accentColor="rust"
            />

            <FeatureCard
              title="Save Inspo"
              description="Bookmark artists, flash, and shops. Build your mood board."
              icon={featureIcons.bookmark}
              accentColor="red"
            />

            <FeatureCard
              title="Artist Tools"
              description="Manage your portfolio, track bookings, and grow your client base."
              icon={featureIcons.analytics}
              accentColor="sage"
            />
          </BentoGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-ink-black" />
        <FilmGrainOverlay />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_srgb,var(--ink-red)_6%,transparent),transparent_60%)]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-10 lg:p-14 rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.02] text-center">
              <div className="relative">
                <SectionLabel label="Get Started" variant="light" className="mb-6" />
                <h2 className={`text-4xl sm:text-5xl lg:text-6xl text-ink-cream mb-5 uppercase tracking-wide ${bebasNeue.className}`}>
                  Ready to Get{" "}
                  <span className="text-ink-red text-glow-red">Inked?</span>
                </h2>
                <p className="text-base text-ink-cream/35 mb-10 max-w-xl mx-auto">
                  Join thousands of artists and collectors who trust Inked Market
                  for their tattoo journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button as={Link} href="/discover" variant="ink-red" size="lg" statusDot="bg-white shadow-none">
                    Find Artists
                  </Button>
                  <Button variant="ink-light-outline" size="lg">
                    List Your Studio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zine Editorial — The Lineup */}
      <section className="relative overflow-hidden">
        {/* Header on parchment */}
        <div className="relative bg-gradient-to-b from-ink-parchment-light to-ink-cream py-16 lg:py-20 text-center">
          <div className="absolute inset-0 film-grain opacity-[0.025] pointer-events-none" />
          <div className="relative z-[2]">
            <p className={`${permanentMarker.className} text-xs text-ink-red tracking-[0.25em] uppercase -rotate-2 inline-block`}>
              Issue No. 01
            </p>
            <h2 className={`${bebasNeue.className} text-5xl sm:text-6xl lg:text-7xl text-ink-black leading-none tracking-wider mt-2`}>
              THE LINEUP
            </h2>
            <div className="flex items-center gap-3 justify-center mt-3">
              <div className="w-14 h-px bg-ink-black" />
              <span className="font-mono text-[10px] text-ink-black/40 tracking-[0.18em] uppercase">
                who we&apos;re watching right now
              </span>
              <div className="w-14 h-px bg-ink-black" />
            </div>
            <p className="text-sm text-ink-black/50 mt-3 max-w-md mx-auto leading-relaxed">
              Handpicked artists and studios. No algorithms. Just taste.
            </p>
          </div>
        </div>

        {/* Spread 1: Featured artist */}
        {mockArtists[0] && (
          <ZineSpread
            id={mockArtists[0].id}
            type="artist"
            name={mockArtists[0].name}
            image={mockArtists[0].image}
            location={mockArtists[0].location}
            rating={mockArtists[0].rating}
            reviewCount={mockArtists[0].reviewCount}
            description={mockArtists[0].description ?? ""}
            specialties={mockArtists[0].specialties}
            badges={[{ label: "Featured", color: "red" }, ...mockArtists[0].badges]}
            panelVariant="light"
            sectionLabel="Artist Spotlight"
            nameFont={abrilFatface.className}
            labelFont={permanentMarker.className}
          />
        )}

        {/* Spread 2: Featured studio, reversed, dark */}
        {mockShops[1] && (
          <ZineSpread
            id={mockShops[1].id}
            type="shop"
            name={mockShops[1].name}
            image={mockShops[1].image}
            location={mockShops[1].location}
            rating={mockShops[1].rating}
            reviewCount={mockShops[1].reviewCount}
            description={mockShops[1].description ?? ""}
            specialties={mockShops[1].specialties}
            badges={mockShops[1].badges}
            reverse
            panelVariant="dark"
            sectionLabel="Studio Feature"
            nameFont={abrilFatface.className}
            labelFont={permanentMarker.className}
          />
        )}

        {/* Quick grid */}
        <div className="relative bg-ink-cream py-8 lg:py-10 px-4 sm:px-10">
          <div className="absolute inset-0 film-grain opacity-[0.02] pointer-events-none" />
          <div className="relative z-[2]">
            <div className="flex items-center gap-3 mb-5 justify-center">
              <div className="flex-1 h-px bg-ink-black/[0.08]" />
              <span className="font-mono text-[10px] text-ink-black/30 tracking-[0.18em] uppercase">
                More from the lineup
              </span>
              <div className="flex-1 h-px bg-ink-black/[0.08]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {[...mockArtists.slice(2), ...mockShops.slice(2)].slice(0, 4).map((item) => (
                <Link
                  key={`${item.name}-${item.id}`}
                  href={`/artists/${item.id}`}
                  className="group relative aspect-square overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/40 transition-colors duration-300" />
                  <span className="absolute bottom-2 left-2 font-mono text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                    {item.name} &middot; {item.specialties[0]}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button as={Link} href="/discover" variant="ink-outline" size="sm" rightIcon="arrow-right">
                View All Artists
              </Button>
            </div>
          </div>
        </div>

        {/* Watermark bar */}
        <div className="relative bg-ink-black py-6 text-center">
          <div className="absolute inset-0 film-grain opacity-[0.035] pointer-events-none" />
          <p className={`${permanentMarker.className} relative z-[2] text-sm text-ink-cream/[0.1] tracking-wider`}>
            tattoos or it didn&apos;t happen
          </p>
        </div>
      </section>
    </>
  );
}
