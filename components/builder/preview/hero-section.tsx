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

/** Bold Editorial signature: magazine masthead — rule lines, huge name, meta row, wide image band. */
function MastheadHero() {
  const { config, data } = useStudioSite();
  const metaParts = [
    [data?.city, data?.state].filter(Boolean).join(", "),
    (data?.specialties ?? []).slice(0, 3).join(" / "),
  ].filter((p) => p.length > 0);

  return (
    <div
      className="flex min-h-[520px] flex-col justify-between gap-6 px-6 pt-10 @lg:px-12"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div>
        <div className="h-[3px] w-full" style={{ backgroundColor: "var(--text-primary)" }} />
        <h1
          className="py-3 text-center text-6xl leading-[0.9] @lg:py-5 @lg:text-8xl"
          style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}
        >
          {data?.name ?? ""}
        </h1>
        <div className="h-px w-full" style={{ backgroundColor: "var(--border)" }} />
        <div
          className="flex flex-wrap items-center justify-between gap-2 py-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--text-muted)" }}
        >
          {metaParts.map((part) => (
            <span key={part}>{part}</span>
          ))}
          {config.showHeroSubtext !== false ? (
            <span style={{ color: "var(--text-secondary)" }}>
              {config.heroSubtext || "Tattoo crafted with intention."}
            </span>
          ) : null}
        </div>
        <div className="h-px w-full" style={{ backgroundColor: "var(--border)" }} />
      </div>
      <div
        data-hero-image
        className="relative min-h-[240px] flex-1"
        style={heroImageStyle(data?.coverImage)}
      >
        {!data?.coverImage ? (
          <div className="absolute bottom-4 left-4">
            <PromptChip group="photos" label="Add cover photo" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Studio Minimal signature: the hero IS a photo grid; name floats on a quiet panel. */
function GridOverlayHero() {
  const { data } = useStudioSite();
  const tiles = (data?.images ?? []).slice(0, 6);
  const cells: (string | undefined)[] =
    tiles.length > 0 ? tiles : Array.from({ length: 6 }, () => undefined);

  return (
    <div className="relative min-h-[520px]">
      <div className="grid h-full min-h-[520px] grid-cols-2 gap-px @lg:grid-cols-3" aria-hidden={tiles.length === 0}>
        {cells.map((src, i) => (
          <div
            key={i}
            data-gallery-item
            className={cn("min-h-[170px]", tiles.length === 0 && "opacity-50")}
            style={
              src
                ? { backgroundImage: `url("${src}")`, backgroundSize: "cover", backgroundPosition: "center" }
                : { backgroundColor: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN }
            }
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="flex flex-col items-center gap-4 px-10 py-8 text-center"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg-primary) 92%, transparent)",
            backdropFilter: "blur(4px)",
          }}
        >
          <HeroContent centered />
          {tiles.length === 0 ? <PromptChip group="photos" label="Add photos" /> : null}
        </div>
      </div>
    </div>
  );
}

/** Gutter Punk signature: zine collage — rotated tiles, tape corners, stamped name. */
function ZineHero() {
  const { config, data } = useStudioSite();
  const photos = data?.images ?? [];
  const tiles: (string | undefined)[] = [0, 1, 2].map((i) => photos[i]);

  return (
    <div
      className="relative min-h-[520px] overflow-hidden px-6 py-12 @lg:px-12"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 @lg:gap-8">
        {tiles.map((src, i) => (
          <div
            key={i}
            className={cn(
              "relative h-[280px] w-[200px] shrink-0 @lg:h-[360px] @lg:w-[260px]",
              i === 0 && "-rotate-[4deg] translate-y-6",
              i === 1 && "rotate-[2deg] -translate-y-3",
              i === 2 && "hidden -rotate-[1.5deg] translate-y-8 @md:block",
              !src && "opacity-40",
            )}
            style={
              src
                ? {
                    backgroundImage: `url("${src}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  }
                : {
                    backgroundColor: "var(--bg-sunken)",
                    backgroundImage: PLACEHOLDER_PATTERN,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  }
            }
          >
            {/* tape strip */}
            <span
              aria-hidden="true"
              className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg]"
              style={{ backgroundColor: "color-mix(in srgb, var(--text-primary) 18%, transparent)" }}
            />
          </div>
        ))}
      </div>
      <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-5 text-center">
        <h1
          className="inline-block -rotate-[2deg] px-5 py-2 text-5xl uppercase tracking-tight @lg:text-7xl"
          style={{
            fontFamily: "var(--heading-font)",
            color: "var(--bg-primary)",
            backgroundColor: "var(--text-primary)",
            boxShadow: "4px 4px 0 var(--accent)",
          }}
        >
          {data?.name ?? ""}
        </h1>
        {config.showHeroSubtext !== false ? (
          <p
            className="max-w-md text-sm font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {config.heroSubtext || "Tattoo crafted with intention."}
          </p>
        ) : null}
        {photos.length === 0 ? <PromptChip group="photos" label="Add photos" /> : null}
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
      {config.heroLayout === "masthead" ? <MastheadHero /> : null}
      {config.heroLayout === "grid-overlay" ? <GridOverlayHero /> : null}
      {config.heroLayout === "zine" ? <ZineHero /> : null}
    </section>
  );
}
