"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import { AffiliationRow } from "@/components/dashboard/affiliation-row";
import { useTheme } from "@/components/providers/theme-provider";
import type { Affiliation } from "@/lib/types";

interface ArtistFindStudioPanelProps {
  open: boolean;
  onClose: () => void;
  studioSearch: string;
  setStudioSearch: (value: string) => void;
  filteredStudios: Array<{ id: string; name: string; avatarUrl?: string; location: string }>;
  studioAffiliation: Affiliation | null;
  onRequestToJoin: (studio: { id: string; name: string; avatarUrl?: string; location: string }) => void;
}

export function ArtistFindStudioPanel({
  open,
  onClose,
  studioSearch,
  setStudioSearch,
  filteredStudios,
  studioAffiliation,
  onRequestToJoin,
}: ArtistFindStudioPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <SlideOverPanel
      open={open}
      onClose={() => { onClose(); setStudioSearch(""); }}
      title="Find a Studio"
    >
      <div className="space-y-5">
        <Input
          label="Search"
          variant={isDark ? "dark" : "light"}
          value={studioSearch}
          onChange={(e) => setStudioSearch(e.target.value)}
          placeholder="Search studios by name or location..."
        />

        <div>
          {filteredStudios.length === 0 ? (
            <p className={`text-[12px] text-center py-4 ${isDark ? "text-ink-cream/25" : "text-ink-black/25"}`}>
              No studios found
            </p>
          ) : (
            filteredStudios.map((studio) => (
              <AffiliationRow
                key={studio.id}
                name={studio.name}
                avatarUrl={studio.avatarUrl}
                avatarShape="rounded"
                subtitle={studio.location}
                status="active"
                onAction={() => onRequestToJoin(studio)}
                actionLabel={studioAffiliation?.id === studio.id ? "Requested" : "Request to Join"}
              />
            ))
          )}
        </div>

        {studioAffiliation && (
          <>
            <SectionLabel label="your request" variant={isDark ? "dark-muted" : "parchment"} stretch />
            <AffiliationRow
              name={studioAffiliation.name}
              avatarUrl={studioAffiliation.avatarUrl}
              avatarShape="rounded"
              status={studioAffiliation.status}
            />
          </>
        )}
      </div>
    </SlideOverPanel>
  );
}
