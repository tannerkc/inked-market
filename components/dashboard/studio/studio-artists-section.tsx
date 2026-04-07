"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";

interface StudioArtistsSectionProps {
  onInvite: () => void;
}

export function StudioArtistsSection({ onInvite }: StudioArtistsSectionProps) {
  return (
    <DashboardSection title="Your Artists" action={{ label: "+ Invite", onClick: onInvite }}>
      <EmptyState
        message="No artists yet"
        description="Invite artists to join your studio roster"
      />
    </DashboardSection>
  );
}
