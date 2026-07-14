"use client";

import { useCallback, useState } from "react";
import type { NotificationPreferences } from "@/lib/types";

const DEFAULT_PREFS: NotificationPreferences = {
  marketing: true,
  platformUpdates: true,
  savedArtistUpdates: true,
  bookingConfirmations: true,
};

export function useNotificationPrefs() {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);

  const handleToggleNotification = useCallback((key: keyof NotificationPreferences) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { notificationPrefs, handleToggleNotification };
}
