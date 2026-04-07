"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import type { NotificationPreferences } from "@/lib/types";

const DEFAULTS: NotificationPreferences = {
  marketing: true,
  platformUpdates: true,
  bookingRequests: true,
  studioInvitations: true,
  artistApplications: true,
  bookingAlerts: true,
  reviewAlerts: true,
  savedArtistUpdates: true,
  bookingConfirmations: true,
};

export function useNotifications() {
  const { user, updateUser } = useAuth();
  const prefs: NotificationPreferences = { ...DEFAULTS, ...user?.notifications };

  const toggle = useCallback(
    (key: keyof NotificationPreferences) => {
      const updated = { ...prefs, [key]: !prefs[key] };
      updateUser({ notifications: updated });
    },
    [prefs, updateUser]
  );

  return { prefs, toggle, role: user?.role ?? "customer" };
}
