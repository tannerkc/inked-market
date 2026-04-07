"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { useTheme } from "@/components/providers/theme-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { ArtistBioSection } from "./artist-bio-section";
import { ArtistPortfolioSection } from "./artist-portfolio-section";
import { ArtistStudioSection } from "./artist-studio-section";
import { ArtistEditProfilePanel } from "./artist-edit-profile-panel";
import { ArtistAvailabilityPanel } from "./artist-availability-panel";
import { ArtistFindStudioPanel } from "./artist-find-studio-panel";
import { useArtistDashboard } from "./use-artist-dashboard";
import type { QuickAction } from "@/lib/types";

export function ArtistDashboard() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const dashboard = useArtistDashboard();

  const quickActions: QuickAction[] = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={isDark ? "text-ink-red" : "text-ink-rust"}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      ),
      label: "Upload Photo",
      description: "Add to your portfolio",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-rust">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: "Set Availability",
      description: "Let clients book you",
      onClick: () => dashboard.setAvailabilityOpen(true),
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
            {/* Upcoming */}
            <div className={`rounded-[20px] p-5 border ${isDark ? "bg-ink-cream/[0.02] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]"}`}>
              <p className={`font-mono text-[9px] tracking-[0.2em] uppercase mb-3 ${isDark ? "text-ink-cream/35" : "text-ink-black/35"}`}>Upcoming</p>
              <div className="text-center py-4">
                <p className={`text-[12px] ${isDark ? "text-ink-cream/40" : "text-ink-black/40"}`}>No upcoming bookings</p>
                <p className={`text-[11px] mt-1 ${isDark ? "text-ink-cream/20" : "text-ink-black/20"}`}>Bookings appear once clients find you</p>
              </div>
            </div>
          </>
        }
        rightColumn={
          <>
            <ArtistBioSection
              bioEditing={dashboard.bioEditing}
              setBioEditing={dashboard.setBioEditing}
              bioText={dashboard.bioText}
              setBioText={dashboard.setBioText}
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
            />
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
