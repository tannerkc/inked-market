"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStudioSite } from "@/components/studio-site/studio-site-context";
import { PromptChip } from "@/components/studio-site/empty-states";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { StarRating } from "@/components/ui/star-rating";
import { telHref, mailtoHref } from "@/lib/utils/external-links";
import type { ReviewProfileLink } from "@/lib/utils/studio-content";
import type { StudioSiteData, StudioSiteReview } from "@/components/studio-site/studio-site-data";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Booking widget data ─────────────────────────────────────────────────────
// ponytail: booking demo only — themed placeholder calendar, not wired to real
// availability. Swap for a real booking backend adapter when one exists.

const BOOKING_ARTISTS = [
  { id: "any",    label: "Any",    initials: null,  availDays: [1,2,3,4,5,6] },
  { id: "jake",   label: "Jake",   initials: "JM",  availDays: [2,4,6] },   // Tue Thu Sat
  { id: "sarah",  label: "Sarah",  initials: "SC",  availDays: [1,3,5] },   // Mon Wed Fri
  { id: "marcus", label: "Marcus", initials: "MR",  availDays: [3,5,6] },   // Wed Fri Sat
] as const;

const TIME_SLOTS = ["10am","11am","12pm","2pm","3pm","4pm","5pm"];

// Deterministic "booked" slots per date+artist so mock data feels real
function getBookedSlots(date: number, artistId: string): string[] {
  const seed = (date * 7 + artistId.charCodeAt(0)) % 11;
  return TIME_SLOTS.filter((_, i) => (i + seed) % 4 === 0);
}

// April 2026 calendar constants (today = April 9 per session context)
const CAL_MONTH    = "April 2026";
const CAL_FIRST_DOW = 3;   // April 1 = Wednesday (0=Sun)
const CAL_DAYS      = 30;
const CAL_TODAY     = 9;


/** Outbound links to the studio's profiles on connected review platforms. */
function ReviewPlatformLinks({
  links,
  centered,
}: {
  links: ReviewProfileLink[];
  centered?: boolean;
}) {
  if (links.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", centered && "justify-center")}>
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border px-2.5 py-1 text-[10px] font-medium transition-opacity hover:opacity-75"
          style={{ borderColor: "var(--widget-border)", color: "var(--text-secondary)" }}
        >
          Reviews on {link.name}
        </a>
      ))}
    </div>
  );
}

function ReviewsWidget({
  reviews,
  ratingAverage,
  reviewCount,
  reviewLinks,
}: {
  reviews: StudioSiteReview[];
  ratingAverage: string;
  reviewCount: number;
  reviewLinks: ReviewProfileLink[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const VISIBLE_COUNT = 3;
  const visibleReviews = reviews.slice(0, VISIBLE_COUNT);
  const totalCount = reviewCount || reviews.length;

  // Real-world empty state — shown identically on the live site (earned data
  // can't be typed in; it arrives as verified clients leave reviews).
  if (reviews.length === 0) {
    return (
      <div
        className="flex h-full flex-col rounded-[var(--border-radius-lg)] overflow-hidden"
        data-builder-card-lg
        style={{ background: "var(--widget-1)" }}
      >
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div
            className="text-[9px] font-bold tracking-[0.12em] uppercase"
            style={{ color: "var(--widget-label)" }}
          >
            What clients say
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-6 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" style={{ color: "var(--text-muted)" }}>
            <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11 5.52.44a.56.56 0 0 1 .32.99l-4.2 3.6 1.28 5.39a.56.56 0 0 1-.84.61L12 16.73l-4.73 2.9a.56.56 0 0 1-.84-.6l1.29-5.4-4.21-3.6a.56.56 0 0 1 .32-.98l5.52-.44 2.13-5.12Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            No reviews yet &mdash; verified client reviews appear here.
          </p>
          <ReviewPlatformLinks links={reviewLinks} centered />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col gap-0 rounded-[var(--border-radius-lg)] overflow-hidden"
      data-builder-card-lg
    >
      <div
        className="px-4 pt-4 pb-2 shrink-0"
        style={{ background: "var(--widget-1)" }}
      >
        <div
          className="text-[9px] font-bold tracking-[0.12em] uppercase mb-2"
          style={{ color: "var(--widget-label)" }}
        >
          What clients say
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--text-primary)", fontFamily: "var(--heading-font)" }}
          >
            {ratingAverage}
          </span>
          <div>
            <StarRating rating={5} variant="glyph" className="block text-xs text-amber-500" />
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {totalCount} verified reviews
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col gap-2 px-3 py-3 flex-1"
        style={{ background: "var(--widget-1)" }}
      >
        {visibleReviews.map((review, i) => (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{ background: "var(--bg-raised)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {review.author}
              </span>
              <StarRating rating={review.stars} variant="glyph" className="text-[10px] text-amber-500" />
            </div>
            <p
              className="text-[11px] leading-relaxed line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {review.text}
            </p>
          </div>
        ))}
      </div>
      {reviewLinks.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 pb-3 shrink-0"
          style={{ background: "var(--widget-1)" }}
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--widget-label)" }}
          >
            Also on
          </span>
          {reviewLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              {link.name}
            </a>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex items-center justify-between px-4 py-3 border-t transition-colors shrink-0"
        style={{
          background: "var(--widget-1)",
          borderColor: "var(--widget-border)",
          color: "var(--accent)",
        }}
      >
        <span className="text-[11px] font-medium">
          See all {totalCount} reviews
        </span>
        <span className="text-[12px]">↑</span>
      </button>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`${totalCount} Verified Reviews · ${ratingAverage} avg`}
        className="[--bg-raised:transparent] [--bg-sunken:rgba(255,255,255,0.1)] [--text-muted:#ffffff] [--text-secondary:#ffffff] [--border:rgba(255,255,255,0.1)]"
      >
        {reviewLinks.some((link) => link.writeReviewUrl) ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {reviewLinks
              .filter((link) => link.writeReviewUrl)
              .map((link) => (
                <a
                  key={link.platform}
                  href={link.writeReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:border-white/50"
                >
                  Write a review on {link.name}
                </a>
              ))}
          </div>
        ) : null}
        <div className="flex flex-col">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="py-4 first:pt-0"
              style={i > 0 ? { borderTop: "1px solid var(--border)" } : undefined}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {review.author}
                </span>
                <StarRating rating={review.stars} variant="glyph" className="text-xs text-amber-500" />
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function HoursWidget({
  hoursData,
  contact,
}: {
  hoursData: StudioSiteData["hours"];
  contact: { phone?: string; email?: string };
}) {
  const hasHoursData = Object.keys(hoursData ?? {}).length > 0;
  return (
    <div
      data-builder-card-lg
      className="flex h-full flex-col gap-5 rounded-xl border p-6"
      style={{ backgroundColor: "var(--widget-2)", borderColor: "var(--widget-border)" }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--widget-label)" }}
      >
        Hours & Contact
      </p>
      <h3
        className="text-lg font-bold uppercase tracking-tight"
        style={{
          fontFamily: "var(--heading-font)",
          color: "var(--text-primary)",
        }}
      >
        VISIT US
      </h3>
      {hasHoursData ? (
        <div className="flex flex-col gap-2">
          {DAY_ORDER.map((day) => {
            const h = hoursData[day];
            if (!h) return null;
            const timeLabel = h.closed ? "Closed" : `${h.open} \u2013 ${h.close}`;
            return (
              <div
                key={day}
                className="flex items-center justify-between text-xs"
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {day}
                </span>
                <span
                  style={{
                    color: h.closed ? "var(--text-muted)" : "var(--text-primary)",
                  }}
                >
                  {timeLabel}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-start gap-3">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            By appointment &mdash; contact us.
          </p>
          {contact.phone || contact.email ? (
            <div className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              {contact.phone ? <span>{contact.phone}</span> : null}
              {contact.email ? <span>{contact.email}</span> : null}
            </div>
          ) : null}
          <PromptChip group="contact-hours" label="Set hours" />
        </div>
      )}
    </div>
  );
}

/** Live-mode booking: an embedded scheduler when the platform officially
 * supports iframing (Calendly/Acuity), a real link-out otherwise, or an
 * honest contact-to-book card assembled from real contact methods. */
function BookingCard({ data }: { data: StudioSiteData }) {
  const link = data.bookingLink;
  const embed = data.bookingEmbed;
  const [embedOpen, setEmbedOpen] = useState(false);

  return (
    <div
      data-builder-card-lg
      className="flex h-full flex-col justify-between gap-5 rounded-xl border p-6"
      style={{ backgroundColor: "var(--widget-3)", borderColor: "var(--widget-border)" }}
    >
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--widget-label)" }}
        >
          Booking
        </p>
        <h3
          className="mt-3 text-lg font-bold uppercase tracking-tight"
          style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}
        >
          {link ? "Book a Session" : "Contact to Book"}
        </h3>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {link
            ? `Appointments are scheduled through ${link.platformName}.`
            : "Reach out and we\u2019ll set up your appointment."}
        </p>
      </div>

      {link && embed ? (
        <>
          <button
            type="button"
            onClick={() => setEmbedOpen(true)}
            className="w-full rounded-lg py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            Book on {link.platformName}
          </button>
          <BottomSheet
            open={embedOpen}
            onClose={() => setEmbedOpen(false)}
            title={`Book a Session · ${embed.platformName}`}
          >
            <iframe
              src={embed.src}
              title={`${embed.platformName} booking`}
              loading="lazy"
              className="w-full rounded-lg"
              style={{ height: "min(680px, 72vh)", border: 0, background: "var(--bg-raised)" }}
            />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-xs hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Open {embed.platformName} in a new tab
            </a>
          </BottomSheet>
        </>
      ) : link ? (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          Book on {link.platformName}
        </a>
      ) : (
        <div className="flex flex-col gap-2">
          {data.phone ? (
            <a
              href={telHref(data.phone)}
              className="text-sm hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {data.phone}
            </a>
          ) : null}
          {data.email ? (
            <a
              href={mailtoHref(data.email)}
              className="text-sm hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {data.email}
            </a>
          ) : null}
          {data.instagram ? (
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {data.instagram.startsWith("@") ? data.instagram : `@${data.instagram}`}
            </span>
          ) : null}
          {!data.phone && !data.email ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Add contact details so clients can reach you.
            </p>
          ) : null}
          <div className="mt-1">
            <PromptChip group="booking" label="Add booking link" />
          </div>
        </div>
      )}
    </div>
  );
}

/** Sample-mode-only demo: a themed placeholder calendar so studios can see how
 * an embedded booking flow could look. Never rendered with live data. */
function SampleBookingDemo() {
  const [artistId, setArtistId] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const artist = BOOKING_ARTISTS.find((a) => a.id === artistId) ?? BOOKING_ARTISTS[0];

  // When artist changes, reset date and time selections
  const handleArtistChange = (id: string) => {
    setArtistId(id);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day === selectedDate ? null : day);
    setSelectedTime(null);
  };

  const bookedSlots = selectedDate ? getBookedSlots(selectedDate, artistId) : [];
  const availableSlots = selectedDate
    ? TIME_SLOTS.filter((t) => !bookedSlots.includes(t))
    : [];

  // Build calendar cells: empty prefix + day cells
  const cells: Array<{ day: number } | null> = [
    ...Array(CAL_FIRST_DOW).fill(null),
    ...Array.from({ length: CAL_DAYS }, (_, i) => ({ day: i + 1 })),
  ];
  // Pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const isDayAvailable = (day: number) => {
    if (day < CAL_TODAY) return false;
    const date = new Date(2026, 3, day); // April = month 3
    const dow = date.getDay(); // 0=Sun
    return (artist.availDays as readonly number[]).includes(dow);
  };

  return (
    <div
      data-builder-card-lg
      className="@container flex h-full flex-col rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--widget-3)", borderColor: "var(--widget-border)" }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: "var(--widget-border)" }}
      >
        <div className="min-w-0">
          <h3
            className="text-base @[260px]:text-lg font-bold uppercase tracking-tight leading-none truncate"
            style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}
          >
            Book a Session
          </h3>
          <p className="text-[11px] @[260px]:text-[12px] font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
            {CAL_MONTH}
          </p>
        </div>
        {/* Calendar icon — hidden when card is too narrow */}
        <div
          className="hidden @[260px]:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ml-3"
          style={{ background: "var(--accent-bg)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--accent)" }}>
            <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* ── Artist selector ────────────────────────────────── */}
      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--widget-border)" }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-muted)" }}>
          Artist
        </p>
        {/* Styled select wrapper */}
        <div className="relative">
          {/* Person icon */}
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)" }}>
              <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M1.5 12.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <select
            value={artistId}
            onChange={(e) => handleArtistChange(e.target.value)}
            className="w-full rounded-lg border pl-8 pr-8 py-2.5 text-[11px] font-medium appearance-none cursor-pointer transition-colors focus:outline-none"
            style={{
              background: "var(--bg-raised)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {BOOKING_ARTISTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id === "any" ? "Any Available Artist" : a.label}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "var(--text-muted)" }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Calendar ───────────────────────────────────────── */}
      <div className="px-5 py-4 shrink-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1.5">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
            <div
              key={i}
              className="text-center text-[8px] font-bold uppercase tracking-wide py-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;
            const { day } = cell;
            const isToday = day === CAL_TODAY;
            const isPast = day < CAL_TODAY;
            const avail = isDayAvailable(day);
            const isSelected = day === selectedDate;

            let cellStyle: React.CSSProperties = {};
            let cellClass = "aspect-square flex items-center justify-center rounded-md text-[10px] font-medium transition-all";

            if (isSelected) {
              cellStyle = { background: "var(--accent)", color: "var(--accent-text)" };
              cellClass += " cursor-pointer shadow-sm";
            } else if (isToday && avail) {
              cellStyle = { background: "var(--accent-bg)", color: "var(--accent)" };
              cellClass += " cursor-pointer font-bold";
            } else if (isPast || !avail) {
              cellStyle = { color: "var(--text-muted)", opacity: 0.3 };
              cellClass += " cursor-default";
            } else {
              cellStyle = { color: "var(--text-secondary)" };
              cellClass += " cursor-pointer hover:bg-[var(--bg-raised)] hover:font-semibold";
            }

            return (
              <button
                key={day}
                type="button"
                disabled={isPast || !avail}
                onClick={() => avail && !isPast && handleDateSelect(day)}
                className={cellClass}
                style={cellStyle}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Time slots ─────────────────────────────────────── */}
      {selectedDate ? <div
          className="px-5 py-4 border-t shrink-0"
          style={{ borderColor: "var(--widget-border)" }}
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-2.5" style={{ color: "var(--text-muted)" }}>
            Available Times — Apr {selectedDate}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableSlots.map((time) => {
              const active = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(active ? null : time)}
                  className="rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all border"
                  style={
                    active
                      ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-text)" }
                      : { background: "var(--bg-raised)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                  }
                >
                  {time}
                </button>
              );
            })}
            {availableSlots.length === 0 ? <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                No openings this day
              </p> : null}
          </div>
        </div> : null}

      {/* ── CTA ────────────────────────────────────────────── */}
      <div
        className="mt-auto px-5 py-4 border-t shrink-0"
        style={{ borderColor: "var(--widget-border)" }}
      >
        <button
          type="button"
          disabled={!selectedDate || !selectedTime}
          className={cn(
            "w-full rounded-lg py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-all",
            !selectedDate || !selectedTime ? "cursor-not-allowed" : ""
          )}
          style={
            selectedDate && selectedTime
              ? { background: "var(--accent)", color: "var(--accent-text)" }
              : { background: "var(--bg-raised)", color: "var(--text-muted)", opacity: 0.5 }
          }
        >
          {selectedDate && selectedTime
            ? `Request ${selectedTime} · Apr ${selectedDate}`
            : "Select a Date & Time"}
        </button>
      </div>
    </div>
  );
}

const LAYOUT_CLASSES = {
  "three-col": "grid grid-cols-1 gap-[3px] @md:grid-cols-[1.2fr_1fr_1fr]",
  "two-one": "grid grid-cols-1 gap-[3px] @md:grid-cols-[1.5fr_1fr]",
  stacked: "mx-auto flex max-w-3xl flex-col gap-[3px]",
} as const;

export function DetailsSection({ className }: { className?: string }) {
  const { config, data } = useStudioSite();
  const { detailsLayout } = config;
  const reviews = data.reviews;

  return (
    <section
      className={cn(
        "w-full transition-all duration-500 ease-in-out",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-[1350px] px-6 py-12 @lg:px-10">
        <div className={LAYOUT_CLASSES[detailsLayout]}>
          <ReviewsWidget
            reviews={reviews}
            ratingAverage={data.ratingAverage ?? ""}
            reviewCount={data.reviewCount ?? reviews.length}
            reviewLinks={data.reviewLinks}
          />
          <HoursWidget hoursData={data.hours} contact={{ phone: data.phone, email: data.email }} />
          {data.isSample ? (
            detailsLayout === "two-one" ? (
              <div className="@md:col-span-2"><SampleBookingDemo /></div>
            ) : (
              <SampleBookingDemo />
            )
          ) : detailsLayout === "two-one" ? (
            <div className="@md:col-span-2"><BookingCard data={data} /></div>
          ) : (
            <BookingCard data={data} />
          )}
        </div>
      </div>
    </section>
  );
}
