"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getArtistDashboardData } from "@/lib/data/dashboard";
import { useArtistProfileForm } from "./hooks/use-artist-profile-form";
import { useArtistBio } from "./hooks/use-artist-bio";
import { useWeeklyAvailability } from "./hooks/use-weekly-availability";
import { useStudioAffiliation } from "./hooks/use-studio-affiliation";

export function useArtistDashboard() {
  const { user, updateUser } = useAuth();

  const profile = useArtistProfileForm(user, updateUser);
  const bio = useArtistBio(updateUser);
  const availability = useWeeklyAvailability();
  const affiliation = useStudioAffiliation();

  // Sync profile form when the user object's identity changes (e.g. async load,
  // name update from elsewhere). Single effect, single re-sync target.
  const syncedName = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!user || syncedName.current === user.name) return;
    syncedName.current = user.name;
    profile.loadFromUser(user);
  }, [user, profile]);

  const data = {
    ...getArtistDashboardData(),
    name: user?.name ?? "",
    tags: user?.styles ?? [],
  };

  return {
    data,
    user,
    ...profile,
    ...bio,
    ...availability,
    ...affiliation,
  };
}
