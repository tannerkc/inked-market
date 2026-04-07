"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";

const MOCK_REVIEWS = [
  {
    author: "Sarah M.",
    stars: 5,
    text: "Absolutely incredible work. The detail in my sleeve is beyond what I imagined.",
  },
  {
    author: "Jake T.",
    stars: 5,
    text: "Clean lines, great communication, and a welcoming atmosphere. Highly recommend.",
  },
  {
    author: "Mia R.",
    stars: 4,
    text: "Beautiful realism piece. Took their time to get every detail right.",
  },
];

const HOURS = [
  { day: "Monday", time: "11:00 AM – 8:00 PM" },
  { day: "Tuesday", time: "11:00 AM – 8:00 PM" },
  { day: "Wednesday", time: "11:00 AM – 8:00 PM" },
  { day: "Thursday", time: "11:00 AM – 9:00 PM" },
  { day: "Friday", time: "11:00 AM – 9:00 PM" },
  { day: "Saturday", time: "10:00 AM – 6:00 PM" },
  { day: "Sunday", time: "Closed" },
];

const MOCK_ARTISTS = [
  { name: "Alex Rivera", specialty: "Traditional & Neo-Trad" },
  { name: "Jordan Chen", specialty: "Realism & Portraiture" },
  { name: "Sam Okafor", specialty: "Blackwork & Geometric" },
];

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-xs" style={{ color: "var(--accent)" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "opacity-100" : "opacity-30"}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

function ReviewsWidget() {
  return (
    <div
      className="flex h-full flex-col gap-5 rounded-xl border p-6"
      style={{ backgroundColor: "var(--widget-1)", borderColor: "var(--widget-border)" }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--widget-label)" }}
      >
        Reviews — 4.9 Average
      </p>
      <h3
        className="text-lg font-bold uppercase tracking-tight"
        style={{
          fontFamily: "var(--heading-font)",
          color: "var(--text-primary)",
        }}
      >
        WHAT CLIENTS SAY
      </h3>
      <div className="flex flex-col gap-4">
        {MOCK_REVIEWS.map((review) => (
          <div
            key={review.author}
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-raised)" }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {review.author}
              </span>
              <StarRating count={review.stars} />
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoursWidget() {
  return (
    <div
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
        {HOURS.map((entry) => (
          <div
            key={entry.day}
            className="flex items-center justify-between text-xs"
          >
            <span style={{ color: "var(--text-secondary)" }}>
              {entry.day}
            </span>
            <span
              style={{
                color:
                  entry.time === "Closed"
                    ? "var(--text-muted)"
                    : "var(--text-primary)",
              }}
            >
              {entry.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamWidget() {
  return (
    <div
      className="flex h-full flex-col gap-5 rounded-xl border p-6"
      style={{ backgroundColor: "var(--widget-3)", borderColor: "var(--widget-border)" }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--widget-label)" }}
      >
        The Team
      </p>
      <h3
        className="text-lg font-bold uppercase tracking-tight"
        style={{
          fontFamily: "var(--heading-font)",
          color: "var(--text-primary)",
        }}
      >
        OUR ARTISTS
      </h3>
      <div className="flex flex-col gap-4">
        {MOCK_ARTISTS.map((artist) => (
          <div key={artist.name} className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: "var(--accent-bg)",
                color: "var(--accent)",
              }}
            >
              {artist.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {artist.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {artist.specialty}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LAYOUT_CLASSES = {
  "three-col": "grid grid-cols-1 gap-[3px] md:grid-cols-[1.2fr_1fr_1fr]",
  "two-one": "grid grid-cols-1 gap-[3px] md:grid-cols-[1.5fr_1fr]",
  stacked: "mx-auto flex max-w-3xl flex-col gap-[3px]",
} as const;

export function DetailsSection({ className }: { className?: string }) {
  const { config } = useBuilder();
  const { detailsLayout } = config;

  return (
    <section
      className={cn(
        "w-full px-6 py-12 transition-all duration-500 ease-in-out lg:px-10",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className={LAYOUT_CLASSES[detailsLayout]}>
        <ReviewsWidget />
        <HoursWidget />
        {detailsLayout === "two-one" ? (
          <div className="md:col-span-2">
            <TeamWidget />
          </div>
        ) : (
          <TeamWidget />
        )}
      </div>
    </section>
  );
}
