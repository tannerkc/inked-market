import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArtistByIdFromDb, getArtistBySlugFromDb } from "@/lib/data/supabase-artists";
import {
  fetchActiveFlashItems,
  fetchBookableRoster,
  fetchBookingSettings,
} from "@/lib/data/supabase-booking";
import { bookingCtaFor } from "@/lib/booking/flows";
import { BookingFlow } from "@/components/booking";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Book | Inked Market" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Artist target first (by id or slug), then studio target.
  const artist =
    (await getArtistByIdFromDb(supabase, id)) ?? (await getArtistBySlugFromDb(supabase, id));
  if (artist) {
    // Canonicalize: id-based URLs forward to the pretty slug.
    if (artist.slug && id !== artist.slug) redirect(`/book/${artist.slug}`);
    const settings = await fetchBookingSettings(supabase, { artistId: artist.id });
    const cta = bookingCtaFor(settings);
    const flashItems =
      cta.kind === "inbuilt" && settings?.flashEnabled
        ? await fetchActiveFlashItems(supabase, artist.id)
        : [];
    return (
      <main className="mx-auto max-w-2xl px-4 pb-10 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
        <BookingFlow
          entity={{ artistId: artist.id }}
          entityName={artist.name}
          settings={settings}
          flashItems={flashItems}
          cta={cta}
          avatarUrl={artist.profileImage || undefined}
        />
      </main>
    );
  }

  const { data: studio } = UUID_RE.test(id)
    ? await supabase.from("studios").select("id, name, slug").eq("id", id).maybeSingle()
    : await supabase.from("studios").select("id, name, slug").eq("slug", id).maybeSingle();
  if (!studio) notFound();

  // Canonicalize: id-based URLs forward to the pretty slug.
  if (studio.slug && id !== studio.slug) redirect(`/book/${studio.slug}`);

  const settings = await fetchBookingSettings(supabase, { studioId: studio.id });
  const cta = bookingCtaFor(settings);
  const roster =
    cta.kind === "inbuilt" && settings?.customRequestsEnabled
      ? await fetchBookableRoster(supabase, studio.id)
      : [];
  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
      <BookingFlow
        entity={{ studioId: studio.id }}
        entityName={studio.name}
        settings={settings}
        flashItems={[]}
        cta={cta}
        roster={roster}
      />
    </main>
  );
}
