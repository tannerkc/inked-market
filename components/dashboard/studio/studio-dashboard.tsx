"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { useTheme } from "@/components/providers/theme-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
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
import type { QuickAction, TierSlug } from "@/lib/types";

export function StudioDashboard() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const dashboard = useStudioDashboard();

  const quickActions: QuickAction[] = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={isDark ? "text-ink-red" : "text-ink-rust"}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      ),
      label: "Add Photos",
      description: "Showcase your space",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-rust">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
      label: "Invite Artists",
      description: "Build your roster",
      onClick: () => dashboard.setInviteOpen(true),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-sage">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
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
          </>
        }
        rightColumn={
          <>
            <StudioPageCard />
            <StudioArtistsSection onInvite={() => dashboard.setInviteOpen(true)} />
            <StudioIntegrationsCard
              connectedCount={dashboard.connectedCount}
              onOpen={() => dashboard.setIntegrationsOpen(true)}
            />
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
              currentTier={(dashboard.user?.billing?.plan as TierSlug) ?? null}
              onLink={dashboard.handleOpenLinkFlow}
              onUnlink={dashboard.handleUnlink}
            />
            <StudioLinkFlowPanel
              open={dashboard.linkFlowOpen}
              onClose={() => dashboard.setLinkFlowOpen(false)}
              platform={dashboard.linkFlowPlatform}
              onSave={dashboard.handleSaveLink}
            />
          </>
        }
      />
    </AuthGuard>
  );
}
