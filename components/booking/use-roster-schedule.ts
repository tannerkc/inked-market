"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRosterArtistRows } from "@/lib/data/supabase-artists";
import { fetchRosterAppointments } from "@/lib/data/supabase-booking";
import type { AppointmentRecord } from "@/lib/types/booking";

export interface RosterScheduleEntry {
  appointment: AppointmentRecord;
  artistName: string;
  colorIndex: number;
}

/** Studio-wide upcoming schedule: roster artists' bookings + studio walk-ins. */
export function useRosterSchedule() {
  const [entries, setEntries] = useState<RosterScheduleEntry[]>([]);
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
      const roster = await getRosterArtistRows(supabase, studio.id);
      if (cancelled) return;
      const colorByArtist = new Map<string, number>(roster.map((a, i) => [a.id, i % 6]));
      const nameByArtist = new Map<string, string>(roster.map((a) => [a.id, a.name]));
      const appointments = await fetchRosterAppointments(
        supabase,
        studio.id,
        roster.map((a) => a.id)
      );
      if (cancelled) return;
      setEntries(
        appointments.map((appointment) => ({
          appointment,
          artistName: appointment.artistId
            ? nameByArtist.get(appointment.artistId) ?? appointment.artistName ?? "Artist"
            : "Walk-in",
          colorIndex: appointment.artistId ? colorByArtist.get(appointment.artistId) ?? 5 : 5,
        }))
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, loading };
}
