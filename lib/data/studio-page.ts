import { defaultThemeConfig } from "@/lib/data/theme-presets";
import { remapLegacyTemplate } from "@/lib/utils/legacy-template";
import type { StudioThemeConfig } from "@/lib/types/builder";
import type { Studio, Review } from "@/lib/types";
import {
  getStudioByIdFromDb,
  getStudioBySlugFromDb,
} from "@/lib/data/supabase-studios";
import { getArtistsForStudio } from "@/lib/data/supabase-artists";
import { getReviewsForTarget } from "@/lib/data/supabase-reviews";
import { getStudio, getStudioReviews } from "@/lib/data/shops";
import type {
  StudioSiteArtist,
  StudioSiteReview,
} from "@/components/studio-site/studio-site-data";

export interface StudioPageData {
  studio: Studio;
  config: StudioThemeConfig;
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  fromDb: boolean;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toSiteReviews(reviews: Review[]): StudioSiteReview[] {
  return reviews.map((r) => ({
    author: r.authorName || "Anonymous",
    stars: Math.round(r.rating),
    text: r.content,
  }));
}

/**
 * Single fetch for both the public studio page and its policies route.
 * Tries Supabase by id then slug; falls back to mock. Always returns a complete
 * theme config (default when the studio never used the builder).
 */
export async function getStudioForPage(
  id: string,
): Promise<StudioPageData | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const studio =
        (await getStudioByIdFromDb(supabase, id)) ??
        (await getStudioBySlugFromDb(supabase, id));
      if (studio) {
        const [roster, reviews] = await Promise.all([
          getArtistsForStudio(supabase, studio.id),
          getReviewsForTarget(supabase, "studio", studio.id),
        ]);
        // Enrich the roster with portfolio thumbnails (one batched query) so the
        // public strips render exactly what the builder preview renders.
        const rosterIds = roster.map((a) => a.id);
        const thumbsByArtist = new Map<string, { id: string; url: string }[]>();
        if (rosterIds.length > 0) {
          const { data: portfolio } = await supabase
            .from("portfolio_images")
            .select("id, artist_id, url, sort_order")
            .in("artist_id", rosterIds)
            .order("sort_order", { ascending: true });
          for (const img of (portfolio ?? []) as { id: string; artist_id: string; url: string }[]) {
            const list = thumbsByArtist.get(img.artist_id) ?? [];
            if (list.length < 12) list.push({ id: img.id, url: img.url });
            thumbsByArtist.set(img.artist_id, list);
          }
        }
        const artists: StudioSiteArtist[] = roster.map((a) => {
          const thumbs = thumbsByArtist.get(a.id) ?? [];
          return {
            id: a.id,
            name: a.name,
            initials: initialsOf(a.name),
            styles: a.specialties.slice(0, 3),
            photoCount: thumbs.length,
            photos: thumbs,
            profileHref: `/artists/${a.id}`,
          };
        });
        return {
          studio,
          config: studio.themeConfig ? remapLegacyTemplate(studio.themeConfig) : defaultThemeConfig,
          artists,
          reviews: toSiteReviews(reviews),
          fromDb: true,
        };
      }
    }
  } catch {
    // Fall through to mock
  }

  const studio = getStudio(id);
  if (!studio) return null;
  const artists: StudioSiteArtist[] = (studio.artists ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    initials: initialsOf(a.name),
    styles: a.specialty ? [a.specialty] : [],
    photoCount: 0,
    photos: [],
    profileHref: `/artists/${a.id}`,
  }));
  return {
    studio,
    config: defaultThemeConfig,
    artists,
    reviews: toSiteReviews(getStudioReviews(id)),
    fromDb: false,
  };
}
