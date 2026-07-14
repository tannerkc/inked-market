"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchArtistUpcomingAppointments,
  resolveBookingEntity,
} from "@/lib/data/supabase-booking";
import type { AppointmentRecord } from "@/lib/types/booking";

export function useArtistUpcoming() {
  const supabaseRef = useRef(createClient());
  const artistIdRef = useRef<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const entity = await resolveBookingEntity(supabase);
      if (cancelled) return;
      if (!entity?.artistId) {
        setLoading(false);
        return;
      }
      artistIdRef.current = entity.artistId;
      const rows = await fetchArtistUpcomingAppointments(supabase, entity.artistId);
      if (cancelled) return;
      setAppointments(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const artistId = artistIdRef.current;
    if (!artistId) return;
    setAppointments(await fetchArtistUpcomingAppointments(supabaseRef.current, artistId));
  }, []);

  return { appointments, loading, refresh };
}
