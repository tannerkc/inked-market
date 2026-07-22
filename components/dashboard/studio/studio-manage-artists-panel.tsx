"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { AffiliationRow } from "@/components/dashboard/affiliation-row";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListGroup } from "@/components/dashboard/list-group";
import { cn } from "@/lib/utils";
import type { Affiliation } from "@/lib/types";

interface StudioManageArtistsPanelProps {
  open: boolean;
  onClose: () => void;
  inviteTab: "invite" | "roster";
  setInviteTab: (tab: "invite" | "roster") => void;
  // Invite tab
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  onSendEmailInvite: () => void;
  artistSearch: string;
  setArtistSearch: (value: string) => void;
  filteredArtists: Array<{ id: string; name: string; avatarUrl?: string; styles: string[] }>;
  roster: Affiliation[];
  onInviteArtist: (artist: { id: string; name: string; avatarUrl?: string; styles: string[] }) => void;
  // Roster tab
  onAcceptRequest: (id: string) => void;
  onDeclineOrRemove: (id: string) => void;
}

export function StudioManageArtistsPanel({
  open,
  onClose,
  inviteTab,
  setInviteTab,
  inviteEmail,
  setInviteEmail,
  onSendEmailInvite,
  artistSearch,
  setArtistSearch,
  filteredArtists,
  roster,
  onInviteArtist,
  onAcceptRequest,
  onDeclineOrRemove,
}: StudioManageArtistsPanelProps) {
  return (
    <SlideOverPanel
      open={open}
      onClose={() => { onClose(); setInviteTab("invite"); setArtistSearch(""); }}
      title="Manage Artists"
    >
      <div className="space-y-5">
        {/* Tab pills */}
        <div className="flex gap-2">
          {(["invite", "roster"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setInviteTab(tab)}
              className={cn(
                "font-mono text-[9px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border cursor-pointer transition-all",
                inviteTab === tab
                  ? "bg-ink-black/[0.06] border-ink-black/[0.12] text-ink-black dark:bg-ink-cream/[0.06] dark:border-ink-cream/[0.12] dark:text-ink-cream"
                  : "border-ink-black/[0.08] text-ink-black/35 dark:border-ink-cream/[0.08] dark:text-ink-cream/35"
              )}
            >
              {tab === "invite" ? "Invite" : "Roster"}
              {tab === "roster" && roster.length > 0 && (
                <span className="ml-1.5 opacity-50">({roster.length})</span>
              )}
            </button>
          ))}
        </div>

        {inviteTab === "invite" ? (
          <>
            {/* Email invite */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="Email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="artist@email.com"
                />
              </div>
              <div className="flex items-end">
                <Button variant="ink" size="sm" onClick={onSendEmailInvite}>
                  Send
                </Button>
              </div>
            </div>
            <p className="text-[10px] -mt-3 text-ink-black/60 dark:text-ink-cream/60">
              Opens your email app with an invite ready to send
            </p>

            <SectionLabel label="or search artists" variant="muted" stretch />

            <Input
              label="Search"
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              placeholder="Search by name or style..."
            />

            {filteredArtists.length === 0 ? (
              <p className="text-[12px] text-center py-4 text-ink-black/60 dark:text-ink-cream/60">
                No artists found
              </p>
            ) : (
              <ListGroup>
                {filteredArtists.map((artist) => (
                  <AffiliationRow
                    key={artist.id}
                    name={artist.name}
                    avatarUrl={artist.avatarUrl}
                    avatarShape="circle"
                    subtitle={artist.styles.join(", ")}
                    status="active"
                    onAction={() => onInviteArtist(artist)}
                    actionLabel={roster.some((r) => r.artistId === artist.id) ? "Invited" : "Invite"}
                  />
                ))}
              </ListGroup>
            )}
          </>
        ) : (
          <div>
            {roster.length === 0 ? (
              <EmptyState
                message="No artists on your roster yet"
                description="Invite artists or accept requests to build your team"
              />
            ) : (
              <ListGroup>
                {roster.map((affiliation) => (
                  <AffiliationRow
                  key={affiliation.id}
                  name={affiliation.name}
                  avatarUrl={affiliation.avatarUrl}
                  avatarShape="circle"
                  status={affiliation.status}
                  subtitle={affiliation.styles?.slice(0, 3).join(" · ")}
                  onAccept={affiliation.status === "pending-request" ? () => onAcceptRequest(affiliation.id) : undefined}
                  onDecline={affiliation.status === "pending-request" ? () => onDeclineOrRemove(affiliation.id) : undefined}
                  onAction={
                    affiliation.status === "active" && !affiliation.linked
                      ? () => onDeclineOrRemove(affiliation.id)
                      : undefined
                  }
                  actionLabel={affiliation.status === "active" && !affiliation.linked ? "Remove" : undefined}
                />
              ))}
              </ListGroup>
            )}
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
}
