import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArtistByIdFromDb, getArtistBySlugFromDb } from "@/lib/data/supabase-artists";
import { fetchActiveFlashItems, fetchBookingSettings } from "@/lib/data/supabase-booking";
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
    const settings = await fetchBookingSettings(supabase, { artistId: artist.id });
    const cta = bookingCtaFor(settings);
    const flashItems =
      cta.kind === "inbuilt" && settings?.flashEnabled
        ? await fetchActiveFlashItems(supabase, artist.id)
        : [];
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <BookingFlow
          entity={{ artistId: artist.id }}
          entityName={artist.name}
          settings={settings}
          flashItems={flashItems}
          cta={cta}
        />
      </main>
    );
  }

  const { data: studio } = UUID_RE.test(id)
    ? await supabase.from("studios").select("id, name").eq("id", id).maybeSingle()
    : await supabase.from("studios").select("id, name").eq("slug", id).maybeSingle();
  if (!studio) notFound();

  const settings = await fetchBookingSettings(supabase, { studioId: studio.id });
  const cta = bookingCtaFor(settings);
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <BookingFlow
        entity={{ studioId: studio.id }}
        entityName={studio.name}
        settings={settings}
        flashItems={[]}
        cta={cta}
      />
    </main>
  );
}
