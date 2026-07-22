"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudioData } from "@/lib/repositories";
import type { Affiliation, DashboardStat } from "@/lib/types";

/**
 * Live dashboard stats. Artists and photos derive from state already in hand;
 * reviews are one count-only query. Page views/inquiries/bookings return here
 * once analytics and booking exist.
 */
export function useStudioStats(studio: StudioData | null, roster: Affiliation[]): DashboardStat[] {
  const [reviewCount, setReviewCount] = useState(0);
  const studioId = studio?.id;

  useEffect(() => {
    if (!studioId) return;
    let cancelled = false;
    createClient()
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "studio")
      .eq("target_id", studioId)
      .then(({ count }) => {
        if (!cancelled) setReviewCount(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [studioId]);

  const artistCount = roster.filter((r) => r.status === "active").length;
  const photoCount = (studio?.images?.length ?? 0) + (studio?.coverImage ? 1 : 0);

  return [
    { label: "Artists", value: artistCount, empty: artistCount === 0 },
    { label: "Photos", value: photoCount, empty: photoCount === 0 },
    { label: "Reviews", value: reviewCount, empty: reviewCount === 0 },
  ];
}
