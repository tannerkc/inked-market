"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AffiliationRow } from "@/components/dashboard/affiliation-row";
import type { Affiliation } from "@/lib/types";

interface ArtistStudioSectionProps {
  studioAffiliation: Affiliation | null;
  onFindStudio: () => void;
  onLeave: () => void;
}

export function ArtistStudioSection({ studioAffiliation, onFindStudio, onLeave }: ArtistStudioSectionProps) {
  return (
    <DashboardSection
      title="Studio"
      action={!studioAffiliation ? { label: "+ Find a studio", onClick: onFindStudio } : undefined}
    >
      {studioAffiliation ? (
        <AffiliationRow
          name={studioAffiliation.name}
          avatarUrl={studioAffiliation.avatarUrl}
          avatarShape="rounded"
          status={studioAffiliation.status}
          onAction={onLeave}
          actionLabel="Leave"
        />
      ) : (
        <EmptyState
          message="Not affiliated with a studio"
          description="Search for studios to request to join"
          action={{ label: "+ Find a studio", onClick: onFindStudio }}
        />
      )}
    </DashboardSection>
  );
}
