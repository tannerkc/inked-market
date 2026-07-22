"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { permanentMarker, bebasNeue } from "@/lib/fonts";
import { SectionLabel } from "@/components/ui/section-label";
import { FlashCard } from "@/components/ui/flash-card";
import { SampleBadge } from "@/components/ui/sample-badge";
import { ThemedPageWrapper } from "@/components/layout/themed-page-wrapper";
import {
  LineupTabs,
  CoverStory,
  NewsCard,
  BlastCard,
  PickRow,
  IssueCard,
} from "@/components/lineup";
import type { LineupTabValue } from "@/components/lineup";
import type { LineupIssue, LineupSpotlight, LineupEvent } from "@/lib/types/lineup";

export interface LineupPageContentProps {
  issue: LineupIssue;
  spotlights: LineupSpotlight[];
  events: LineupEvent[];
  /** True when rendering mock fallback data. */
  isSample?: boolean;
  /** Full issue list for the Archive tab (mock fallback supplies the back catalog). */
  issues?: LineupIssue[];
}

export function LineupPageContent({
  issue,
  spotlights,
  events,
  isSample = false,
  issues,
}: LineupPageContentProps) {
  // Archive/switcher source: provided list, else just the current issue.
  const allIssues = useMemo(() => issues ?? [issue], [issues, issue]);

  const [activeTab, setActiveTab] = useState<LineupTabValue>("this-week");
  const [activeIssueId, setActiveIssueId] = useState<string>(issue.id);

  const activeIssue = useMemo(
    () => allIssues.find((i) => i.id === activeIssueId) ?? issue,
    [allIssues, activeIssueId, issue]
  );

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());

  const handleIssueSelect = (issueId: string) => {
    setActiveIssueId(issueId);
    setActiveTab("this-week");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemedPageWrapper withTextColor>
      {/* Hero */}
      <div className="relative text-center pt-6 pb-10 px-4 z-[5]">
        {isSample && (
          <div className="mb-3">
            <SampleBadge label="Sample Issue" />
          </div>
        )}
        <p className={cn(permanentMarker.className, "text-xs text-ink-red tracking-[0.25em] uppercase -rotate-2 inline-block")}>
          Issue No. {String(activeIssue.number).padStart(2, "0")} ·{" "}
          {new Date(activeIssue.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className={`${bebasNeue.className} text-6xl sm:text-7xl lg:text-8xl tracking-[0.08em] leading-none mt-2 transition-colors duration-500 text-ink-black dark:text-ink-cream`}>
          THE LINE UP
        </h1>
        <div className="flex items-center gap-3 justify-center mt-3">
          <div className="w-12 h-px transition-colors duration-500 bg-ink-black/15 dark:bg-ink-cream/20" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-500 text-ink-black/35 dark:text-ink-cream/30">
            handpicked · no algorithms · just taste
          </span>
          <div className="w-12 h-px transition-colors duration-500 bg-ink-black/15 dark:bg-ink-cream/20" />
        </div>
        <p className="text-sm mt-3 max-w-md mx-auto leading-relaxed transition-colors duration-500 text-ink-black/45 dark:text-ink-cream/40">
          Your weekly tattoo briefing. Spotlights, news, events, and the artists
          we can&apos;t stop watching.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 relative z-[5]">
        <LineupTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          eventCount={upcomingEvents.length}
        />
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20 relative z-[5]">
        {/* This Week */}
        {activeTab === "this-week" && (
          <div className="mt-8 space-y-1">
            <CoverStory spotlight={activeIssue.coverStory} />

            <SectionLabel label="Ink & Culture" variant="muted" stretch className="pt-10 pb-5" />
            <div className="space-y-1">
              {activeIssue.news.map((article) => (
                <NewsCard key={article.slug} article={article} />
              ))}
            </div>

            <SectionLabel label="On Our Radar" variant="muted" stretch className="pt-10 pb-5" />
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

            <SectionLabel label="Don't Miss" variant="muted" stretch className="pt-10 pb-5" />
            <div className="space-y-1">
              {activeIssue.events.map((event) => (
                <BlastCard key={event.id} event={event} />
              ))}
            </div>

            <SectionLabel label="Studio of the Week" variant="muted" stretch className="pt-10 pb-5" />
            <CoverStory
              spotlight={activeIssue.studioOfTheWeek}
              issueLabel="Studio Feature"
            />

            <SectionLabel label="Editor's Picks · Artists to Watch" variant="muted" stretch className="pt-10 pb-5" />
            <div>
              {activeIssue.editorsPicks.map((profile, i) => (
                <PickRow
                  key={profile.id}
                  profile={profile}
                  rank={i + 1}
                />
              ))}
            </div>

            <SectionLabel label="From the Culture" variant="muted" stretch className="pt-10 pb-5" />
            <NewsCard article={activeIssue.cultureArticle} />
          </div>
        )}

        {/* Spotlights */}
        {activeTab === "spotlights" && (
          <div className="mt-8">
            <p className="font-mono text-[10px] tracking-wider uppercase mb-6 transition-colors duration-500 text-ink-black/30 dark:text-ink-cream/30">
              {spotlights.length} features across all issues
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]">
              {spotlights.map((spotlight) => (
                <Link
                  key={spotlight.slug}
                  href={`/lineup/spotlights/${spotlight.slug}`}
                  className="group rounded-2xl border overflow-hidden transition-colors border-ink-black/[0.08] hover:border-ink-black/[0.15] dark:border-ink-cream/[0.06] dark:hover:border-ink-cream/[0.12]"
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
                        {spotlight.type === "artist" ? "Artist Spotlight" : "Studio Spotlight"}
                      </p>
                      <p className={`${bebasNeue.className} text-xl tracking-wider text-ink-cream leading-tight`}>
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

        {/* Events */}
        {activeTab === "events" && (
          <div className="mt-8 space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm text-ink-black/30 dark:text-ink-cream/30">
                  No upcoming events — follow artists and studios to get notified.
                </p>
              </div>
            ) : (
              <>
                {upcomingEvents.length > 0 && (
                  <>
                    <p className="font-mono text-[10px] tracking-wider uppercase mb-4 text-ink-black/30 dark:text-ink-cream/30">
                      Upcoming
                    </p>
                    {upcomingEvents.map((event) => (
                      <BlastCard key={event.id} event={event} />
                    ))}
                  </>
                )}
                {events.filter((e) => new Date(e.date) < new Date()).length > 0 && (
                  <>
                    <SectionLabel label="Past Events" variant="muted" stretch className="pt-6 pb-3" />
                    {events
                      .filter((e) => new Date(e.date) < new Date())
                      .map((event) => (
                        <BlastCard key={event.id} event={event} past />
                      ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Archive */}
        {activeTab === "archive" && (
          <div className="mt-8">
            <p className="font-mono text-[10px] tracking-wider uppercase mb-6 text-ink-black/30 dark:text-ink-cream/30">
              {allIssues.length} issues
            </p>
            {allIssues.length <= 1 ? (
              <div className="text-center py-16 border rounded-2xl border-ink-black/[0.08] dark:border-ink-cream/[0.06]">
                <p className={`${bebasNeue.className} text-2xl tracking-wider text-ink-black/20 dark:text-ink-cream/20`}>
                  This is the first issue!
                </p>
                <p className="text-sm mt-2 text-ink-black/30 dark:text-ink-cream/30">
                  Archive grows weekly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allIssues.map((iss) => (
                  <IssueCard
                    key={iss.id}
                    issue={iss}
                    isActive={iss.id === activeIssueId}
                    onSelect={handleIssueSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ThemedPageWrapper>
  );
}
