import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { SectionLabel } from "@/components/ui/section-label";
import {
  DetailHero,
  PanelEmptyState,
  ReviewPanel,
  SocialLinks,
  FooterCta,
  VerifiedBadge,
  WidgetPanel,
  WidgetLabel,
  WidgetHeading,
  SplitName,
  BioQuote,
  MetaRow,
  MetaItem,
  MetaHighlight,
} from "@/components/detail";
import { bebasNeue, pirataOne, abrilFatface } from "@/lib/fonts";
import { formatRating } from "@/lib/utils";
import type { Review, Studio } from "@/lib/types";
import type { StudioSiteData, StudioSiteArtist } from "./studio-site-data";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface StudioProfileBasicProps {
  studio: Studio;
  data: StudioSiteData;
  reviews: Review[];
}

function RosterCard({ artist }: { artist: StudioSiteArtist }) {
  const thumb = artist.photos[0]?.url;
  const card = (
    <div className="group relative flex items-center gap-4 rounded-xl border border-ink-cream/[0.06] bg-ink-black-raised p-4 transition-all duration-300 hover:border-ink-red/30 hover:bg-ink-cream/[0.03]">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-rust/[0.12]">
        {thumb ? (
          <Image
            src={thumb}
            alt={artist.name}
            fill
            sizes="56px"
            className="object-cover saturate-[0.8] transition-[filter] duration-300 group-hover:saturate-100"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-mono text-sm text-ink-cream/40">
            {artist.initials}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink-cream">
          {artist.name}
        </div>
        {artist.styles.length > 0 ? (
          <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-ink-cream/30">
            {artist.styles.join(" · ")}
          </div>
        ) : null}
      </div>
      <span className="font-mono text-[11px] text-ink-cream/25 transition-colors group-hover:text-ink-red">
        &rarr;
      </span>
    </div>
  );
  return artist.profileHref ? (
    <Link href={artist.profileHref}>{card}</Link>
  ) : (
    card
  );
}

/**
 * Profile-style public listing — what every studio gets on the marketplace.
 * Studios that publish a custom builder site (Shader/Magnum) render
 * StudioSitePublic instead; this is the default face of /studios/[id].
 */
export function StudioProfileBasic({ studio, data, reviews }: StudioProfileBasicProps) {
  const location = [data.city, data.state].filter(Boolean).join(", ");
  const hasHours = DAY_ORDER.some((day) => data.hours[day]);
  const hasContact = Boolean(data.address || data.phone || data.email);
  const bookingUrl = data.bookingLink?.url;
  const telHref = data.phone ? `tel:${data.phone.replace(/[^+\d]/g, "")}` : undefined;

  return (
    <div className="relative min-h-screen bg-ink-black">
      <FilmGrainOverlay />

      {/* ── HERO ── */}
      <DetailHero coverImage={data.coverImage} name={data.name}>
        <div className="relative z-10 mb-3 flex items-center gap-2">
          <div className="h-px w-4 bg-ink-rust/40" />
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-rust">
            Tattoo Studio{location ? ` — ${location}` : ""}
          </span>
        </div>
        <SplitName
          name={data.name}
          primaryFont={abrilFatface.className}
          accentFont={pirataOne.className}
          splitAt="first"
        />
        {studio.verified ? <VerifiedBadge label="Verified Studio" /> : null}

        <MetaRow>
          {location ? <MetaItem>{location}</MetaItem> : null}
          {data.rating ? (
            <MetaHighlight>&#9733; {formatRating(data.rating)}</MetaHighlight>
          ) : null}
          {data.reviewCount ? (
            <MetaItem>({data.reviewCount} Reviews)</MetaItem>
          ) : null}
          {data.services.includes("walk-ins") ? (
            <MetaItem>Walk-ins Welcome</MetaItem>
          ) : null}
          {data.services.includes("piercing") ? (
            <MetaItem>Piercing</MetaItem>
          ) : null}
        </MetaRow>
        {data.bio ? <BioQuote bio={data.bio} /> : null}

        {/* Specialties */}
        {data.specialties.length > 0 ? (
          <div className="relative z-10 mt-5 flex flex-wrap gap-2">
            {data.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-ink-cream/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-cream/50"
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}

        {/* CTA Row */}
        <div className="relative z-10 mt-7 flex flex-wrap gap-2.5">
          {bookingUrl ? (
            <Button
              as="a"
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="ink-red"
              size="sm"
              statusDot="bg-ink-cream shadow-ink-cream-glow"
            >
              Book Now
            </Button>
          ) : null}
          {telHref ? (
            <Button as="a" href={telHref} variant="ink-light-outline" size="sm">
              Call the Studio
            </Button>
          ) : null}
          {data.email ? (
            <Button
              as="a"
              href={`mailto:${data.email}`}
              variant="ink-light-outline"
              size="sm"
            >
              Email
            </Button>
          ) : null}
        </div>
      </DetailHero>

      {/* ── RESIDENT ARTISTS ── */}
      {data.artists.length > 0 ? (
        <section className="pt-10 md:pt-14">
          <SectionLabel
            label="Resident Artists"
            variant="dark"
            stretch
            className="mb-4 px-6 md:px-12"
          />
          <div className="grid grid-cols-1 gap-[3px] px-6 sm:grid-cols-2 md:px-12 lg:grid-cols-3">
            {data.artists.map((artist) => (
              <RosterCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── DETAILS ROW ── */}
      <section className="pt-10 md:pt-14">
        <SectionLabel
          label="Details"
          variant="dark-muted"
          stretch
          className="mb-4 px-6 md:px-12"
        />
        <div className="grid grid-cols-1 gap-[3px] px-6 min-[960px]:grid-cols-[1.2fr_1fr_1fr] md:px-12">
          {/* Reviews */}
          <ReviewPanel reviews={reviews} headingFont={bebasNeue.className} />

          {/* Hours */}
          <WidgetPanel variant="alt">
            <WidgetLabel label="Hours" />
            <WidgetHeading headingFont={bebasNeue.className}>
              Visit Us
            </WidgetHeading>
            {hasHours ? (
              <div className="relative z-10 flex flex-col gap-2">
                {DAY_ORDER.map((day) => {
                  const h = data.hours[day];
                  if (!h) return null;
                  return (
                    <div key={day} className="flex items-center justify-between text-xs">
                      <span className="text-ink-cream/50">{day}</span>
                      <span className={h.closed ? "text-ink-cream/25" : "text-ink-cream/80"}>
                        {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <PanelEmptyState
                glyph="&#9679; &#9681; &#9675;"
                title="Hours not posted yet"
                message="This studio works by appointment — reach out to plan your visit."
              />
            )}
          </WidgetPanel>

          {/* Contact + Social */}
          <WidgetPanel variant="dark">
            <FilmGrainOverlay className="opacity-[0.04]" />
            <WidgetLabel label="Contact" variant="sage" />
            <WidgetHeading headingFont={bebasNeue.className}>
              Find Us
            </WidgetHeading>
            {hasContact ? (
              <div className="relative z-10 flex flex-col gap-2 font-mono text-[11px] tracking-[0.05em] text-ink-cream/60">
                {data.address ? <span>{data.address}</span> : null}
                {location ? (
                  <span>
                    {location}
                    {data.zipCode ? ` ${data.zipCode}` : ""}
                  </span>
                ) : null}
                {data.phone ? (
                  <a href={telHref} className="transition-colors hover:text-ink-red">
                    {data.phone}
                  </a>
                ) : null}
                {data.email ? (
                  <a
                    href={`mailto:${data.email}`}
                    className="break-all transition-colors hover:text-ink-red"
                  >
                    {data.email}
                  </a>
                ) : null}
              </div>
            ) : (
              <PanelEmptyState
                title="Contact details coming soon"
                message={
                  location
                    ? `Based in ${location} — this studio hasn't added contact info yet.`
                    : "This studio hasn't added contact info yet."
                }
              />
            )}
            <div className="relative z-10 mt-6">
              <SocialLinks
                links={studio.socialLinks ?? {}}
                integrations={studio.integrations}
              />
            </div>
          </WidgetPanel>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <FooterCta
        heading="Ready to Get Inked?"
        subtitle={
          data.services.includes("walk-ins")
            ? "Walk-ins welcome · Reach out to plan your piece"
            : "Reach out to plan your piece"
        }
        buttonLabel={bookingUrl ? "Book an Appointment" : "Get in Touch"}
        headingFont={bebasNeue.className}
        bookingUrl={bookingUrl ?? telHref ?? (data.email ? `mailto:${data.email}` : undefined)}
      />
    </div>
  );
}
