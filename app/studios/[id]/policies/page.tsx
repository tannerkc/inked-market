import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getStudioForPage } from "@/lib/data/studio-page";
import { studioSiteDataFromStudio } from "@/components/studio-site/studio-site-data";
import { StudioSitePublic } from "@/components/studio-site/studio-site-public";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getStudioForPage(id);
  if (!result) return { title: "Policies | Inked Market" };
  return {
    title: `Policies — ${result.studio.name} | Inked Market`,
    description: `Studio policies for ${result.studio.name}`,
  };
}

export default async function PoliciesPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getStudioForPage(id);
  // Policies is a subpage of the custom site — no published site, no policies.
  if (!result || !result.hasPublishedSite) notFound();

  // Canonicalize: id-based URLs forward to the pretty slug.
  if (result.fromDb && result.studio.slug && id !== result.studio.slug) {
    redirect(`/studios/${result.studio.slug}/policies`);
  }

  const { studio, config, artists, reviews } = result;
  const data = studioSiteDataFromStudio(studio, { artists, reviews });

  return <StudioSitePublic config={config} data={data} initialPage="policies" />;
}
