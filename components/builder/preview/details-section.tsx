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

const MOCK_ARTISTS = [
  { name: "Alex Rivera", specialty: "Traditional & Neo-Trad" },
  { name: "Jordan Chen", specialty: "Realism & Portraiture" },
  { name: "Sam Okafor", specialty: "Blackwork & Geometric" },
];


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
            <div className="text-xs" style={{ color: "#f59e0b" }}>
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
              <span className="text-[10px]" style={{ color: "#f59e0b" }}>
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
        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
          {MOCK_REVIEWS.map((review, i) => (
            <div key={i} className="py-4 first:pt-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {review.author}
                </span>
                <span className="text-xs text-amber-500">
                  {"★".repeat(review.stars)}
                  <span className="opacity-25">{"★".repeat(5 - review.stars)}</span>
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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

function TeamWidget() {
  return (
    <div
      data-builder-card-lg
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
              <TeamWidget />
            </div>
          ) : (
            <TeamWidget />
          )}
        </div>
      </div>
    </section>
  );
}
