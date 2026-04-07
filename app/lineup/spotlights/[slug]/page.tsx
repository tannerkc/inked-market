import { notFound } from "next/navigation";
import { SpotlightArticle } from "@/components/lineup";
import { getSpotlightBySlug, getAllSpotlights } from "@/lib/data/lineup";

interface SpotlightPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSpotlights().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: SpotlightPageProps) {
  const { slug } = await params;
  const spotlight = getSpotlightBySlug(slug);
  if (!spotlight) return { title: "Spotlight Not Found | Inked Market" };

  return {
    title: `${spotlight.name} — ${spotlight.tagline} | The Line Up`,
    description: spotlight.excerpt,
  };
}

export default async function SpotlightPage({ params }: SpotlightPageProps) {
  const { slug } = await params;
  const spotlight = getSpotlightBySlug(slug);

  if (!spotlight) notFound();

  const related = getAllSpotlights()
    .filter((s) => s.slug !== slug)
    .slice(0, 3);

  return (
    <div className="bg-ink-black text-ink-cream">
      <SpotlightArticle spotlight={spotlight} relatedSpotlights={related} />
    </div>
  );
}
