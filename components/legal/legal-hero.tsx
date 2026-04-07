import React from "react";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/content";

interface LegalHeroProps {
  headline: string;
  subtitle: string;
  accentColor?: "sage" | "rust";
  effectiveDate?: string;
  version?: string;
  badge?: string;
  description?: string;
  className?: string;
}

const dotColorMap = {
  sage: "bg-ink-sage shadow-[0_0_6px_rgba(107,124,94,0.4)]",
  rust: "bg-ink-rust shadow-[0_0_6px_rgba(193,68,14,0.4)]",
};

const LegalHero = React.forwardRef<HTMLElement, LegalHeroProps>(
  (
    {
      headline,
      subtitle,
      accentColor = "rust",
      effectiveDate,
      version,
      badge,
      description,
      className,
    },
    ref
  ) => (
    <PageHero
      ref={ref}
      headline={headline}
      subtitle={subtitle}
      accentColor={accentColor}
      eyebrow={badge}
      description={description}
      className={className}
    >
      {(effectiveDate || version) && (
        <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-ink-cream/[0.06] bg-ink-cream/[0.03]">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              dotColorMap[accentColor]
            )}
          />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/40">
            {effectiveDate && `Effective: ${effectiveDate}`}
            {effectiveDate && version && (
              <span className="mx-2 text-ink-cream/15">&middot;</span>
            )}
            {version && `Version ${version}`}
          </span>
        </div>
      )}
    </PageHero>
  )
);
LegalHero.displayName = "LegalHero";

export { LegalHero };
