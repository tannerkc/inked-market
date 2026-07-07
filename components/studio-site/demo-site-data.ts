import type { StudioData } from "@/lib/repositories/types";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import {
  studioSiteDataFromStudioData,
  type StudioSiteArtist,
  type StudioSiteData,
  type StudioSiteReview,
} from "./studio-site-data";

/**
 * Demo roster + reviews the BUILDER injects so its preview is identical to the
 * pre-refactor mock. Migrated verbatim from the old MOCK_ARTISTS (artist-strips-
 * section) and MOCK_REVIEWS (details-section) constants. The public studio page
 * feeds real data instead, so these never ship to a live site.
 */

export const DEMO_SITE_ARTISTS: StudioSiteArtist[] = [
  {
    id: "1",
    name: "Jake Morrison",
    initials: "JM",
    styles: ["Traditional", "Neo-Traditional"],
    photoCount: 43,
    photos: Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1) })),
  },
  {
    id: "2",
    name: "Sarah Chen",
    initials: "SC",
    styles: ["Fine Line", "Minimalist"],
    photoCount: 28,
    photos: Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1) })),
  },
  {
    id: "3",
    name: "Marcus Reyes",
    initials: "MR",
    styles: ["Japanese", "Blackwork"],
    photoCount: 61,
    photos: Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1) })),
  },
];

/** Display rating the builder preview showed hardcoded — kept for visual parity. */
export const DEMO_SITE_RATING_AVERAGE = "4.9";

/** Real earned content fetched by the builder (roster, reviews) in live mode. */
export interface LiveExtras {
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  ratingAverage?: string;
  reviewCount?: number;
}

/**
 * The builder's site data. THE truth-model gate:
 *   Sample ON  → mock studio + full demo roster/reviews/rating (never on live sites)
 *   Sample OFF → the studio's real data + real fetched extras; empties stay empty
 */
export function buildBuilderSiteData(
  studio: StudioData | null,
  useMockData: boolean,
  live?: LiveExtras,
): StudioSiteData {
  if (useMockData) {
    return {
      ...studioSiteDataFromStudioData(MOCK_STUDIO_DATA, {
        artists: DEMO_SITE_ARTISTS,
        reviews: DEMO_SITE_REVIEWS,
      }),
      ratingAverage: DEMO_SITE_RATING_AVERAGE,
      reviewCount: DEMO_SITE_REVIEWS.length,
      isSample: true,
    };
  }
  return {
    ...studioSiteDataFromStudioData(studio, {
      artists: live?.artists ?? [],
      reviews: live?.reviews ?? [],
    }),
    ratingAverage: live?.ratingAverage,
    reviewCount: live?.reviewCount ?? 0,
  };
}

export const DEMO_SITE_REVIEWS: StudioSiteReview[] = [
  { author: "Megan R.", stars: 5, text: "Jake did an incredible traditional rose sleeve on me. The line work is perfect and healed beautifully." },
  { author: "Daniel S.", stars: 5, text: "Sarah's fine line work is unmatched. Got a botanical piece on my forearm — exactly what I envisioned." },
  { author: "Priya K.", stars: 4, text: "Amazing work overall. Marcus did a gorgeous Japanese sleeve start and I'll definitely be back." },
  { author: "Chris M.", stars: 5, text: "Lin's geometric sleeve is stunning. The precision is unreal. Worth every penny and the wait time." },
  { author: "Alicia T.", stars: 5, text: "Second session with Marcus — the Japanese koi piece is coming along beautifully. Super professional studio." },
  { author: "James L.", stars: 4, text: "Great experience. Parking can be tricky on weekends but the work speaks for itself." },
  { author: "Taylor B.", stars: 5, text: "Sarah did a fine line botanical sleeve that turned out better than I imagined. Booked for the next one." },
  { author: "Jordan M.", stars: 5, text: "Third time here — Jake's color work is on another level. The studio is always clean and welcoming." },
];
