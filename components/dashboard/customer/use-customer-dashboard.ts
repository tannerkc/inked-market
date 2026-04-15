"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getCustomerDashboardData } from "@/lib/data/dashboard";
import {
  getCustomerConversations,
  getCustomerAppointments,
  getCustomerBookingRequests,
  getCustomerInvoices,
  getCustomerReviews,
  getCustomerDesignBriefs,
  getCustomerAftercare,
  getCustomerHealedPhotos,
  getConversationParticipants,
} from "@/lib/data/customer-dashboard";
import type {
  CustomerDashboardTab,
  Conversation,
  Appointment,
  BookingRequest,
  Invoice,
  Review,
  DesignBrief,
  AftercareTimeline,
  HealedPhoto,
  NotificationPreferences,
} from "@/lib/types";

export function useCustomerDashboard() {
  const { user, updateUser } = useAuth();

  const [mockData] = useState(() => getCustomerDashboardData());
  const data = useMemo(() => ({
    ...mockData,
    name: user?.name || "",
    tags: user?.styles || mockData.tags,
  }), [mockData, user?.name, user?.styles]);

  // Tab state
  const [activeTab, setActiveTab] = useState<CustomerDashboardTab>("activity");

  // Panel open/close
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [designBriefOpen, setDesignBriefOpen] = useState(false);
  const [healedPhotoOpen, setHealedPhotoOpen] = useState(false);

  // Data state
  const [conversations] = useState<Conversation[]>(getCustomerConversations());
  const [appointments] = useState<Appointment[]>(getCustomerAppointments());
  const [bookingRequests] = useState<BookingRequest[]>(getCustomerBookingRequests());
  const [invoices] = useState<Invoice[]>(getCustomerInvoices());
  const [reviews] = useState<Review[]>(getCustomerReviews());
  const [designBriefs] = useState<DesignBrief[]>(getCustomerDesignBriefs());
  const [aftercareTimelines, setAftercareTimelines] = useState<AftercareTimeline[]>(getCustomerAftercare());
  const [healedPhotos] = useState<HealedPhoto[]>(getCustomerHealedPhotos());
  const [participants] = useState(() => getConversationParticipants());

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    marketing: true,
    platformUpdates: true,
    savedArtistUpdates: true,
    bookingConfirmations: true,
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    location: user?.location || "",
    bio: user?.bio || "",
    styles: (user?.styles || []) as string[],
  });

  // Sync profile form when user loads asynchronously
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        location: user.location || "",
        bio: user.bio || "",
        styles: (user.styles || []) as string[],
      });
    }
  }, [user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed values
  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (sum, c) => sum + (c.unreadCount[user?.id ?? ""] || 0),
        0
      ),
    [conversations, user?.id]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "confirmed" || a.status === "pending")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [appointments]
  );

  const pastAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "completed" || a.status === "cancelled")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appointments]
  );

  const pendingBookings = useMemo(
    () => bookingRequests.filter((r) => r.status === "pending").length,
    [bookingRequests]
  );

  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length,
    [invoices]
  );

  const completedWithoutReview = useMemo(() => {
    const reviewedAppointmentIds = new Set(
      reviews.map((r) => r.targetId)
    );
    return pastAppointments.filter(
      (a) => a.status === "completed" && !reviewedAppointmentIds.has(a.artistId)
    );
  }, [pastAppointments, reviews]);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    ),
    [conversations]
  );

  const sortedInvoices = useMemo(
    () => [...invoices].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [invoices]
  );

  const completedAppointments = useMemo(
    () => pastAppointments.filter((a) => a.status === "completed"),
    [pastAppointments]
  );

  const nextAppointment = upcomingAppointments[0] || null;

  // Handlers
  const handleToggleAftercare = useCallback(
    (timelineId: string, stepId: string) => {
      setAftercareTimelines((prev) =>
        prev.map((timeline) =>
          timeline.id === timelineId
            ? {
                ...timeline,
                steps: timeline.steps.map((step) =>
                  step.id === stepId
                    ? {
                        ...step,
                        completed: !step.completed,
                        completedAt: !step.completed ? new Date() : undefined,
                      }
                    : step
                ),
              }
            : timeline
        )
      );
    },
    []
  );

  const handleToggleNotification = useCallback(
    (key: keyof NotificationPreferences) => {
      setNotificationPrefs((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );

  const handleSaveProfile = useCallback(() => {
    updateUser({
      name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      styles: profileForm.styles,
      location: profileForm.location,
      bio: profileForm.bio,
    });
    setEditProfileOpen(false);
  }, [profileForm, updateUser]);

  return {
    data,
    user,
    // Tab
    activeTab,
    setActiveTab,
    // Panels
    editProfileOpen,
    setEditProfileOpen,
    designBriefOpen,
    setDesignBriefOpen,
    healedPhotoOpen,
    setHealedPhotoOpen,
    // Data
    conversations,
    sortedConversations,
    participants,
    appointments,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    bookingRequests,
    invoices,
    sortedInvoices,
    reviews,
    designBriefs,
    aftercareTimelines,
    healedPhotos,
    // Computed
    unreadCount,
    pendingBookings,
    unpaidInvoices,
    completedWithoutReview,
    nextAppointment,
    // Notifications
    notificationPrefs,
    handleToggleNotification,
    // Aftercare
    handleToggleAftercare,
    // Profile
    profileForm,
    setProfileForm,
    handleSaveProfile,
  };
}
