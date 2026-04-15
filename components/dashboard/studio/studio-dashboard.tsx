"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { useTheme } from "@/components/providers/theme-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { PhotoUploadIcon, InviteArtistIcon, LinkShareIcon } from "@/components/dashboard/dashboard-icons";
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
import { useStudioDashboard } from "./use-studio-dashboard";
import type { QuickAction } from "@/lib/types";

export function StudioDashboard() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const dashboard = useStudioDashboard();

  const quickActions: QuickAction[] = [
    {
      icon: <PhotoUploadIcon className={isDark ? "text-ink-red" : "text-ink-rust"} />,
      label: "Add Photos",
      description: "Showcase your space",
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
      icon: <LinkShareIcon className="text-ink-sage" />,
      label: "Share Listing",
      description: "Get discovered faster",
      iconBgClass: "bg-ink-sage/[0.08]",
      iconBorderClass: "border-ink-sage/[0.12]",
    },
  ];

  return (
    <AuthGuard requiredRole="studio">
      <DashboardShell
        eyebrowText="Your Studio"
        onboardingTitle={dashboard.data.onboardingTitle}
        onboardingSubtitle={dashboard.data.onboardingSubtitle}
        onboardingProgress={3 / 6}
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
            <StatsPanel stats={dashboard.data.stats} />
            <StudioBusinessHours
              businessHours={dashboard.businessHours}
              hoursSaved={dashboard.hoursSaved}
              onEdit={() => dashboard.setHoursOpen(true)}
            />
            <StudioServicesCard services={dashboard.services} onToggleService={dashboard.handleToggleService} />
            <StudioIntegrationsCard
              connectedCount={dashboard.connectedCount}
              onOpen={() => dashboard.setIntegrationsOpen(true)}
            />
          </>
        }
        rightColumn={
          <>
            <StudioPageCard />
            <StudioArtistsSection onInvite={() => dashboard.setInviteOpen(true)} />
            <QuickActionsGrid actions={quickActions} />
          </>
        }
        panels={
          <>
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
            />
            <StudioLinkFlowPanel
              open={dashboard.linkFlowOpen}
              onClose={() => dashboard.setLinkFlowOpen(false)}
              platform={dashboard.linkFlowPlatform}
              mode={dashboard.linkFlowMode}
              onSave={dashboard.handleSaveConnection}
            />
          </>
        }
      />
    </AuthGuard>
  );
}
