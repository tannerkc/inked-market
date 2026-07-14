"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getCustomerDashboardData } from "@/lib/data/dashboard";
import type { CustomerDashboardTab } from "@/lib/types";
import { useCustomerProfileForm } from "./hooks/use-customer-profile-form";
import { useCustomerData } from "./hooks/use-customer-data";
import { useNotificationPrefs } from "./hooks/use-notification-prefs";
import { useAftercareTracker } from "./hooks/use-aftercare-tracker";

export function useCustomerDashboard() {
  const { user, updateUser } = useAuth();

  const profile = useCustomerProfileForm(user, updateUser);
  const customerData = useCustomerData(user?.id);
  const notifications = useNotificationPrefs();
  const aftercare = useAftercareTracker();

  // Tab + non-profile panel state (trivial, stays inline).
  const [activeTab, setActiveTab] = useState<CustomerDashboardTab>("activity");
  const [designBriefOpen, setDesignBriefOpen] = useState(false);
  const [healedPhotoOpen, setHealedPhotoOpen] = useState(false);

  // Re-sync profile form whenever the user identity changes (e.g. async load,
  // name updated elsewhere). Single effect keeps the lint surface minimal.
  const syncedName = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!user || syncedName.current === user.name) return;
    syncedName.current = user.name;
    profile.loadFromUser(user);
  }, [user, profile]);

  const [mockData] = useState(getCustomerDashboardData);
  const data = useMemo(
    () => ({
      ...mockData,
      name: user?.name ?? "",
      tags: user?.styles ?? mockData.tags,
    }),
    [mockData, user?.name, user?.styles]
  );

  return {
    data,
    user,
    activeTab,
    setActiveTab,
    designBriefOpen,
    setDesignBriefOpen,
    healedPhotoOpen,
    setHealedPhotoOpen,
    ...profile,
    ...customerData,
    ...notifications,
    ...aftercare,
  };
}
