import { notFound } from "next/navigation";
import { SpotlightArticle } from "@/components/lineup";
import { SampleBadge } from "@/components/ui/sample-badge";
import { createClient } from "@/lib/supabase/server";
import { getSpotlightBySlug, getAllSpotlights } from "@/lib/data/lineup";
import {
  getSpotlightBySlugFromDb,
  getAllSpotlightsFromDb,
} from "@/lib/data/supabase-lineup";
import type { LineupSpotlight } from "@/lib/types/lineup";

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface SpotlightPageProps {
  params: Promise<{ slug: string }>;
}

// Mock slugs as a static-params fallback; dynamic params still render on demand.
export async function generateStaticParams() {
  return getAllSpotlights().map((s) => ({ slug: s.slug }));
}

/**
 * Resolve a spotlight + its related list, DB-first with mock fallback.
 * `isSample` is true when the rendered spotlight came from mock data.
 */
async function loadSpotlight(slug: string): Promise<{
  spotlight: LineupSpotlight | null;
  related: LineupSpotlight[];
  isSample: boolean;
}> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const dbSpotlight = await getSpotlightBySlugFromDb(supabase, slug);
      if (dbSpotlight) {
        const all = await getAllSpotlightsFromDb(supabase);
        const related = all.filter((s) => s.slug !== slug).slice(0, 3);
        return { spotlight: dbSpotlight, related, isSample: false };
      }
    } catch {
      // fall through to mock
    }
  }

  const mock = getSpotlightBySlug(slug) ?? null;
  const related = getAllSpotlights()
    .filter((s) => s.slug !== slug)
    .slice(0, 3);
  return { spotlight: mock, related, isSample: true };
}

export async function generateMetadata({ params }: SpotlightPageProps) {
  const { slug } = await params;
  const { spotlight } = await loadSpotlight(slug);
  if (!spotlight) return { title: "Spotlight Not Found | Inked Market" };

  return {
    title: `${spotlight.name} — ${spotlight.tagline} | The Line Up`,
    description: spotlight.excerpt,
  };
}

export default async function SpotlightPage({ params }: SpotlightPageProps) {
  const { slug } = await params;
  const { spotlight, related, isSample } = await loadSpotlight(slug);

  if (!spotlight) notFound();

  return (
    <div className="bg-ink-black text-ink-cream">
      {isSample && (
        <div className="flex justify-center pt-4">
          <SampleBadge label="Sample Spotlight" />
        </div>
      )}
      <SpotlightArticle spotlight={spotlight} relatedSpotlights={related} />
    </div>
  );
}
