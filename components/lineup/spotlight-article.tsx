import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { bebasNeue, permanentMarker } from "@/lib/fonts";
import { badgeColorMap } from "@/lib/data/discover";
import type { LineupSpotlight } from "@/lib/types/lineup";

export interface SpotlightArticleProps {
  spotlight: LineupSpotlight;
  relatedSpotlights?: LineupSpotlight[];
  className?: string;
}

const SpotlightArticle = React.forwardRef<HTMLDivElement, SpotlightArticleProps>(
  ({ spotlight, relatedSpotlights = [], className }, ref) => {
    const {
      type,
      name,
      tagline,
      image,
      location,
      specialties,
      badges,
      content,
    } = spotlight;

    return (
      <div ref={ref} className={cn("min-h-screen", className)}>
        {/* Hero */}
        <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-ink-black/60 to-ink-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-3xl mx-auto">
            <div className="flex gap-1.5 mb-3">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] uppercase text-white backdrop-blur-md",
                    badgeColorMap[badge.color]
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <p
              className={cn(
                permanentMarker.className,
                "text-xs text-ink-red tracking-[0.2em] -rotate-1 inline-block mb-2"
              )}
            >
              {type === "artist" ? "Artist Spotlight" : "Studio Spotlight"}
            </p>
            <h1
              className={cn(
                bebasNeue.className,
                "text-4xl md:text-6xl tracking-wider leading-[0.95] text-ink-cream"
              )}
            >
              {name}
            </h1>
            <p className="text-lg text-ink-cream/50 mt-2">{tagline}</p>
            <p className="font-mono text-[11px] text-ink-cream/30 tracking-wider mt-3">
              {location} · {specialties.join(" · ")}
            </p>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
          {content.sections.map((section, i) => (
            <div key={i} className="mb-10">
              <h2
                className={cn(
                  bebasNeue.className,
                  "text-2xl md:text-3xl tracking-wider text-ink-cream mb-4"
                )}
              >
                {section.title}
              </h2>
              <p className="text-base text-ink-cream/60 leading-[1.8]">
                {section.body}
              </p>
            </div>
          ))}

          {/* Pull Quote */}
          {content.pullQuote && (
            <blockquote className="my-12 pl-6 border-l-2 border-ink-red/40">
              <p className="text-xl text-ink-cream/70 italic leading-relaxed">
                &ldquo;{content.pullQuote}&rdquo;
              </p>
              <cite className="block mt-3 font-mono text-[11px] text-ink-red tracking-wider not-italic">
                — {name}
              </cite>
            </blockquote>
          )}

          {/* Portfolio Grid */}
          {content.portfolioImages.length > 0 && (
            <div className="my-12">
              <h3
                className={cn(
                  bebasNeue.className,
                  "text-xl tracking-wider text-ink-cream/40 mb-4"
                )}
              >
                Portfolio
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                {content.portfolioImages.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-ink-cream/[0.04] border border-ink-cream/[0.04]"
                  >
                    <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-ink-cream/15">
                      Portfolio {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags & CTA */}
          <div className="my-12 pt-8 border-t border-ink-cream/[0.06]">
            <div className="flex flex-wrap gap-1.5 mb-6">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full font-mono text-[9px] tracking-wide bg-ink-cream/[0.06] text-ink-cream/45"
                >
                  {s}
                </span>
              ))}
            </div>
            <Link
              href={content.profileLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink-red text-white font-mono text-[11px] tracking-[0.15em] uppercase hover:bg-ink-red/90 transition-colors"
            >
              View Full {type === "artist" ? "Portfolio" : "Studio"}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Related Spotlights */}
          {relatedSpotlights.length > 0 && (
            <div className="mt-16 pt-8 border-t border-ink-cream/[0.06]">
              <h3
                className={cn(
                  bebasNeue.className,
                  "text-xl tracking-wider text-ink-cream/40 mb-6"
                )}
              >
                More Spotlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedSpotlights.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/lineup/spotlights/${related.slug}`}
                    className="group rounded-xl border border-ink-cream/[0.06] overflow-hidden hover:border-ink-cream/[0.12] transition-colors"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                        style={{ backgroundImage: `url(${related.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <p className="font-mono text-[9px] text-ink-red tracking-wider uppercase">
                          {related.type === "artist"
                            ? "Artist"
                            : "Studio"}
                        </p>
                        <p className="font-semibold text-sm text-ink-cream">
                          {related.name}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-xs text-ink-cream/40 line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SpotlightArticle.displayName = "SpotlightArticle";

export { SpotlightArticle };
