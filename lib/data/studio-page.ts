import { defaultThemeConfig } from "@/lib/data/theme-presets";
import { bookPath, profilePath } from "@/lib/utils";
import { remapLegacyTemplate } from "@/lib/utils/legacy-template";
import type { StudioThemeConfig } from "@/lib/types/builder";
import type { Studio, Review } from "@/lib/types";
import {
  getStudioByIdFromDb,
  getStudioBySlugFromDb,
} from "@/lib/data/supabase-studios";
import { getArtistsForStudio } from "@/lib/data/supabase-artists";
import { fetchBookHrefs, fetchBookingSettings } from "@/lib/data/supabase-booking";
import { bookingCtaFor } from "@/lib/booking/flows";
import { getReviewsForTarget } from "@/lib/data/supabase-reviews";
import { getStudio, getStudioReviews } from "@/lib/data/shops";
import type {
  StudioSiteArtist,
  StudioSiteReview,
} from "@/components/studio-site/studio-site-data";

export interface StudioPageData {
  studio: Studio;
  config: StudioThemeConfig;
  /** True when the studio has published a custom builder site (Shader/Magnum).
   *  False → the route renders the basic profile-style listing instead. */
  hasPublishedSite: boolean;
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  /** Full Review objects — the basic profile's ReviewPanel needs these. */
  rawReviews: Review[];
  /** booking_mode-aware studio CTA: external link, null = suppress legacy
   *  integrations link, undefined = no settings row (legacy behavior). */
  studioBookingLink?: { url: string; platformName: string } | null;
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
        const bookHrefs = await fetchBookHrefs(supabase, rosterIds);
        const artists: StudioSiteArtist[] = roster.map((a) => {
          const thumbs = thumbsByArtist.get(a.id) ?? [];
          return {
            id: a.id,
            name: a.name,
            initials: initialsOf(a.name),
            styles: a.specialties.slice(0, 3),
            photoCount: thumbs.length,
            photos: thumbs,
            profileHref: profilePath("artist", a),
            bookHref: bookHrefs.get(a.id),
          };
        });
        // The public site renders only what Publish stamped live — the working
        // draft (theme_config) is never shown here. No published theme = the
        // basic profile listing.
        // Studio-level CTA honors the explicit booking mode: inbuilt surfaces
        // the internal /book flow, external surfaces the studio's own link,
        // off (or unchosen) suppresses the legacy integrations-derived link.
        // No settings row keeps legacy behavior (undefined).
        const studioSettings = await fetchBookingSettings(supabase, { studioId: studio.id });
        const studioCta = bookingCtaFor(studioSettings);
        const studioBookingLink = !studioSettings
          ? undefined
          : studioCta.kind === "inbuilt"
            ? { url: bookPath(studio), platformName: "Inked Market" }
            : studioCta.kind === "external"
              ? { url: studioCta.url, platformName: studioCta.domain }
              : null;

        return {
          studio,
          config: studio.publishedThemeConfig
            ? remapLegacyTemplate(studio.publishedThemeConfig)
            : defaultThemeConfig,
          hasPublishedSite: Boolean(studio.publishedThemeConfig),
          artists,
          reviews: toSiteReviews(reviews),
          rawReviews: reviews,
          studioBookingLink,
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
    profileHref: profilePath("artist", a),
    // Mock artists have no live booking settings — no Book link.
  }));
  const mockReviews = getStudioReviews(id);
  return {
    studio,
    config: defaultThemeConfig,
    // Sample studios always demo the full themed site (badge marks them).
    hasPublishedSite: true,
    artists,
    reviews: toSiteReviews(mockReviews),
    rawReviews: mockReviews,
    studioBookingLink: undefined,
    fromDb: false,
  };
}
