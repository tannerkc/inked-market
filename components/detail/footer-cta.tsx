import React from "react";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { cn } from "@/lib/utils";

interface FooterCtaProps {
  heading: string;
  subtitle: string;
  buttonLabel: string;
  headingFont: string;
  bookingUrl?: string;
  className?: string;
}

const FooterCta = React.forwardRef<HTMLElement, FooterCtaProps>(
  ({ heading, subtitle, buttonLabel, headingFont, bookingUrl, className }, ref) => (
    <section
      ref={ref}
      className={cn(
        "text-center pt-20 md:pt-28 pb-16 md:pb-20 px-6 relative mt-10 md:mt-14",
        className
      )}
    >
      <div className="absolute inset-0 bg-ink-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_srgb,var(--ink-red)_10%,transparent),transparent_70%)]" />
      <FilmGrainOverlay />
      <h2
        className={`${headingFont} text-[40px] text-ink-cream mb-2 relative z-10`}
      >
        {heading}
      </h2>
      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/30 mb-6 relative z-10">
        {subtitle}
      </p>
      {bookingUrl ? (
        <Button as="a" href={bookingUrl} target="_blank" rel="noopener noreferrer"
          variant="ink-red" size="md" statusDot="bg-ink-cream shadow-ink-cream-glow" className="relative z-10 mx-auto">
          {buttonLabel}
        </Button>
      ) : (
        <Button variant="ink-red" size="md" statusDot="bg-ink-cream shadow-ink-cream-glow" className="relative z-10 mx-auto">
          {buttonLabel}
        </Button>
      )}
    </section>
  )
);
FooterCta.displayName = "FooterCta";

export { FooterCta };
