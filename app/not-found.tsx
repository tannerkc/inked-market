import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { permanentMarker, bebasNeue, pirataOne } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Page Not Found | Inked Market",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-black px-6 pt-16 text-center">
      <FilmGrainOverlay />
      {/* Faded red aura, like ink bleeding under skin */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ink-red)_8%,transparent),transparent_65%)]" />

      {/* Giant watermark numeral */}
      <span
        aria-hidden
        className={`${pirataOne.className} pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[38vw] leading-none text-ink-cream/[0.04] md:text-[24rem]`}
      >
        404
      </span>

      <div className="relative z-10 flex max-w-lg flex-col items-center">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-px w-5 bg-ink-rust/40" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-rust">
            Error 404
          </span>
          <div className="h-px w-5 bg-ink-rust/40" />
        </div>

        <h1 className={`${bebasNeue.className} text-6xl leading-[0.95] text-ink-cream md:text-7xl`}>
          This Page Was
        </h1>
        <span
          className={`${permanentMarker.className} mt-1 -rotate-2 text-4xl text-ink-red md:text-5xl`}
        >
          never inked
        </span>

        <p className="mt-6 text-sm leading-relaxed text-ink-cream/45">
          The design you&rsquo;re after isn&rsquo;t in our flash book. It may
          have moved, been renamed, or the stencil never made it to skin.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Button
            as={Link}
            href="/"
            variant="ink-red"
            size="sm"
            statusDot="bg-ink-cream shadow-ink-cream-glow"
          >
            Back to Home
          </Button>
          <Button as={Link} href="/discover" variant="ink-light-outline" size="sm">
            Browse Artists &amp; Studios
          </Button>
        </div>
      </div>
    </div>
  );
}
