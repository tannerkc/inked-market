"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GrantedArtist {
  id: string;
  name: string;
}

/** Studio context for the front desk: studio id + artists who granted booking. */
export function useFrontDesk() {
  const [studioId, setStudioId] = useState<string | null>(null);
  const [grantedArtists, setGrantedArtists] = useState<GrantedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data: studio } = await supabase
        .from("studios")
        .select("id")
        .eq("claimed_by", user.id)
        .maybeSingle();
      if (cancelled || !studio) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data: grants } = await supabase
        .from("affiliations")
        .select("artists(id, name)")
        .eq("studio_id", studio.id)
        .eq("status", "active")
        .eq("manage_bookings", true);
      if (cancelled) return;
      const artists = ((grants ?? []) as unknown as { artists: GrantedArtist | null }[])
        .map((g) => g.artists)
        .filter((a): a is GrantedArtist => Boolean(a));
      setStudioId(studio.id);
      setGrantedArtists(artists);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { studioId, grantedArtists, loading };
}
