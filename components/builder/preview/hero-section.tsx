"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { HeroCtaStyle } from "@/lib/types/builder";

const SVG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const CTA_STYLES: Record<HeroCtaStyle, { className: string; style: React.CSSProperties }> = {
  filled: {
    className: "rounded-lg px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90",
    style: { backgroundColor: "var(--accent)" },
  },
  outline: {
    className: "rounded-lg border-2 px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-80",
    style: { borderColor: "var(--accent)", color: "var(--accent)", background: "transparent" },
  },
  pill: {
    className: "rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90",
    style: { backgroundColor: "var(--accent)" },
  },
};

function HeroContent({ centered }: { centered?: boolean }) {
  const { config } = useBuilder();
  const ctaStyle = CTA_STYLES[config.heroCtaStyle] ?? CTA_STYLES.filled;

  return (
    <>
      {/* Location */}
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--text-muted)" }}
      >
        Portland, OR
      </p>

      {/* Studio name */}
      <h1
        className="text-5xl font-bold uppercase tracking-tight lg:text-7xl"
        style={{ fontFamily: "var(--heading-font)" }}
      >
        IRON &amp; INK
      </h1>

      {/* Tagline */}
      {config.showHeroSubtext !== false && (
        <p
          className={cn("text-base leading-relaxed lg:text-lg", centered ? "max-w-lg" : "max-w-md")}
          style={{ color: "var(--text-secondary)" }}
        >
          {config.heroSubtext || "Tattoo crafted with intention."}
        </p>
      )}

      {/* CTA + secondary link */}
      {config.showHeroCta !== false && (
        <div className={cn("flex items-center gap-5", centered && "justify-center")}>
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
    <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-2">
      <div
        className="min-h-[280px] lg:min-h-full"
        style={{
          backgroundColor: "var(--bg-sunken)",
          backgroundImage: SVG_PATTERN,
        }}
      />
      <div
        className="flex flex-col justify-center gap-5 p-8 lg:p-12"
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
        backgroundImage: SVG_PATTERN,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg-deep) 10%, transparent 60%)",
        }}
      />
      <div className="relative flex h-full min-h-[520px] flex-col justify-end gap-5 p-8 lg:max-w-xl lg:p-12">
        <HeroContent />
      </div>
    </div>
  );
}

function CenteredHero() {
  return (
    <div
      className="relative min-h-[520px]"
      style={{
        backgroundColor: "var(--bg-sunken)",
        backgroundImage: SVG_PATTERN,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "var(--bg-deep)", opacity: 0.85 }}
      />
      <div className="relative flex h-full min-h-[520px] flex-col items-center justify-center gap-5 p-8 text-center lg:p-12">
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
