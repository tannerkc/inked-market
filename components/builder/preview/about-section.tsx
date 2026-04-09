"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { TagStyle } from "@/lib/types/builder";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import type { StudioData } from "@/lib/repositories";

const TAG_STYLES = {
  pill: "rounded-full",
  square: "rounded",
  outline: "rounded-full border bg-transparent",
} as const;

function SpecialtiesBlock({
  tagStyle,
  centered,
  specialties,
}: {
  tagStyle: TagStyle;
  centered?: boolean;
  specialties: string[];
}) {
  return (
    <div
      data-builder-card
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
        {specialties.map((tag) => (
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

function StudioDetailsBlock({ services }: { services: StudioData['services'] }) {
  return (
    <div
      data-builder-card
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
        {services.includes("walk-ins") && <li>Walk-ins welcome</li>}
        {services.includes("piercing") && <li>Piercing available</li>}
      </ul>
    </div>
  );
}

function StoryBlock({ centered, bio }: { centered?: boolean; bio?: string }) {
  return (
    <div className={cn(centered && "text-center")}>
      <h2
        className="mb-4 text-2xl font-bold leading-tight @sm:text-3xl"
        style={{
          fontFamily: "var(--heading-font)",
          color: "var(--text-primary)",
        }}
      >
        Our Story
      </h2>
      {bio && (
        <p
          className={cn(
            "text-sm leading-relaxed",
            centered && "mx-auto max-w-xl",
          )}
          style={{ color: "var(--text-secondary)" }}
        >
          {bio}
        </p>
      )}
    </div>
  );
}

export function AboutSection({ className }: { className?: string }) {
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const { aboutLayout, showSpecialties, showStudioDetails, tagStyle } = config;

  const hasSpecialties = showSpecialties !== false;
  const hasDetails = showStudioDetails !== false;
  const specialties = data?.specialties ?? [];
  const services = data?.services ?? [];
  const bio = data?.bio;

  // About = none: render standalone content blocks if any are toggled on
  if (aboutLayout === "none") {
    if (!hasSpecialties && !hasDetails) return null;

    return (
      <section
        className={cn(
          "w-full transition-all duration-500 ease-in-out",
          className,
        )}
        style={{ backgroundColor: "var(--bg-raised)" }}
      >
        <div className="mx-auto max-w-[1350px] px-6 py-8 @lg:px-10">
          <div className="flex flex-col gap-4 @sm:flex-row @sm:gap-6">
            {hasSpecialties && (
              <div className="flex-1">
                <SpecialtiesBlock tagStyle={tagStyle} specialties={specialties} />
              </div>
            )}
            {hasDetails && (
              <div className="flex-1">
                <StudioDetailsBlock services={services} />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "w-full transition-all duration-500 ease-in-out",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-[1350px] px-6 py-12 @lg:px-10">
        {aboutLayout === "split" && (
          <SplitAbout
            tagStyle={tagStyle}
            showSpecialties={hasSpecialties}
            showDetails={hasDetails}
            specialties={specialties}
            services={services}
            bio={bio}
          />
        )}
        {aboutLayout === "full-width" && (
          <FullWidthAbout
            tagStyle={tagStyle}
            showSpecialties={hasSpecialties}
            showDetails={hasDetails}
            specialties={specialties}
            services={services}
            bio={bio}
          />
        )}
      </div>
    </section>
  );
}

function SplitAbout({
  tagStyle,
  showSpecialties,
  showDetails,
  specialties,
  services,
  bio,
}: {
  tagStyle: TagStyle;
  showSpecialties: boolean;
  showDetails: boolean;
  specialties: string[];
  services: StudioData['services'];
  bio?: string;
}) {
  const hasRightColumn = showSpecialties || showDetails;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8",
        hasRightColumn && "@md:grid-cols-2",
      )}
    >
      <div>
        <StoryBlock bio={bio} />
        {hasRightColumn && (
          <div
            className="mt-8 h-px @md:hidden"
            style={{ backgroundColor: "var(--border)" }}
          />
        )}
      </div>

      {hasRightColumn && (
        <div className="space-y-5">
          {showSpecialties && <SpecialtiesBlock tagStyle={tagStyle} specialties={specialties} />}
          {showDetails && <StudioDetailsBlock services={services} />}
        </div>
      )}
    </div>
  );
}

function FullWidthAbout({
  tagStyle,
  showSpecialties,
  showDetails,
  specialties,
  services,
  bio,
}: {
  tagStyle: TagStyle;
  showSpecialties: boolean;
  showDetails: boolean;
  specialties: string[];
  services: StudioData['services'];
  bio?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <StoryBlock centered bio={bio} />

      {showSpecialties && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {specialties.map((tag) => (
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
            <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{services.includes('walk-ins') ? 'Walk-ins Welcome' : 'By Appointment'}</p>
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
