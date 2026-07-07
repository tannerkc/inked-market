"use client";

import { cn } from "@/lib/utils";
import { useStudioSite } from "@/components/studio-site/studio-site-context";
import { PromptChip } from "@/components/studio-site/empty-states";
import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";
import type { CtaStyle } from "@/lib/types/builder";
import { PLACEHOLDER_PATTERN } from "@/lib/utils/placeholder-pattern";

/** Real cover photo when set; the designed placeholder texture otherwise. */
function heroImageStyle(coverImage?: string): React.CSSProperties {
  if (coverImage) {
    return {
      backgroundImage: `url("${coverImage}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN };
}


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
  const { config, data } = useStudioSite();
  const ctaStyle = CTA_STYLES[config.ctaStyle] ?? CTA_STYLES.filled;
  const showLogo = config.logoUrl && config.logoPlacement === "hero";

  return (
    <>
      {/* Logo (hero placement) — data-URL logo, next/image not applicable */}
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.logoUrl}
          alt="Studio logo"
          style={{ height: "48px", width: "auto", objectFit: "contain" }}
          className={centered ? "mx-auto" : ""}
        />
      ) : null}

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
      {config.showHeroSubtext !== false ? <p
          className={cn("text-base leading-relaxed @lg:text-lg", centered ? "max-w-lg" : "max-w-md")}
          style={{ color: "var(--text-secondary)" }}
        >
          {config.heroSubtext || "Tattoo crafted with intention."}
        </p> : null}

      {/* CTA + secondary link — real destinations only, never dead */}
      {config.showHeroCta !== false ? <div className={cn("flex flex-col items-center gap-4 @md:flex-row @md:gap-5", centered && "@md:justify-center")}>
          {data?.bookingLink ? (
            <a
              href={data.bookingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaStyle.className}
              style={ctaStyle.style}
            >
              Book a Consultation
            </a>
          ) : (
            <button
              type="button"
              onClick={() => scrollToBuilderSection("footer-cta")}
              className={ctaStyle.className}
              style={ctaStyle.style}
            >
              Book a Consultation
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollToBuilderSection("gallery", "artist-strips")}
            className="cursor-pointer border-none bg-transparent text-[13px] font-medium transition-colors hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            View Our Work &darr;
          </button>
        </div> : null}
    </>
  );
}

function SplitHero() {
  const { data } = useStudioSite();
  return (
    <div className="grid min-h-[520px] grid-cols-1 @lg:grid-cols-2">
      <div
        data-hero-image
        className="relative min-h-[280px] @lg:min-h-full"
        style={heroImageStyle(data?.coverImage)}
      >
        {!data?.coverImage ? <div className="absolute bottom-4 left-4">
            <PromptChip group="photos" label="Add cover photo" />
          </div> : null}
      </div>
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
  const { data } = useStudioSite();
  return (
    <div
      data-hero-image
      className="relative min-h-[520px]"
      style={heroImageStyle(data?.coverImage)}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg-deep) 10%, transparent 60%)",
        }}
      />
      {!data?.coverImage ? <div className="absolute right-4 top-4 z-10">
          <PromptChip group="photos" label="Add cover photo" />
        </div> : null}
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
  const { config } = useStudioSite();

  return (
    <section
      className={cn(
        "w-full transition-all duration-500 ease-in-out",
        className,
      )}
    >
      {config.heroLayout === "split" ? <SplitHero /> : null}
      {config.heroLayout === "fullbleed" ? <FullbleedHero /> : null}
      {config.heroLayout === "centered" ? <CenteredHero /> : null}
    </section>
  );
}
