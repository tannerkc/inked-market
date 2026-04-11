"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { CtaStyle } from "@/lib/types/builder";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import { PLACEHOLDER_PATTERN } from "@/lib/utils/placeholder-pattern";


const CTA_STYLES: Record<CtaStyle, { className: string; style: React.CSSProperties }> = {
  filled: {
    className: "rounded-lg px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90",
    style: { backgroundColor: "var(--accent)", color: "var(--accent-text)" },
  },
  outline: {
    className: "rounded-lg border-2 px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-80",
    style: { borderColor: "var(--accent)", color: "var(--accent)", background: "transparent" },
  },
  pill: {
    className: "rounded-full px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90",
    style: { backgroundColor: "var(--accent)", color: "var(--accent-text)" },
  },
};

function HeroContent({ centered }: { centered?: boolean }) {
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const ctaStyle = CTA_STYLES[config.ctaStyle] ?? CTA_STYLES.filled;
  const showLogo = config.logoUrl && config.logoPlacement === "hero";

  return (
    <>
      {/* Logo (hero placement) */}
      {showLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.logoUrl}
          alt="Studio logo"
          style={{ height: "48px", width: "auto", objectFit: "contain" }}
          className={centered ? "mx-auto" : ""}
        />
      )}

      {/* Location */}
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--text-muted)" }}
      >
        {[data?.city, data?.state].filter(Boolean).join(', ')}
      </p>

      {/* Studio name */}
      <h1
        className="text-5xl font-bold uppercase tracking-tight @lg:text-7xl"
        style={{ fontFamily: "var(--heading-font)" }}
      >
        {data?.name ?? ''}
      </h1>

      {/* Tagline */}
      {config.showHeroSubtext !== false && (
        <p
          className={cn("text-base leading-relaxed @lg:text-lg", centered ? "max-w-lg" : "max-w-md")}
          style={{ color: "var(--text-secondary)" }}
        >
          {config.heroSubtext || "Tattoo crafted with intention."}
        </p>
      )}

      {/* CTA + secondary link */}
      {config.showHeroCta !== false && (
        <div className={cn("flex flex-col items-center gap-4 @md:flex-row @md:gap-5", centered && "@md:justify-center")}>
          <button className={ctaStyle.className} style={ctaStyle.style}>
            Book a Consultation
          </button>
          <span
            className="text-[13px] font-medium transition-colors hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            View Our Work ↓
          </span>
        </div>
      )}
    </>
  );
}

function SplitHero() {
  return (
    <div className="grid min-h-[520px] grid-cols-1 @lg:grid-cols-2">
      <div
        className="min-h-[280px] @lg:min-h-full"
        style={{
          backgroundColor: "var(--bg-sunken)",
          backgroundImage: PLACEHOLDER_PATTERN,
        }}
      />
      <div
        className="flex flex-col justify-center gap-5 p-8 @lg:p-12"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <HeroContent />
      </div>
    </div>
  );
}

function FullbleedHero() {
  return (
    <div
      className="relative min-h-[520px]"
      style={{
        backgroundColor: "var(--bg-sunken)",
        backgroundImage: PLACEHOLDER_PATTERN,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg-deep) 10%, transparent 60%)",
        }}
      />
      <div className="relative flex h-full min-h-[520px] flex-col justify-end gap-5 p-8 @lg:max-w-xl @lg:p-12">
        <HeroContent />
      </div>
    </div>
  );
}

function CenteredHero() {
  return (
    <div
      className="relative min-h-[520px]"
      style={{ backgroundColor: "var(--hero-bg)" }}
    >
      <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-5 p-8 text-center @lg:p-12">
        <HeroContent centered />
      </div>
    </div>
  );
}

export function HeroSection({ className }: { className?: string }) {
  const { config } = useBuilder();

  return (
    <section
      className={cn(
        "w-full transition-all duration-500 ease-in-out",
        className,
      )}
    >
      {config.heroLayout === "split" && <SplitHero />}
      {config.heroLayout === "fullbleed" && <FullbleedHero />}
      {config.heroLayout === "centered" && <CenteredHero />}
    </section>
  );
}
