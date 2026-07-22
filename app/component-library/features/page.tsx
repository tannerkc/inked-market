"use client";

import { useState, type ReactNode } from "react";

type AccentKey = "indigo" | "violet" | "purple" | "blue" | "fuchsia" | "cyan";

type AccentColor = {
  bg: string;
  border: string;
  glow: string;
  icon: string;
  text: string;
};

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
  accent: AccentKey;
};

const features: readonly Feature[] = [
  {
    title: "Discover Artists",
    description:
      "Browse thousands of verified tattoo artists and studios. Filter by style, location, and specialties.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    accent: "indigo",
  },
  {
    title: "Portfolio Reviews",
    description:
      "View detailed portfolios with high-quality images and read authentic reviews from real customers.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    accent: "violet",
  },
  {
    title: "Verified Professionals",
    description:
      "All artists and studios are verified for your safety and peace of mind. Quality guaranteed.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    accent: "purple",
  },
  {
    title: "Direct Messaging",
    description:
      "Chat directly with artists to discuss your ideas, pricing, and availability. No middleman.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    accent: "blue",
  },
  {
    title: "Save Favorites",
    description:
      "Bookmark your favorite artists, studios, and designs. Build your inspiration collection.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    accent: "fuchsia",
  },
  {
    title: "Artist Analytics",
    description:
      "Artists get powerful tools to manage their portfolio, track bookings, and grow their business.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: "cyan",
  },
];

const accentColors: Record<AccentKey, AccentColor> = {
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    glow: "shadow-[0_0_24px_rgba(99,102,241,0.15)]",
    icon: "bg-indigo-500/20 text-indigo-300",
    text: "text-indigo-300",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "shadow-[0_0_24px_rgba(139,92,246,0.15)]",
    icon: "bg-violet-500/20 text-violet-300",
    text: "text-violet-300",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-[0_0_24px_rgba(168,85,247,0.15)]",
    icon: "bg-purple-500/20 text-purple-300",
    text: "text-purple-300",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_24px_rgba(59,130,246,0.15)]",
    icon: "bg-blue-500/20 text-blue-300",
    text: "text-blue-300",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    glow: "shadow-[0_0_24px_rgba(217,70,239,0.15)]",
    icon: "bg-fuchsia-500/20 text-fuchsia-300",
    text: "text-fuchsia-300",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "shadow-[0_0_24px_rgba(6,182,212,0.15)]",
    icon: "bg-cyan-500/20 text-cyan-300",
    text: "text-cyan-300",
  },
};

const accentFor = (key: AccentKey): AccentColor => accentColors[key]!;

/* ─────────────────────────────────────────────
   Variant A — Bento Grid
   ───────────────────────────────────────────── */
function BentoGrid() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-indigo-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-indigo-400 mb-4">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Everything You Need to Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Perfect Artist
            </span>
          </h2>
          <p className="text-lg text-indigo-200/70 max-w-2xl mx-auto">
            Our platform connects you with verified tattoo professionals and
            makes booking your next tattoo simple and secure.
          </p>
        </div>

        {/* Bento layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 max-w-6xl mx-auto">
          {/* Hero feature — spans 2 cols */}
          {(() => {
            const f = features[0]!;
            const c = accentFor(f.accent);
            return (
              <div
                className={`group relative md:col-span-2 p-8 lg:p-10 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm ${c.glow} hover:shadow-[0_0_40px_rgba(99,102,241,0.25)] transition-all duration-500`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row gap-6 items-start">
                  <div className={`w-14 h-14 rounded-xl ${c.icon} flex items-center justify-center shrink-0`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{f.title}</h3>
                    <p className="text-indigo-200/60 text-lg leading-relaxed max-w-lg">
                      {f.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Single tall card */}
          {(() => {
            const f = features[1]!;
            const c = accentFor(f.accent);
            return (
              <div
                className={`group relative p-7 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm hover:${c.glow} transition-all duration-500 lg:row-span-2`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-indigo-200/60 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })()}

          {/* Remaining 4 cards in 2-col grid */}
          {features.slice(2).map((f) => {
            const c = accentFor(f.accent);
            return (
              <div
                key={f.title}
                className={`group relative p-7 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm hover:${c.glow} transition-all duration-500`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-indigo-200/60 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Variant B — Staggered Rows
   ───────────────────────────────────────────── */
function StaggeredRows() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-indigo-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_50%)]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-indigo-400 mb-4">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Everything You Need to Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Perfect Artist
            </span>
          </h2>
          <p className="text-lg text-indigo-200/70 max-w-2xl mx-auto">
            Our platform connects you with verified tattoo professionals and
            makes booking your next tattoo simple and secure.
          </p>
        </div>

        {/* Staggered rows */}
        <div className="max-w-4xl mx-auto space-y-4">
          {features.map((f, i) => {
            const c = accentFor(f.accent);
            const isOdd = i % 2 !== 0;
            return (
              <div
                key={f.title}
                className={`${isOdd ? "ml-8 lg:ml-16" : "mr-8 lg:mr-16"}`}
              >
                <div
                  className={`group relative flex items-center gap-5 p-6 lg:p-7 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm hover:${c.glow} transition-all duration-500`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                  <div className={`relative w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center shrink-0`}>
                    {f.icon}
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-indigo-200/60 text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Variant C — Icon Strip + Expandable
   ───────────────────────────────────────────── */
function IconStripExpandable() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = features[activeIndex] ?? features[0]!;
  const activeColor = accentFor(active.accent);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-indigo-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_60%)]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-indigo-400 mb-4">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Everything You Need to Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Perfect Artist
            </span>
          </h2>
          <p className="text-lg text-indigo-200/70 max-w-2xl mx-auto">
            Our platform connects you with verified tattoo professionals and
            makes booking your next tattoo simple and secure.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Icon strip */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-8">
            {features.map((f, i) => {
              const c = accentFor(f.accent);
              const isActive = i === activeIndex;
              return (
                <button
                  key={f.title}
                  onClick={() => setActiveIndex(i)}
                  className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${
                    isActive ? "scale-110" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `${c.icon} ${c.glow}`
                        : "bg-white/5 text-indigo-300/50"
                    }`}
                  >
                    {f.icon}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 hidden sm:block ${
                      isActive ? c.text : "text-indigo-300/40"
                    }`}
                  >
                    {f.title.split(" ")[0]}
                  </span>
                  {isActive && (
                    <div className={`absolute -bottom-3 w-1 h-1 rounded-full ${c.icon}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Expanded detail panel */}
          <div
            className={`relative p-8 lg:p-10 rounded-2xl border ${activeColor.border} ${activeColor.bg} backdrop-blur-sm ${activeColor.glow} transition-all duration-500`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative text-center">
              <div className={`w-16 h-16 rounded-2xl ${activeColor.icon} flex items-center justify-center mx-auto mb-6`}>
                <div className="w-8 h-8 [&>svg]:w-8 [&>svg]:h-8">{active.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {active.title}
              </h3>
              <p className="text-indigo-200/60 text-lg leading-relaxed max-w-lg mx-auto">
                {active.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Gallery Page
   ───────────────────────────────────────────── */
export default function FeaturesGallery() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24">
      {/* Gallery header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-3xl font-bold text-white mb-2">
          Features Section — Layout Variants
        </h1>
        <p className="text-indigo-300/60">
          Bold Contrast direction. Compare the three layouts below and pick your favorite.
        </p>
      </div>

      {/* Variant A */}
      <div className="border-t border-indigo-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full">
              Variant A
            </span>
            <span className="text-sm text-indigo-300/50">Bento Grid</span>
          </div>
        </div>
        <BentoGrid />
      </div>

      {/* Variant B */}
      <div className="border-t border-indigo-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest uppercase text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
              Variant B
            </span>
            <span className="text-sm text-indigo-300/50">Staggered Rows</span>
          </div>
        </div>
        <StaggeredRows />
      </div>

      {/* Variant C */}
      <div className="border-t border-indigo-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest uppercase text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full">
              Variant C
            </span>
            <span className="text-sm text-indigo-300/50">Icon Strip + Expandable</span>
          </div>
        </div>
        <IconStripExpandable />
      </div>

      {/* Bottom spacer */}
      <div className="h-24" />
    </div>
  );
}
