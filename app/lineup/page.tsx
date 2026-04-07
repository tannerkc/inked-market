"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { permanentMarker, bebasNeue } from "@/lib/fonts";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { SectionLabel } from "@/components/ui/section-label";
import { FlashCard } from "@/components/ui/flash-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/providers/theme-provider";
import {
  LineupTabs,
  CoverStory,
  NewsCard,
  BlastCard,
  PickRow,
  IssueCard,
} from "@/components/lineup";
import type { LineupTabValue } from "@/components/lineup";
import {
  lineupIssues,
  getCurrentIssue,
  getAllSpotlights,
  getAllEvents,
} from "@/lib/data/lineup";

export default function LineupPage() {
  const { mode, setMode } = useTheme();
  const isLight = mode === "light";
  const [activeTab, setActiveTab] = useState<LineupTabValue>("this-week");
  const [activeIssueId, setActiveIssueId] = useState<string>(
    getCurrentIssue().id
  );

  const activeIssue = useMemo(
    () => lineupIssues.find((i) => i.id === activeIssueId) ?? getCurrentIssue(),
    [activeIssueId]
  );

  const allSpotlights = getAllSpotlights();
  const allEvents = getAllEvents();
  const upcomingEvents = allEvents.filter(
    (e) => new Date(e.date) >= new Date()
  );

  const handleIssueSelect = (issueId: string) => {
    setActiveIssueId(issueId);
    setActiveTab("this-week");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "min-h-screen relative transition-colors duration-500",
        isLight
          ? "bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark text-ink-black"
          : "bg-ink-black text-ink-cream"
      )}
    >
      <FilmGrainOverlay
        className={isLight ? "opacity-[0.03]" : "opacity-[0.035]"}
      />

      {/* Red glow (dark mode only) */}
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[250px] bg-ink-red-glow-top pointer-events-none z-[1] transition-opacity duration-500",
          isLight ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Theme toggle */}
      <ThemeToggle mode={mode} onToggle={setMode} className="pt-24" />

      {/* ─── Hero ─── */}
      <div className="relative text-center pt-6 pb-10 px-4 z-[5]">
        <p
          className={cn(
            permanentMarker.className,
            "text-xs text-ink-red tracking-[0.25em] uppercase -rotate-2 inline-block"
          )}
        >
          Issue No. {String(activeIssue.number).padStart(2, "0")} ·{" "}
          {new Date(activeIssue.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1
          className={cn(
            bebasNeue.className,
            "text-6xl sm:text-7xl lg:text-8xl tracking-[0.08em] leading-none mt-2 transition-colors duration-500",
            isLight ? "text-ink-black" : "text-ink-cream"
          )}
        >
          THE LINE UP
        </h1>
        <div className="flex items-center gap-3 justify-center mt-3">
          <div
            className={cn(
              "w-12 h-px transition-colors duration-500",
              isLight ? "bg-ink-black/15" : "bg-ink-cream/20"
            )}
          />
          <span
            className={cn(
              "font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-500",
              isLight ? "text-ink-black/35" : "text-ink-cream/30"
            )}
          >
            handpicked · no algorithms · just taste
          </span>
          <div
            className={cn(
              "w-12 h-px transition-colors duration-500",
              isLight ? "bg-ink-black/15" : "bg-ink-cream/20"
            )}
          />
        </div>
        <p
          className={cn(
            "text-sm mt-3 max-w-md mx-auto leading-relaxed transition-colors duration-500",
            isLight ? "text-ink-black/45" : "text-ink-cream/40"
          )}
        >
          Your weekly tattoo briefing. Spotlights, news, events, and the artists
          we can&apos;t stop watching.
        </p>
      </div>

      {/* ─── Tabs ─── */}
      <div className="max-w-4xl mx-auto px-4 relative z-[5]">
        <LineupTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          eventCount={upcomingEvents.length}
          variant={mode}
        />
      </div>

      {/* ─── Tab Content ─── */}
      <div className="max-w-4xl mx-auto px-4 pb-20 relative z-[5]">
        {/* ── This Week ── */}
        {activeTab === "this-week" && (
          <div className="mt-8 space-y-1">
            {/* 1. Cover Story */}
            <CoverStory spotlight={activeIssue.coverStory} variant={mode} />

            {/* 2. Ink & Culture */}
            <SectionLabel
              label="Ink & Culture"
              variant={isLight ? "parchment" : "dark"}
              stretch
              className="pt-10 pb-5"
            />
            <div className="space-y-1">
              {activeIssue.news.map((article) => (
                <NewsCard key={article.slug} article={article} variant={mode} />
              ))}
            </div>

            {/* 3. On Our Radar */}
            <SectionLabel
              label="On Our Radar"
              variant={isLight ? "parchment" : "dark"}
              stretch
              className="pt-10 pb-5"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[3px]">
              {activeIssue.onOurRadar.map((profile) => (
                <FlashCard
                  key={profile.id}
                  id={profile.id}
                  type={profile.type}
                  name={profile.name}
                  image={profile.image}
                  location={profile.location}
                  specialties={profile.specialties}
                  badges={profile.badges}
                />
              ))}
            </div>

            {/* 4. Don't Miss */}
            <SectionLabel
              label="Don't Miss"
              variant={isLight ? "parchment" : "dark"}
              stretch
              className="pt-10 pb-5"
            />
            <div className="space-y-1">
              {activeIssue.events.map((event) => (
                <BlastCard key={event.id} event={event} variant={mode} />
              ))}
            </div>

            {/* 5. Studio of the Week */}
            <SectionLabel
              label="Studio of the Week"
              variant={isLight ? "parchment" : "dark"}
              stretch
              className="pt-10 pb-5"
            />
            <CoverStory
              spotlight={activeIssue.studioOfTheWeek}
              issueLabel="Studio Feature"
              variant={mode}
            />

            {/* 6. Editor's Picks */}
            <SectionLabel
              label="Editor's Picks · Artists to Watch"
              variant={isLight ? "parchment" : "dark"}
              stretch
              className="pt-10 pb-5"
            />
            <div>
              {activeIssue.editorsPicks.map((profile, i) => (
                <PickRow
                  key={profile.id}
                  profile={profile}
                  rank={i + 1}
                  variant={mode}
                />
              ))}
            </div>

            {/* 7. From the Culture */}
            <SectionLabel
              label="From the Culture"
              variant={isLight ? "parchment" : "dark"}
              stretch
              className="pt-10 pb-5"
            />
            <NewsCard article={activeIssue.cultureArticle} variant={mode} />
          </div>
        )}

        {/* ── Spotlights ── */}
        {activeTab === "spotlights" && (
          <div className="mt-8">
            <p
              className={cn(
                "font-mono text-[10px] tracking-wider uppercase mb-6 transition-colors duration-500",
                isLight ? "text-ink-black/30" : "text-ink-cream/30"
              )}
            >
              {allSpotlights.length} features across all issues
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
              {allSpotlights.map((spotlight) => (
                <Link
                  key={spotlight.slug}
                  href={`/lineup/spotlights/${spotlight.slug}`}
                  className={cn(
                    "group rounded-2xl border overflow-hidden transition-colors",
                    isLight
                      ? "border-ink-black/[0.08] hover:border-ink-black/[0.15]"
                      : "border-ink-cream/[0.06] hover:border-ink-cream/[0.12]"
                  )}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url(${spotlight.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-black/90 via-ink-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {spotlight.badges.map((badge) => (
                        <span
                          key={badge.label}
                          className={cn(
                            "px-2 py-0.5 rounded-full font-mono text-[8px] tracking-wider uppercase text-white backdrop-blur-md",
                            badge.color === "red" && "bg-ink-red/60",
                            badge.color === "rust" && "bg-ink-rust/60",
                            badge.color === "sage" && "bg-ink-sage/60"
                          )}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-mono text-[9px] text-ink-red tracking-wider uppercase mb-1">
                        {spotlight.type === "artist"
                          ? "Artist Spotlight"
                          : "Studio Spotlight"}
                      </p>
                      <p
                        className={cn(
                          bebasNeue.className,
                          "text-xl tracking-wider text-ink-cream leading-tight"
                        )}
                      >
                        {spotlight.name}
                      </p>
                      <p className="text-xs text-ink-cream/40 mt-1">
                        {spotlight.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Events ── */}
        {activeTab === "events" && (
          <div className="mt-8 space-y-3">
            {allEvents.length === 0 ? (
              <div className="text-center py-20">
                <p
                  className={cn(
                    "text-sm",
                    isLight ? "text-ink-black/30" : "text-ink-cream/30"
                  )}
                >
                  No upcoming events — follow artists and studios to get
                  notified.
                </p>
              </div>
            ) : (
              <>
                {upcomingEvents.length > 0 && (
                  <>
                    <p
                      className={cn(
                        "font-mono text-[10px] tracking-wider uppercase mb-4",
                        isLight ? "text-ink-black/30" : "text-ink-cream/30"
                      )}
                    >
                      Upcoming
                    </p>
                    {upcomingEvents.map((event) => (
                      <BlastCard
                        key={event.id}
                        event={event}
                        variant={mode}
                      />
                    ))}
                  </>
                )}
                {allEvents.filter((e) => new Date(e.date) < new Date())
                  .length > 0 && (
                  <>
                    <SectionLabel
                      label="Past Events"
                      variant={isLight ? "parchment" : "dark"}
                      stretch
                      className="pt-6 pb-3"
                    />
                    {allEvents
                      .filter((e) => new Date(e.date) < new Date())
                      .map((event) => (
                        <BlastCard
                          key={event.id}
                          event={event}
                          past
                          variant={mode}
                        />
                      ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Archive ── */}
        {activeTab === "archive" && (
          <div className="mt-8">
            <p
              className={cn(
                "font-mono text-[10px] tracking-wider uppercase mb-6",
                isLight ? "text-ink-black/30" : "text-ink-cream/30"
              )}
            >
              {lineupIssues.length} issues
            </p>
            {lineupIssues.length <= 1 ? (
              <div
                className={cn(
                  "text-center py-16 border rounded-2xl",
                  isLight
                    ? "border-ink-black/[0.08]"
                    : "border-ink-cream/[0.06]"
                )}
              >
                <p
                  className={cn(
                    bebasNeue.className,
                    "text-2xl tracking-wider",
                    isLight ? "text-ink-black/20" : "text-ink-cream/20"
                  )}
                >
                  This is the first issue!
                </p>
                <p
                  className={cn(
                    "text-sm mt-2",
                    isLight ? "text-ink-black/30" : "text-ink-cream/30"
                  )}
                >
                  Archive grows weekly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lineupIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    isActive={issue.id === activeIssueId}
                    onSelect={handleIssueSelect}
                    variant={mode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
