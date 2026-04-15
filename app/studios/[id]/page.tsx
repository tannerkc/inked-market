import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { SectionLabel } from "@/components/ui/section-label";
import {
  DetailHero,
  ReviewPanel,
  SocialLinks,
  FooterCta,
  ImageGallery,
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
import { getStudio, getStudioReviews } from "@/lib/data/shops";
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
  const studio = getStudio(id);
  if (!studio) return { title: "Studio Not Found | Inked Market" };
  return {
    title: `${studio.name} — Tattoo Studio | Inked Market`,
    description: studio.description,
  };
}

export default async function StudioPage({ params }: PageProps) {
  const { id } = await params;
  const studio = getStudio(id);
  if (!studio) notFound();
  const reviews = getStudioReviews(id);

  return (
    <div className="min-h-screen bg-ink-black relative">
      <FilmGrainOverlay />

      {/* ── HERO ── */}
      <DetailHero coverImage={studio.coverImage} name={studio.name}>
        <IssueLabel
          issueNumber={parseInt(studio.id) + 12}
          subtitle="Featured Studio"
          font={permanentMarker.className}
        />
        <SplitName
          name={studio.name}
          primaryFont={abrilFatface.className}
          accentFont={pirataOne.className}
          splitAt="last"
        />
        {studio.verified && <VerifiedBadge label="Verified Studio" />}

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
          {studio.specialties.map((s) => (
            <span
              key={s}
              className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink-cream/40 border border-ink-cream/10 px-3 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>

        <MetaRow>
          <MetaItem>
            {studio.location.city}, {studio.location.state}
          </MetaItem>
          <MetaHighlight>★ {formatRating(studio.rating)}</MetaHighlight>
          <MetaItem>({studio.reviewCount} Reviews)</MetaItem>
        </MetaRow>
        <BioQuote bio={studio.bio} />

        {/* CTA Row */}
        <div className="flex flex-wrap gap-2.5 mt-7 relative z-10">
          {studio.integrations?.booking ? (
            <Button as="a" href={studio.integrations.booking.bookingUrl}
              target="_blank" rel="noopener noreferrer"
              variant="ink-red" size="sm" statusDot="bg-ink-cream shadow-ink-cream-glow">
              {studio.integrations.booking.label ?? "Book Appointment"}
            </Button>
          ) : (
            <Button variant="ink-red" size="sm" statusDot="bg-ink-cream shadow-ink-cream-glow">
              Book Appointment
            </Button>
          )}
          <Button variant="ink-light-outline" size="sm">
            Call
          </Button>
          <Button variant="ink-light-outline" size="sm">
            Message
          </Button>
        </div>
      </DetailHero>

      {/* ── GALLERY ── */}
      <section className="pt-10 md:pt-14">
        <SectionLabel
          label="Gallery"
          variant="dark"
          stretch
          className="px-6 md:px-12 mb-4"
        />
        <ImageGallery images={studio.images} />
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
          {/* Reviews (unified: local + imported from Google, Yelp, Trustpilot) */}
          <ReviewPanel
            reviews={reviews}
            headingFont={bebasNeue.className}
          />

          {/* Hours & Contact */}
          <WidgetPanel variant="alt">
            <WidgetLabel label="Hours & Contact" />
            <WidgetHeading headingFont={bebasNeue.className}>
              Visit Us
            </WidgetHeading>
            <div className="space-y-0 mb-5">
              {studio.openHours &&
                Object.entries(studio.openHours).map(([day, hours]) => {
                  const isClosed = "closed" in hours && hours.closed;
                  return (
                    <div
                      key={day}
                      className="flex justify-between py-1.5 border-b border-ink-cream/[0.06] last:border-0"
                    >
                      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-cream/50">
                        {day}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.05em] text-ink-cream/35">
                        {isClosed
                          ? "Closed"
                          : `${"open" in hours ? hours.open : ""} – ${"close" in hours ? hours.close : ""}`}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="space-y-3 pt-4 border-t border-ink-cream/[0.06]">
              <div className="font-mono text-sm tracking-[0.05em] text-ink-cream/60">
                {studio.phone}
              </div>
              <div className="font-mono text-sm tracking-[0.05em] text-ink-cream/60">
                {studio.email}
              </div>
              <div className="font-mono text-xs tracking-[0.05em] text-ink-cream/40 leading-relaxed">
                {studio.location.address}
                <br />
                {studio.location.city}, {studio.location.state}{" "}
                {studio.location.zipCode}
              </div>
            </div>
          </WidgetPanel>

          {/* The Team + Social */}
          <WidgetPanel variant="dark">
            <FilmGrainOverlay className="opacity-[0.04]" />
            <WidgetLabel label="The Team" variant="sage" />
            <WidgetHeading headingFont={bebasNeue.className}>
              Our Artists
            </WidgetHeading>
            <div className="space-y-0 relative z-10">
              {studio.artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}`}
                  className="flex items-center gap-3 py-3 border-b border-ink-cream/[0.06] last:border-0 hover:bg-ink-cream/[0.03] -mx-2 px-2 rounded-lg transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative">
                    <Image
                      src={artist.profileImage}
                      alt={artist.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink-cream">
                      {artist.name}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.1em] text-ink-cream/35 uppercase">
                      {artist.specialty}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-ink-cream/20">
                    →
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 relative z-10">
              <SocialLinks links={studio.socialLinks} integrations={studio.integrations} />
            </div>
          </WidgetPanel>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <FooterCta
        heading={`Visit ${studio.name.split(" ")[0]}?`}
        subtitle={`${studio.location.address}, ${studio.location.city} · Walk-ins welcome`}
        buttonLabel={studio.integrations?.booking?.label ?? "Book an Appointment"}
        bookingUrl={studio.integrations?.booking?.bookingUrl}
        headingFont={bebasNeue.className}
      />
    </div>
  );
}
