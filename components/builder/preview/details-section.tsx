"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import type { StudioData } from "@/lib/repositories";

const MOCK_REVIEWS = [
  { author: "Megan R.", stars: 5, text: "Jake did an incredible traditional rose sleeve on me. The line work is perfect and healed beautifully." },
  { author: "Daniel S.", stars: 5, text: "Sarah's fine line work is unmatched. Got a botanical piece on my forearm — exactly what I envisioned." },
  { author: "Priya K.", stars: 4, text: "Amazing work overall. Marcus did a gorgeous Japanese sleeve start and I'll definitely be back." },
  { author: "Chris M.", stars: 5, text: "Lin's geometric sleeve is stunning. The precision is unreal. Worth every penny and the wait time." },
  { author: "Alicia T.", stars: 5, text: "Second session with Marcus — the Japanese koi piece is coming along beautifully. Super professional studio." },
  { author: "James L.", stars: 4, text: "Great experience. Parking can be tricky on weekends but the work speaks for itself." },
  { author: "Taylor B.", stars: 5, text: "Sarah did a fine line botanical sleeve that turned out better than I imagined. Booked for the next one." },
  { author: "Jordan M.", stars: 5, text: "Third time here — Jake's color work is on another level. The studio is always clean and welcoming." },
];

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Booking widget data ─────────────────────────────────────────────────────

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


function ReviewsWidget() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const VISIBLE_COUNT = 3;
  const visibleReviews = MOCK_REVIEWS.slice(0, VISIBLE_COUNT);
  const totalCount = MOCK_REVIEWS.length;

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
            4.9
          </span>
          <div>
            <div className="text-xs text-amber-500">
              {"★".repeat(5)}
            </div>
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
              <span className="text-[10px] text-amber-500">
                {"★".repeat(review.stars)}
                <span style={{ opacity: 0.25 }}>
                  {"★".repeat(5 - review.stars)}
                </span>
              </span>
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
        title={`${totalCount} Verified Reviews · 4.9 avg`}
      >
        <div className="flex flex-col">
          {MOCK_REVIEWS.map((review, i) => (
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
                <span className="text-xs text-amber-500">
                  {"★".repeat(review.stars)}
                  <span className="opacity-25">{"★".repeat(5 - review.stars)}</span>
                </span>
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

function HoursWidget({ hoursData }: { hoursData: StudioData['hours'] }) {
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
    </div>
  );
}

function BookingWidget() {
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
      {selectedDate && (
        <div
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
            {availableSlots.length === 0 && (
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                No openings this day
              </p>
            )}
          </div>
        </div>
      )}

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
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const { detailsLayout } = config;

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
          <ReviewsWidget />
          <HoursWidget hoursData={data?.hours ?? {}} />
          {detailsLayout === "two-one" ? (
            <div className="@md:col-span-2">
              <BookingWidget />
            </div>
          ) : (
            <BookingWidget />
          )}
        </div>
      </div>
    </section>
  );
}
