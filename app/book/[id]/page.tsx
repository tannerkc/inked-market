import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getArtistByIdFromDb, getArtistBySlugFromDb } from "@/lib/data/supabase-artists";
import { fetchBookingSettings } from "@/lib/data/supabase-booking";
import { BookingRequestFlow } from "@/components/booking";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Request a booking | Inked Market" };

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const artist =
    (await getArtistByIdFromDb(supabase, id)) ?? (await getArtistBySlugFromDb(supabase, id));
  if (!artist) notFound();

  const settings = await fetchBookingSettings(supabase, { artistId: artist.id });
  const open = Boolean(settings?.acceptingBookings && settings?.customRequestsEnabled);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <BookingRequestFlow artistId={artist.id} artistName={artist.name} acceptingRequests={open} />
    </main>
  );
}
