"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { TagStyle } from "@/lib/types/builder";

const TAG_STYLES = {
  pill: "rounded-full",
  square: "rounded",
  outline: "rounded-full border bg-transparent",
} as const;

const SPECIALTIES = ["Blackwork", "Fine Line", "Realism", "Neo-Traditional"];

function SpecialtiesBlock({
  tagStyle,
  centered,
}: {
  tagStyle: TagStyle;
  centered?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "var(--accent)" }}
      >
        Specialties
      </p>
      <div
        className={cn("flex flex-wrap gap-1.5", centered && "justify-center")}
      >
        {SPECIALTIES.map((tag) => (
          <span
            key={tag}
            className={cn(
              "px-2.5 py-0.5 text-[11px] font-medium",
              TAG_STYLES[tagStyle],
            )}
            style={{
              backgroundColor:
                tagStyle === "outline" ? "transparent" : "var(--tag-bg)",
              color: "var(--tag-text)",
              borderColor:
                tagStyle === "outline" ? "var(--tag-text)" : undefined,
              borderWidth: tagStyle === "outline" ? "1px" : undefined,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudioDetailsBlock() {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "var(--accent)" }}
      >
        Studio Details
      </p>
      <ul
        className="space-y-1.5 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <li>Walk-ins welcome</li>
        <li>Private consultation rooms</li>
        <li>Free on-site parking</li>
      </ul>
    </div>
  );
}

function StoryBlock({ centered }: { centered?: boolean }) {
  return (
    <div className={cn(centered && "text-center")}>
      <h2
        className="mb-4 text-2xl font-bold leading-tight sm:text-3xl"
        style={{
          fontFamily: "var(--heading-font)",
          color: "var(--text-primary)",
        }}
      >
        Our Story
      </h2>
      <p
        className={cn(
          "text-sm leading-relaxed",
          centered && "mx-auto max-w-xl",
        )}
        style={{ color: "var(--text-secondary)" }}
      >
        Founded with a passion for exceptional tattoo art, our studio is a space
        where creativity meets craftsmanship. Every piece we create is a
        collaboration between artist and client, designed to last a lifetime.
      </p>
      {!centered && (
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          We believe tattoos should be as unique as the people who wear them.
          From first sketch to final session, we&apos;re dedicated to bringing
          your vision to life.
        </p>
      )}
    </div>
  );
}

export function AboutSection({ className }: { className?: string }) {
  const { config } = useBuilder();
  const { aboutLayout, showSpecialties, showStudioDetails, tagStyle } = config;

  const hasSpecialties = showSpecialties !== false;
  const hasDetails = showStudioDetails !== false;

  // About = none: render standalone content blocks if any are toggled on
  if (aboutLayout === "none") {
    if (!hasSpecialties && !hasDetails) return null;

    return (
      <section
        className={cn(
          "w-full px-6 py-8 transition-all duration-500 ease-in-out lg:px-10",
          className,
        )}
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          {hasSpecialties && (
            <div className="flex-1">
              <SpecialtiesBlock tagStyle={tagStyle} />
            </div>
          )}
          {hasDetails && (
            <div className="flex-1">
              <StudioDetailsBlock />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "w-full px-6 py-12 transition-all duration-500 ease-in-out lg:px-10",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {aboutLayout === "split" && (
        <SplitAbout
          tagStyle={tagStyle}
          showSpecialties={hasSpecialties}
          showDetails={hasDetails}
        />
      )}
      {aboutLayout === "full-width" && (
        <FullWidthAbout
          tagStyle={tagStyle}
          showSpecialties={hasSpecialties}
          showDetails={hasDetails}
        />
      )}
    </section>
  );
}

function SplitAbout({
  tagStyle,
  showSpecialties,
  showDetails,
}: {
  tagStyle: TagStyle;
  showSpecialties: boolean;
  showDetails: boolean;
}) {
  const hasRightColumn = showSpecialties || showDetails;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8",
        hasRightColumn && "sm:grid-cols-2",
      )}
    >
      <div>
        <StoryBlock />
      </div>

      {hasRightColumn && (
        <div className="space-y-5">
          {showSpecialties && <SpecialtiesBlock tagStyle={tagStyle} />}
          {showDetails && <StudioDetailsBlock />}
        </div>
      )}
    </div>
  );
}

function FullWidthAbout({
  tagStyle,
  showSpecialties,
  showDetails,
}: {
  tagStyle: TagStyle;
  showSpecialties: boolean;
  showDetails: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <StoryBlock centered />

      {showSpecialties && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SPECIALTIES.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-3 py-1 text-xs font-medium",
                TAG_STYLES[tagStyle],
              )}
              style={{
                backgroundColor:
                  tagStyle === "outline" ? "transparent" : "var(--tag-bg)",
                color: "var(--tag-text)",
                borderColor:
                  tagStyle === "outline" ? "var(--tag-text)" : undefined,
                borderWidth: tagStyle === "outline" ? "1px" : undefined,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {showDetails && (
        <div
          className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-6 text-center"
        >
          <div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }}>
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Walk-ins Welcome</p>
          </div>
          <div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Private Rooms</p>
          </div>
          <div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Free Parking</p>
          </div>
        </div>
      )}
    </div>
  );
}
