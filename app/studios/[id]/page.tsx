import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStudioForPage } from "@/lib/data/studio-page";
import { studioSiteDataFromStudio } from "@/components/studio-site/studio-site-data";
import { StudioSitePublic } from "@/components/studio-site/studio-site-public";
import { StudioProfileBasic } from "@/components/studio-site/studio-profile-basic";
import { SampleBadge } from "@/components/ui/sample-badge";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getStudioForPage(id);
  if (!result) return { title: "Studio Not Found | Inked Market" };
  const { studio } = result;
  return {
    title: `${studio.name} — Tattoo Studio | Inked Market`,
    description: studio.description || studio.bio?.slice(0, 160) || undefined,
  };
}

export default async function StudioPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getStudioForPage(id);
  if (!result) notFound();

  const { studio, config, hasPublishedSite, artists, reviews, rawReviews, fromDb } = result;
  const data = studioSiteDataFromStudio(studio, {
    artists,
    reviews,
    bookingLink: result.studioBookingLink,
  });

  return (
    <>
      {!fromDb ? (
        <div className="fixed bottom-4 right-4 z-[60]">
          <SampleBadge label="Sample studio" />
        </div>
      ) : null}
      {hasPublishedSite ? (
        <StudioSitePublic config={config} data={data} />
      ) : (
        <StudioProfileBasic studio={studio} data={data} reviews={rawReviews} />
      )}
    </>
  );
}
