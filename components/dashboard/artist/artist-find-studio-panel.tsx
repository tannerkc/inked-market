"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import { AffiliationRow } from "@/components/dashboard/affiliation-row";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListGroup } from "@/components/dashboard/list-group";
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
  return (
    <SlideOverPanel
      open={open}
      onClose={() => { onClose(); setStudioSearch(""); }}
      title="Find a Studio"
    >
      <div className="space-y-5">
        <Input
          label="Search"
          value={studioSearch}
          onChange={(e) => setStudioSearch(e.target.value)}
          placeholder="Search studios by name or location..."
        />

        {filteredStudios.length === 0 ? (
          <EmptyState message="No studios found" />
        ) : (
          <ListGroup>
            {filteredStudios.map((studio) => (
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
            ))}
          </ListGroup>
        )}

        {studioAffiliation && (
          <>
            <SectionLabel label="your request" variant="muted" stretch />
            <ListGroup>
              <AffiliationRow
                name={studioAffiliation.name}
                avatarUrl={studioAffiliation.avatarUrl}
                avatarShape="rounded"
                status={studioAffiliation.status}
              />
            </ListGroup>
          </>
        )}
      </div>
    </SlideOverPanel>
  );
}
