"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import type { PrivacyPreferences } from "@/lib/types";

const DEFAULTS: PrivacyPreferences = {
  showInSearch: true,
  allowMessages: true,
  showAvailability: true,
  showAffiliation: true,
  portfolioVisibility: "public",
  showBusinessHours: true,
  showArtistRoster: true,
  showSavedItems: true,
  showReviewHistory: true,
};

export function usePrivacy() {
  const { user, updateUser } = useAuth();
  const prefs: PrivacyPreferences = { ...DEFAULTS, ...user?.privacy };

  const toggle = useCallback(
    (key: keyof PrivacyPreferences) => {
      const current = prefs[key];
      if (typeof current === "boolean") {
        updateUser({ privacy: { ...prefs, [key]: !current } });
      }
    },
    [prefs, updateUser]
  );

  const setPortfolioVisibility = useCallback(
    (value: "public" | "followers") => {
      updateUser({ privacy: { ...prefs, portfolioVisibility: value } });
    },
    [prefs, updateUser]
  );

  // Artist on free tier can't appear in search
  const isFreeTier = user?.role === "artist" && (!user?.billing?.plan || user?.billing?.plan === "liner" || (!user?.billing && (!user?.plan || user?.plan === "Free" || user?.plan === "Liner" || user?.plan === "liner")));

  return { prefs, toggle, setPortfolioVisibility, role: user?.role ?? "customer", isFreeTier };
}
