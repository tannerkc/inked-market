"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { useTheme } from "@/components/providers/theme-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { TabBar } from "@/components/ui/tab-bar";
import { CustomerMessagesSection } from "./customer-messages-section";
import { CustomerAppointmentsSection } from "./customer-appointments-section";
import { CustomerBookingRequestsSection } from "./customer-booking-requests-section";
import { CustomerInvoicesSection } from "./customer-invoices-section";
import { CustomerReviewsSection } from "./customer-reviews-section";
import { CustomerAftercareSection } from "./customer-aftercare-section";
import { CustomerHealedPhotosSection } from "./customer-healed-photos-section";
import { CustomerDesignBriefsSection } from "./customer-design-briefs-section";
import { CustomerNotificationPrefsSection } from "./customer-notification-prefs-section";
import { CustomerEditProfilePanel } from "./customer-edit-profile-panel";
import { CustomerDesignBriefPanel } from "./customer-design-brief-panel";
import { CustomerHealedPhotoPanel } from "./customer-healed-photo-panel";
import { useCustomerDashboard } from "./use-customer-dashboard";
import { cn } from "@/lib/utils";
import type { QuickAction, CustomerDashboardTab } from "@/lib/types";
import type { TabItem } from "@/components/ui/tab-bar";

export function CustomerDashboard() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const dashboard = useCustomerDashboard();

  const tabs: TabItem<CustomerDashboardTab>[] = [
    {
      label: "Activity",
      value: "activity",
      count: dashboard.unreadCount + dashboard.pendingBookings,
    },
    {
      label: "Invoices",
      value: "invoices",
      count: dashboard.unpaidInvoices,
    },
    {
      label: "Reviews",
      value: "reviews",
      count: dashboard.completedWithoutReview.length,
    },
    { label: "Aftercare", value: "aftercare" },
    { label: "Briefs", value: "briefs" },
  ];

  const quickActions: QuickAction[] = [
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isDark ? "text-ink-red" : "text-ink-rust"}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      label: "Find Artists",
      description: "Discover your next tattoo",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-rust"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: "My Bookings",
      description: "View appointments",
      onClick: () => dashboard.setActiveTab("activity"),
      iconBgClass: "bg-ink-rust/[0.06]",
      iconBorderClass: "border-ink-rust/[0.1]",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-sage"
        >
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      label: "Upload Healed Photo",
      description: "Share your results",
      onClick: () => dashboard.setHealedPhotoOpen(true),
      iconBgClass: "bg-ink-sage/[0.08]",
      iconBorderClass: "border-ink-sage/[0.12]",
    },
  ];

  return (
    <AuthGuard requiredRole="customer">
      <DashboardShell
        eyebrowText="Your Account"
        onboardingTitle={dashboard.data.onboardingTitle}
        onboardingSubtitle={dashboard.data.onboardingSubtitle}
        onboardingProgress={dashboard.data.checklist.filter(i => i.completed).length / dashboard.data.checklist.length}
        leftColumn={
          <>
            <ProfileCard
              name={dashboard.data.name}
              subtitle={dashboard.user?.location || "Set your location"}
              tags={dashboard.data.tags}
              avatarShape="circle"
              editLabel="Edit Profile"
              onEdit={() => dashboard.setEditProfileOpen(true)}
            />
            <StatsPanel stats={dashboard.data.stats} />
            <div
              className={cn(
                "rounded-[20px] p-5 border",
                isDark
                  ? "bg-ink-cream/[0.02] border-ink-cream/[0.06]"
                  : "bg-ink-black/[0.02] border-ink-black/[0.06]"
              )}
            >
              <p
                className={cn(
                  "font-mono text-[9px] tracking-[0.2em] uppercase mb-3",
                  isDark ? "text-ink-cream/35" : "text-ink-black/35"
                )}
              >
                Next Appointment
              </p>
              {dashboard.nextAppointment ? (
                <div>
                  <p
                    className={cn(
                      "text-[12px] font-medium",
                      isDark ? "text-ink-cream/70" : "text-ink-black/70"
                    )}
                  >
                    {dashboard.nextAppointment.artistName}
                  </p>
                  {dashboard.nextAppointment.studioName && (
                    <p
                      className={cn(
                        "text-[11px] mt-0.5",
                        isDark ? "text-ink-cream/35" : "text-ink-black/35"
                      )}
                    >
                      {dashboard.nextAppointment.studioName}
                    </p>
                  )}
                  <p
                    className={cn(
                      "font-mono text-[10px] mt-2",
                      isDark ? "text-ink-cream/40" : "text-ink-black/40"
                    )}
                  >
                    {new Date(dashboard.nextAppointment.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}{" "}
                    &middot;{" "}
                    {dashboard.nextAppointment.duration >= 60
                      ? `${dashboard.nextAppointment.duration / 60}hr`
                      : `${dashboard.nextAppointment.duration}min`}
                  </p>
                  {dashboard.nextAppointment.notes && (
                    <p
                      className={cn(
                        "text-[11px] mt-2 line-clamp-2",
                        isDark ? "text-ink-cream/25" : "text-ink-black/25"
                      )}
                    >
                      {dashboard.nextAppointment.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p
                    className={cn(
                      "text-[12px]",
                      isDark ? "text-ink-cream/40" : "text-ink-black/40"
                    )}
                  >
                    No upcoming appointments
                  </p>
                  <p
                    className={cn(
                      "text-[11px] mt-1",
                      isDark ? "text-ink-cream/20" : "text-ink-black/20"
                    )}
                  >
                    Browse artists to get started
                  </p>
                </div>
              )}
            </div>
          </>
        }
        rightColumn={
          <>
            <TabBar
              tabs={tabs}
              activeTab={dashboard.activeTab}
              onTabChange={dashboard.setActiveTab}
              variant={mode}
              className="mb-6"
            />

            {dashboard.activeTab === "activity" && (
              <>
                <CustomerMessagesSection
                  conversations={dashboard.sortedConversations}
                  participants={dashboard.participants}
                  currentUserId={dashboard.user?.id ?? ""}
                />
                <CustomerAppointmentsSection
                  upcoming={dashboard.upcomingAppointments}
                  past={dashboard.pastAppointments}
                />
                <CustomerBookingRequestsSection
                  requests={dashboard.bookingRequests}
                />
                <QuickActionsGrid actions={quickActions} />
              </>
            )}

            {dashboard.activeTab === "invoices" && (
              <CustomerInvoicesSection invoices={dashboard.invoices} />
            )}

            {dashboard.activeTab === "reviews" && (
              <CustomerReviewsSection
                reviews={dashboard.reviews}
                pendingReviews={dashboard.completedWithoutReview}
              />
            )}

            {dashboard.activeTab === "aftercare" && (
              <>
                <CustomerAftercareSection
                  timelines={dashboard.aftercareTimelines}
                  onToggleStep={dashboard.handleToggleAftercare}
                />
                <CustomerHealedPhotosSection
                  photos={dashboard.healedPhotos}
                  onUpload={() => dashboard.setHealedPhotoOpen(true)}
                />
              </>
            )}

            {dashboard.activeTab === "briefs" && (
              <>
                <CustomerDesignBriefsSection
                  briefs={dashboard.designBriefs}
                  onNewBrief={() => dashboard.setDesignBriefOpen(true)}
                />
                <CustomerNotificationPrefsSection
                  prefs={dashboard.notificationPrefs}
                  onToggle={dashboard.handleToggleNotification}
                />
              </>
            )}
          </>
        }
        panels={
          <>
            <CustomerEditProfilePanel
              open={dashboard.editProfileOpen}
              onClose={() => dashboard.setEditProfileOpen(false)}
              profileForm={dashboard.profileForm}
              setProfileForm={dashboard.setProfileForm}
              onSave={dashboard.handleSaveProfile}
            />
            <CustomerDesignBriefPanel
              open={dashboard.designBriefOpen}
              onClose={() => dashboard.setDesignBriefOpen(false)}
            />
            <CustomerHealedPhotoPanel
              open={dashboard.healedPhotoOpen}
              onClose={() => dashboard.setHealedPhotoOpen(false)}
              completedAppointments={dashboard.completedAppointments}
            />
          </>
        }
      />
    </AuthGuard>
  );
}
