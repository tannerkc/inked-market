import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { SectionLabel } from "@/components/ui/section-label";
import { PortfolioGallery } from "@/components/artists";
import {
  DetailHero,
  ReviewPanel,
  SocialLinks,
  FooterCta,
  VerifiedBadge,
  WidgetPanel,
  WidgetLabel,
  WidgetHeading,
  IssueLabel,
  SplitName,
  BioQuote,
  MetaRow,
  MetaItem,
  MetaHighlight,
} from "@/components/detail";
import { getArtist, getArtistReviews } from "@/lib/data/artists";
import {
  permanentMarker,
  bebasNeue,
  pirataOne,
  abrilFatface,
} from "@/lib/fonts";
import { formatRating } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const artist = getArtist(id);
  return {
    title: `${artist.name} — Tattoo Artist | Inked Market`,
    description: artist.bio.slice(0, 160),
  };
}

export default async function ArtistPage({ params }: PageProps) {
  const { id } = await params;
  const artist = getArtist(id) as ReturnType<typeof getArtist> & {
    studioName?: string;
    location?: { city: string; state: string };
  };
  const reviews = getArtistReviews(id);

  const calendarDays = Array.from({ length: 21 }, (_, i) => ({
    day: i + 1,
    status:
      i + 1 === 3
        ? ("today" as const)
        : [1, 2, 5, 7, 10, 13, 16, 20].includes(i + 1)
          ? ("booked" as const)
          : ("available" as const),
  }));

  return (
    <div className="min-h-screen bg-ink-black relative">
      <FilmGrainOverlay />

      {/* ── HERO ── */}
      <DetailHero coverImage={artist.coverImage} name={artist.name}>
        <IssueLabel
          issueNumber={parseInt(artist.id) + 46}
          subtitle="Artist Spotlight"
          font={permanentMarker.className}
        />
        <SplitName
          name={artist.name}
          primaryFont={abrilFatface.className}
          accentFont={pirataOne.className}
          splitAt="first"
        />
        {artist.verified && <VerifiedBadge label="Verified Artist" />}

        {/* Works At */}
        {artist.studioId && artist.studioName && (
          <Link
            href={`/studios/${artist.studioId}`}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-ink-cream/[0.04] border border-ink-cream/[0.08] rounded-[10px] w-fit mb-4 hover:bg-ink-cream/[0.07] hover:border-ink-cream/15 transition-all duration-300 relative z-10"
          >
            <span className="w-8 h-8 rounded-lg bg-ink-rust/[0.12] flex items-center justify-center text-sm shrink-0">
              🏪
            </span>
            <div>
              <div className="font-mono text-[8px] tracking-[0.15em] uppercase text-ink-cream/30">
                Works At
              </div>
              <div className="text-xs font-semibold text-ink-cream leading-tight">
                {artist.studioName}
              </div>
            </div>
            <span className="font-mono text-[11px] text-ink-cream/25 ml-auto">
              →
            </span>
          </Link>
        )}

        <MetaRow>
          {artist.location && (
            <MetaItem>
              {artist.location.city}, {artist.location.state}
            </MetaItem>
          )}
          <MetaItem>{artist.yearsOfExperience} Years</MetaItem>
          <MetaHighlight>★ {formatRating(artist.rating)}</MetaHighlight>
          <MetaItem>({artist.reviewCount} Reviews)</MetaItem>
        </MetaRow>
        <BioQuote bio={artist.bio} />

        {/* CTA Row */}
        <div className="flex flex-wrap gap-2.5 mt-7 relative z-10">
          <Button variant="ink-red" size="sm" statusDot="bg-ink-cream shadow-ink-cream-glow">
            Book Consultation
          </Button>
          <Button variant="ink-light-outline" size="sm">
            Follow
          </Button>
          <Button variant="ink-light-outline" size="sm">
            Message
          </Button>
        </div>
      </DetailHero>

      {/* ── PORTFOLIO ── */}
      <section className="pt-10 md:pt-14">
        <SectionLabel
          label="Portfolio"
          variant="dark"
          stretch
          className="px-6 md:px-12 mb-4"
        />
        <PortfolioGallery
          images={artist.portfolioImages}
          specialties={artist.specialties}
        />
      </section>

      {/* ── DETAILS ROW ── */}
      <section className="pt-10 md:pt-14">
        <SectionLabel
          label="Details"
          variant="dark-muted"
          stretch
          className="px-6 md:px-12 mb-4"
        />
        <div className="grid grid-cols-1 min-[960px]:grid-cols-[1.2fr_1fr_1fr] gap-[3px] px-6 md:px-12">
          {/* Reviews */}
          <ReviewPanel
            reviews={reviews}
            rating={artist.rating}
            headingFont={bebasNeue.className}
          />

          {/* Availability Calendar */}
          <WidgetPanel variant="alt">
            <WidgetLabel label="Availability" />
            <WidgetHeading headingFont={bebasNeue.className}>
              April 2026
            </WidgetHeading>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span
                  key={d}
                  className="font-mono text-[8px] tracking-[0.15em] uppercase text-ink-cream/20 text-center"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ day, status }) => (
                <div
                  key={day}
                  className={`aspect-square rounded-md flex items-center justify-center font-mono text-[10px] transition-all duration-200 ${
                    status === "today"
                      ? "bg-ink-red/[0.12] border border-ink-red/40 text-ink-red"
                      : status === "available"
                        ? "bg-ink-cream/[0.04] border border-ink-cream/[0.08] text-ink-cream/50 cursor-pointer hover:bg-ink-red/10 hover:border-ink-red/30 hover:text-ink-red"
                        : "bg-ink-cream/[0.02] text-ink-cream/15"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <Button
              variant="ink-red"
              size="sm"
              statusDot="bg-ink-cream shadow-ink-cream-glow"
              className="w-full mt-4 justify-center"
            >
              Book a Date
            </Button>
          </WidgetPanel>

          {/* Certifications + Social */}
          <WidgetPanel variant="dark">
            <FilmGrainOverlay className="opacity-[0.04]" />
            <WidgetLabel label="Trust & Safety" variant="sage" />
            <WidgetHeading headingFont={bebasNeue.className}>
              Certifications
            </WidgetHeading>
            <ul className="space-y-0 relative z-10">
              {artist.certifications?.map((cert) => (
                <li
                  key={cert}
                  className="flex items-center gap-2.5 py-2 border-b border-ink-cream/[0.06] last:border-0"
                >
                  <span className="w-5 h-5 rounded-full bg-ink-sage/15 flex items-center justify-center text-ink-sage text-[10px] shrink-0">
                    ✓
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.05em] text-ink-cream/60">
                    {cert}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 relative z-10">
              <SocialLinks links={artist.socialLinks} />
            </div>
          </WidgetPanel>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <FooterCta
        heading="Ready to Get Inked?"
        subtitle="Consultations are free · Typically responds within 24 hours"
        buttonLabel="Start Your Consultation"
        headingFont={bebasNeue.className}
      />
    </div>
  );
}
