"use client";

import { cn } from "@/lib/utils";
import { useStudioSite } from "@/components/studio-site/studio-site-context";
import { PromptChip, SectionEmptyState } from "@/components/studio-site/empty-states";
import type { TagStyle } from "@/lib/types/builder";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";

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

function StudioDetailsBlock({ services }: { services: StudioSiteData['services'] }) {
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
        {services.includes("walk-ins") ? <li>Walk-ins welcome</li> : null}
        {services.includes("piercing") ? <li>Piercing available</li> : null}
      </ul>
    </div>
  );
}

function StoryBlock({ centered, bio }: { centered?: boolean; bio?: string }) {
  const hasStory = Boolean(bio && bio.trim());
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
      {hasStory ? (
        <p
          data-story-body
          className={cn(
            "text-sm leading-relaxed",
            centered && "mx-auto max-w-xl",
          )}
          style={{ color: "var(--text-secondary)" }}
        >
          {bio}
        </p>
      ) : (
        <div className={cn("flex flex-col gap-3", centered ? "items-center" : "items-start")}>
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            Story coming soon.
          </p>
          <PromptChip group="story" label="Tell your story" />
        </div>
      )}
    </div>
  );
}

export function AboutSection({ className }: { className?: string }) {
  const { config, data } = useStudioSite();
  const { aboutLayout, showSpecialties, showStudioDetails, tagStyle } = config;

  const specialties = data?.specialties ?? [];
  const services = data?.services ?? [];
  const bio = data?.bio;
  // Reflow to what exists: blocks render only when toggled on AND real data exists.
  const hasSpecialties = showSpecialties !== false && specialties.length > 0;
  const hasDetails = showStudioDetails !== false && services.length > 0;

  // Everything empty → one designed empty state instead of a hollow section.
  const nothingToShow = !bio?.trim() && !hasSpecialties && !hasDetails;
  if (aboutLayout !== "none" && nothingToShow) {
    return (
      <section
        className={cn("w-full transition-all duration-500 ease-in-out", className)}
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="mx-auto max-w-[1350px] px-6 py-12 @lg:px-10">
          <SectionEmptyState
            eyebrow="Our Story"
            message="Story coming soon."
            prompt={{ group: "story", label: "Tell your story" }}
          />
        </div>
      </section>
    );
  }

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
            {hasSpecialties ? <div className="flex-1">
                <SpecialtiesBlock tagStyle={tagStyle} specialties={specialties} />
              </div> : null}
            {hasDetails ? <div className="flex-1">
                <StudioDetailsBlock services={services} />
              </div> : null}
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
        {aboutLayout === "split" ? <SplitAbout
            tagStyle={tagStyle}
            showSpecialties={hasSpecialties}
            showDetails={hasDetails}
            specialties={specialties}
            services={services}
            bio={bio}
          /> : null}
        {aboutLayout === "full-width" ? <FullWidthAbout
            tagStyle={tagStyle}
            showSpecialties={hasSpecialties}
            showDetails={hasDetails}
            specialties={specialties}
            services={services}
            bio={bio}
          /> : null}
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
  services: StudioSiteData['services'];
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
        {hasRightColumn ? <div
            className="mt-8 h-px @md:hidden"
            style={{ backgroundColor: "var(--border)" }}
          /> : null}
      </div>

      {hasRightColumn ? <div className="space-y-5">
          {showSpecialties ? <SpecialtiesBlock tagStyle={tagStyle} specialties={specialties} /> : null}
          {showDetails ? <StudioDetailsBlock services={services} /> : null}
        </div> : null}
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
  services: StudioSiteData['services'];
  bio?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <StoryBlock centered bio={bio} />

      {showSpecialties ? <div className="mt-6 flex flex-wrap justify-center gap-2">
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
        </div> : null}

      {/* Real services only — never fabricated amenities */}
      {showDetails && services.length > 0 ? (
        <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-6 text-center">
          {services.includes("walk-ins") ? (
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }} aria-hidden="true">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Walk-ins Welcome</p>
            </div>
          ) : null}
          {services.includes("piercing") ? (
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Piercing Available</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
