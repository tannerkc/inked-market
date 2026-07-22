import { createClient } from "@/lib/supabase/server";
import { getDiscoverStudios } from "@/lib/data/supabase-studios";
import { getDiscoverArtists } from "@/lib/data/supabase-artists";
import { mockStudios, mockArtists } from "@/lib/data/discover";
import { DiscoverPageContent } from "@/components/discover/discover-page-content";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function DiscoverPage() {
  let studios = mockStudios; // Fallback to mock data if Supabase isn't configured
  let artists = mockArtists;
  let studiosAreSample = true;
  let artistsAreSample = true;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const [dbStudios, dbArtists] = await Promise.all([
        getDiscoverStudios(supabase),
        getDiscoverArtists(supabase),
      ]);
      if (dbStudios.length > 0) {
        studios = dbStudios;
        studiosAreSample = false;
      }
      if (dbArtists.length > 0) {
        artists = dbArtists;
        artistsAreSample = false;
      }
    }
  } catch {
    // Supabase not configured yet — gracefully fall back to mock data
  }

  return (
    <DiscoverPageContent
      studios={studios}
      artists={artists}
      studiosAreSample={studiosAreSample}
      artistsAreSample={artistsAreSample}
    />
  );
}
