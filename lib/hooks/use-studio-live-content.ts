"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getReviewsForTarget } from "@/lib/data/supabase-reviews";
import { getRosterArtistRows } from "@/lib/data/supabase-artists";
import { fetchBookHrefs } from "@/lib/data/supabase-booking";
import type { DbPortfolioImage } from "@/lib/supabase/types";
import type {
  StudioSiteArtist,
  StudioSiteReview,
} from "@/components/studio-site/studio-site-data";

export interface LiveStudioContent {
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  ratingAverage?: string;
  reviewCount: number;
  status: "idle" | "loading" | "ready" | "error";
  refresh: () => void;
}

interface LiveData {
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  ratingAverage?: string;
  reviewCount: number;
}

const EMPTY: LiveData = {
  artists: [],
  reviews: [],
  ratingAverage: undefined,
  reviewCount: 0,
};

const THUMBS_PER_ARTIST = 12; // covers the max strip (8) + overflow sheet grid

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

async function fetchLiveContent(studioId: string): Promise<LiveData> {
  const supabase = createClient();
  const [rows, reviews] = await Promise.all([
    getRosterArtistRows(supabase, studioId),
    getReviewsForTarget(supabase, "studio", studioId),
  ]);
  const bookHrefs = await fetchBookHrefs(supabase, rows.map((r) => r.id));
  const thumbsByArtist = new Map<string, DbPortfolioImage[]>();
  if (rows.length > 0) {
    const { data: portfolio } = await supabase
      .from("portfolio_images")
      .select("id, artist_id, url, sort_order")
      .in("artist_id", rows.map((r) => r.id))
      .order("sort_order", { ascending: true });
    for (const img of (portfolio ?? []) as DbPortfolioImage[]) {
      const list = thumbsByArtist.get(img.artist_id) ?? [];
      if (list.length < THUMBS_PER_ARTIST) list.push(img);
      thumbsByArtist.set(img.artist_id, list);
    }
  }

  const artists: StudioSiteArtist[] = rows.map((r) => {
    const thumbs = thumbsByArtist.get(r.id) ?? [];
    return {
      id: r.id,
      name: r.name,
      initials: initialsOf(r.name),
      styles: (r.specialties ?? []).slice(0, 3),
      photoCount: thumbs.length,
      photos: thumbs.map((t) => ({ id: t.id, url: t.url })),
      profileHref: `/artists/${r.id}`,
      bookHref: bookHrefs.get(r.id),
    };
  });

  const siteReviews: StudioSiteReview[] = reviews.map((r) => ({
    author: r.authorName || "Anonymous",
    stars: Math.round(r.rating),
    text: r.content,
  }));
  const avg =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : undefined;

  return { artists, reviews: siteReviews, ratingAverage: avg, reviewCount: reviews.length };
}

/**
 * Builder-only: fetch the studio's REAL roster (+ portfolio thumbnails, one
 * batched query) and reviews so the preview shows live truth. No studioId
 * (logged-out / localStorage dev) → stays idle with empty content.
 *
 * Status is DERIVED from a request key (no setState in the effect body):
 * results carry the key they were fetched for, so stale responses are inert.
 */
export function useStudioLiveContent(studioId: string | undefined): LiveStudioContent {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{ key: string; data: LiveData; status: "ready" | "error" } | null>(null);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const requestKey =
    studioId && process.env.NEXT_PUBLIC_SUPABASE_URL ? `${studioId}:${nonce}` : null;

  useEffect(() => {
    if (!requestKey || !studioId) return;
    fetchLiveContent(studioId)
      .then((data) => setResult({ key: requestKey, data, status: "ready" }))
      .catch(() => setResult({ key: requestKey, data: EMPTY, status: "error" }));
  }, [requestKey, studioId]);

  const settled = requestKey !== null && result?.key === requestKey ? result : null;
  const status: LiveStudioContent["status"] = !requestKey
    ? "idle"
    : settled
      ? settled.status
      : "loading";
  const data = settled?.data ?? EMPTY;

  return useMemo(() => ({ ...data, status, refresh }), [data, status, refresh]);
}
