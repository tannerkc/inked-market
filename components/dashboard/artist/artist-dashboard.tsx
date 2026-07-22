"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/providers/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { PhotoUploadIcon, CalendarIcon, LinkShareIcon, BookingSettingsIcon } from "@/components/dashboard/dashboard-icons";
import { MessagesCard } from "@/components/dashboard/messages-card";
import {
  ArtistRequestsSection,
  BookingModePrompt,
  BookingSettingsPanel,
  FlashManagerPanel,
  RequestDetailPanel,
  UpcomingAppointmentsCard,
  useArtistRequests,
} from "@/components/booking";
import { ArtistBioSection } from "./artist-bio-section";
import { ArtistPortfolioSection } from "./artist-portfolio-section";
import { ArtistStudioSection } from "./artist-studio-section";
import { ArtistEditProfilePanel } from "./artist-edit-profile-panel";
import { ArtistAvailabilityPanel } from "./artist-availability-panel";
import { ArtistFindStudioPanel } from "./artist-find-studio-panel";
import { useArtistDashboard } from "./use-artist-dashboard";
import type { QuickAction } from "@/lib/types";

export function ArtistDashboard() {
  const dashboard = useArtistDashboard();
  const artistRequests = useArtistRequests();
  const [bookingSettingsOpen, setBookingSettingsOpen] = useState(false);
  const [flashOpen, setFlashOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      icon: <PhotoUploadIcon className="text-ink-rust dark:text-ink-red" />,
      label: "Upload Photo",
      description: "Add to your portfolio",
    },
    {
      icon: <CalendarIcon className="text-ink-rust" />,
      label: "Set Availability",
      description: "Let clients book you",
      onClick: () => dashboard.setAvailabilityOpen(true),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: <BookingSettingsIcon className="text-ink-rust" />,
      label: "Booking Settings",
      description: "Flows, deposits, and scheduling rules",
      onClick: () => setBookingSettingsOpen(true),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: <PhotoUploadIcon className="text-ink-sage" />,
      label: "Manage Flash",
      description: "Ready-to-book designs with set prices",
      onClick: () => setFlashOpen(true),
      iconBgClass: "bg-ink-sage/[0.08]",
      iconBorderClass: "border-ink-sage/[0.12]",
    },
    {
      icon: <LinkShareIcon className="text-ink-sage" />,
      label: "Share Profile",
      description: "Get discovered faster",
      iconBgClass: "bg-ink-sage/[0.08]",
      iconBorderClass: "border-ink-sage/[0.12]",
    },
  ];

  return (
    <AuthGuard requiredRole="artist">
      <DashboardShell
        eyebrowText="Your Profile"
        onboardingTitle={dashboard.data.onboardingTitle}
        onboardingSubtitle={dashboard.data.onboardingSubtitle}
        onboardingProgress={4 / 7}
        leftColumn={
          <>
            <ProfileCard
              name={dashboard.data.name}
              subtitle={`${dashboard.user?.plan || "Liner"} Plan${dashboard.user?.location ? ` · ${dashboard.user.location}` : ""}`}
              tags={dashboard.data.tags}
              avatarShape="circle"
              editLabel="Edit Profile"
              onEdit={() => dashboard.setEditProfileOpen(true)}
            />
            <StatsPanel stats={dashboard.data.stats} />
            <UpcomingAppointmentsCard />
          </>
        }
        rightColumn={
          <>
            <BookingModePrompt onOpenSettings={() => setBookingSettingsOpen(true)} />
            <ArtistRequestsSection
              pending={artistRequests.pending}
              others={artistRequests.others}
              loading={artistRequests.loading}
              onSelect={artistRequests.setSelected}
            />
            <MessagesCard emptyDescription="Client messages land here — replies keep leads warm" />
            <ArtistBioSection
              bioEditing={dashboard.bioEditing}
              setBioEditing={dashboard.setBioEditing}
              bioText={dashboard.bioText}
              setBioText={dashboard.setBioText}
              onSave={dashboard.handleSaveBio}
            />
            <ArtistPortfolioSection />
            <ArtistStudioSection
              studioAffiliation={dashboard.studioAffiliation}
              onFindStudio={() => dashboard.setFindStudioOpen(true)}
              onLeave={() => dashboard.setStudioAffiliation(null)}
            />
            <QuickActionsGrid actions={quickActions} />
          </>
        }
        panels={
          <>
            <ArtistEditProfilePanel
              open={dashboard.editProfileOpen}
              onClose={() => dashboard.setEditProfileOpen(false)}
              profileForm={dashboard.profileForm}
              setProfileForm={dashboard.setProfileForm}
              onSave={dashboard.handleSaveProfile}
            />
            <ArtistAvailabilityPanel
              open={dashboard.availabilityOpen}
              onClose={() => dashboard.setAvailabilityOpen(false)}
              takingBookings={dashboard.takingBookings}
              setTakingBookings={dashboard.setTakingBookings}
              availability={dashboard.availability}
              onToggleDay={dashboard.handleToggleDay}
              onAddSlot={dashboard.handleAddSlot}
              onRemoveSlot={dashboard.handleRemoveSlot}
              onUpdateSlot={dashboard.handleUpdateSlot}
              onSave={dashboard.saveAvailability}
              blockedDates={dashboard.blockedDates}
              onAddBlocked={dashboard.addBlocked}
              onRemoveBlocked={dashboard.removeBlocked}
            />
            <BookingSettingsPanel
              open={bookingSettingsOpen}
              onClose={() => setBookingSettingsOpen(false)}
            />
            <RequestDetailPanel
              request={artistRequests.selected}
              onClose={() => artistRequests.setSelected(null)}
              onRespond={artistRequests.respond}
              responding={artistRequests.responding}
              error={artistRequests.error}
            />
            <FlashManagerPanel open={flashOpen} onClose={() => setFlashOpen(false)} />
            <ArtistFindStudioPanel
              open={dashboard.findStudioOpen}
              onClose={() => dashboard.setFindStudioOpen(false)}
              studioSearch={dashboard.studioSearch}
              setStudioSearch={dashboard.setStudioSearch}
              filteredStudios={dashboard.filteredStudios}
              studioAffiliation={dashboard.studioAffiliation}
              onRequestToJoin={dashboard.handleRequestToJoin}
            />
          </>
        }
      />
    </AuthGuard>
  );
}
