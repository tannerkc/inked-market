"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/providers/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { PhotoUploadIcon, InviteArtistIcon, LinkShareIcon, BookingSettingsIcon, CalendarIcon } from "@/components/dashboard/dashboard-icons";
import { BookingSettingsPanel, FrontDeskPanel, RosterScheduleCard } from "@/components/booking";
import { StudioPageCard } from "./studio-page-card";
import { StudioArtistsSection } from "./studio-artists-section";
import { StudioBusinessHours } from "./studio-business-hours";
import { StudioServicesCard } from "./studio-services-card";
import { StudioEditInfoPanel } from "./studio-edit-info-panel";
import { StudioManageArtistsPanel } from "./studio-manage-artists-panel";
import { StudioBusinessHoursPanel } from "./studio-business-hours-panel";
import { StudioIntegrationsCard } from "./studio-integrations-card";
import { StudioIntegrationsPanel } from "./studio-integrations-panel";
import { StudioLinkFlowPanel } from "./studio-link-flow-panel";
import { StudioPhotosPanel } from "./studio-photos-panel";
import { useStudioDashboard } from "./use-studio-dashboard";
import type { QuickAction } from "@/lib/types";

export interface OAuthReturn {
  platform: string;
  status: string;
}

export function StudioDashboard({ oauthReturn = null }: { oauthReturn?: OAuthReturn | null }) {
  const router = useRouter();
  const dashboard = useStudioDashboard(oauthReturn);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [bookingSettingsOpen, setBookingSettingsOpen] = useState(false);
  const [frontDeskOpen, setFrontDeskOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      icon: <PhotoUploadIcon className="text-ink-rust dark:text-ink-red" />,
      label: "Add Photos",
      description: "Showcase your space",
      onClick: () => setPhotosOpen(true),
    },
    {
      icon: <InviteArtistIcon className="text-ink-rust" />,
      label: "Invite Artists",
      description: "Build your roster",
      onClick: () => dashboard.setInviteOpen(true),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: <CalendarIcon className="text-ink-rust" />,
      label: "Front Desk",
      description: "Book walk-ins and roster artists",
      onClick: () => setFrontDeskOpen(true),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: <BookingSettingsIcon className="text-ink-rust" />,
      label: "Booking Settings",
      description: "Walk-ins, deposits, and scheduling",
      onClick: () => setBookingSettingsOpen(true),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: <LinkShareIcon className="text-ink-sage" />,
      label: "Share Listing",
      description: dashboard.shareCopied ? "Link copied" : "Get discovered faster",
      onClick: dashboard.handleShareListing,
      iconBgClass: "bg-ink-sage/[0.08]",
      iconBorderClass: "border-ink-sage/[0.12]",
    },
  ];

  const handleOnboardingStep = (id: string) => {
    switch (id) {
      case "add-studio-details":
      case "set-specialties":
      case "write-story":
        dashboard.setEditStudioOpen(true);
        break;
      case "add-photos":
        setPhotosOpen(true);
        break;
      case "customize-page":
        router.push("/dashboard/builder");
        break;
    }
  };

  return (
    <AuthGuard requiredRole="studio">
      <DashboardShell
        eyebrowText="Your Studio"
        onboardingTitle={dashboard.data.onboardingTitle}
        onboardingSubtitle={dashboard.data.onboardingSubtitle}
        onboardingProgress={dashboard.onboardingProgress}
        onboardingSteps={dashboard.data.checklist}
        onOnboardingStepClick={handleOnboardingStep}
        onboardingReady={dashboard.studio !== null}
        leftColumn={
          <>
            <ProfileCard
              name={dashboard.data.name}
              subtitle={dashboard.data.subtitle}
              tags={dashboard.data.tags}
              avatarShape="rounded"
              editLabel="Edit Studio Info"
              onEdit={() => dashboard.setEditStudioOpen(true)}
            />
            <StatsPanel title="At a Glance" stats={dashboard.data.stats} />
            <StudioBusinessHours
              businessHours={dashboard.businessHours}
              hoursSaved={dashboard.hoursSaved}
              onEdit={() => dashboard.setHoursOpen(true)}
            />
            <StudioServicesCard services={dashboard.services} onToggleService={dashboard.handleToggleService} />
            <RosterScheduleCard />
            <StudioIntegrationsCard
              connectedCount={dashboard.connectedCount}
              onOpen={() => dashboard.setIntegrationsOpen(true)}
              notice={dashboard.integrationNotice}
            />
          </>
        }
        rightColumn={
          <>
            <StudioPageCard />
            <StudioArtistsSection
              roster={dashboard.roster}
              onInvite={() => dashboard.setInviteOpen(true)}
              onAccept={dashboard.handleAcceptRequest}
              onDeclineOrRemove={dashboard.handleDeclineOrRemove}
            />
            <QuickActionsGrid actions={quickActions} />
          </>
        }
        panels={
          <>
            <BookingSettingsPanel
              open={bookingSettingsOpen}
              onClose={() => setBookingSettingsOpen(false)}
            />
            <FrontDeskPanel open={frontDeskOpen} onClose={() => setFrontDeskOpen(false)} />
            <StudioEditInfoPanel
              open={dashboard.editStudioOpen}
              onClose={() => dashboard.setEditStudioOpen(false)}
              studioForm={dashboard.studioForm}
              setStudioForm={dashboard.setStudioForm}
              onSave={dashboard.handleSaveStudio}
              autoSpecialties={dashboard.autoSpecialties}
              onToggleAutoSpecialties={dashboard.handleToggleAutoSpecialties}
            />
            <StudioManageArtistsPanel
              open={dashboard.inviteOpen}
              onClose={() => dashboard.setInviteOpen(false)}
              inviteTab={dashboard.inviteTab}
              setInviteTab={dashboard.setInviteTab}
              inviteEmail={dashboard.inviteEmail}
              setInviteEmail={dashboard.setInviteEmail}
              onSendEmailInvite={dashboard.handleSendEmailInvite}
              artistSearch={dashboard.artistSearch}
              setArtistSearch={dashboard.setArtistSearch}
              filteredArtists={dashboard.filteredArtists}
              roster={dashboard.roster}
              onInviteArtist={dashboard.handleInviteArtist}
              onAcceptRequest={dashboard.handleAcceptRequest}
              onDeclineOrRemove={dashboard.handleDeclineOrRemove}
            />
            <StudioBusinessHoursPanel
              open={dashboard.hoursOpen}
              onClose={() => dashboard.setHoursOpen(false)}
              businessHours={dashboard.businessHours}
              onToggleDay={dashboard.handleToggleDay}
              onUpdateHour={dashboard.handleUpdateHour}
              onSave={dashboard.handleSaveHours}
            />
            <StudioIntegrationsPanel
              open={dashboard.integrationsOpen}
              onClose={() => dashboard.setIntegrationsOpen(false)}
              integrations={dashboard.studio?.integrations}
              onConnect={dashboard.handleConnect}
              onDisconnect={dashboard.handleDisconnect}
              onImport={dashboard.handleImport}
              importingPlatform={dashboard.importingPlatform}
              notice={dashboard.integrationNotice}
            />
            <StudioLinkFlowPanel
              open={dashboard.linkFlowOpen}
              onClose={() => dashboard.setLinkFlowOpen(false)}
              platform={dashboard.linkFlowPlatform}
              mode={dashboard.linkFlowMode}
              onSave={dashboard.handleSaveConnection}
            />
            <StudioPhotosPanel open={photosOpen} onClose={() => setPhotosOpen(false)} />
          </>
        }
      />
    </AuthGuard>
  );
}
