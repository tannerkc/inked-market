"use client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AffiliationRow } from "@/components/dashboard/affiliation-row";
import { ListGroup } from "@/components/dashboard/list-group";
import type { Affiliation } from "@/lib/types";

interface StudioArtistsSectionProps {
  roster: Affiliation[];
  onInvite: () => void;
  onAccept: (id: string) => void;
  onDeclineOrRemove: (id: string) => void;
}

export function StudioArtistsSection({
  roster,
  onInvite,
  onAccept,
  onDeclineOrRemove,
}: StudioArtistsSectionProps) {
  return (
    <DashboardSection title="Your Artists" action={{ label: "+ Invite", onClick: onInvite }}>
      {roster.length === 0 ? (
        <EmptyState
          message="No artists yet"
          description="Invite artists to join your studio roster"
          action={{ label: "Invite artists", onClick: onInvite }}
        />
      ) : (
        <ListGroup>
          {roster.map((entry) => (
            <AffiliationRow
              key={entry.id}
              name={entry.name}
              avatarUrl={entry.avatarUrl}
              avatarShape="circle"
              subtitle={entry.styles?.slice(0, 3).join(" · ")}
              status={entry.status}
              onAccept={entry.status === "pending-request" ? () => onAccept(entry.id) : undefined}
              onDecline={entry.status === "pending-request" ? () => onDeclineOrRemove(entry.id) : undefined}
              onAction={
                entry.status !== "pending-request" && !entry.linked
                  ? () => onDeclineOrRemove(entry.id)
                  : undefined
              }
              actionLabel={
                entry.status === "active" ? "Remove" : entry.status === "pending-invite" ? "Cancel" : undefined
              }
            />
          ))}
        </ListGroup>
      )}
    </DashboardSection>
  );
}
