"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchArtistRequests,
  fetchStudioRequests,
  resolveBookingEntity,
} from "@/lib/data/supabase-booking";
import { respondToBookingRequest } from "@/app/book/actions";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { BookingRequestRecord } from "@/lib/types/booking";
import type { RespondToRequestInput } from "@/lib/validation/schemas";

export function useArtistRequests() {
  const supabaseRef = useRef(createClient());
  const [requests, setRequests] = useState<BookingRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BookingRequestRecord | null>(null);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = supabaseRef.current;
    const entity = await resolveBookingEntity(supabase);
    if (entity?.artistId) {
      setRequests(await fetchArtistRequests(supabase, entity.artistId));
    } else if (entity?.studioId) {
      setRequests(await fetchStudioRequests(supabase, entity.studioId));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const entity = await resolveBookingEntity(supabase);
      if (cancelled) return;
      let rows: BookingRequestRecord[] = [];
      if (entity?.artistId) {
        rows = await fetchArtistRequests(supabase, entity.artistId);
      } else if (entity?.studioId) {
        rows = await fetchStudioRequests(supabase, entity.studioId);
      }
      if (cancelled) return;
      setRequests(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { pending, others } = useMemo(() => {
    const now = new Date();
    return {
      pending: requests.filter((r) => effectiveRequestStatus(r, now) === "pending"),
      others: requests.filter((r) => effectiveRequestStatus(r, now) !== "pending"),
    };
  }, [requests]);

  const respond = useCallback(
    async (input: RespondToRequestInput) => {
      setResponding(true);
      setError(null);
      const result = await respondToBookingRequest(input);
      setResponding(false);
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return false;
      }
      setSelected(null);
      await load();
      return true;
    },
    [load]
  );

  return { pending, others, loading, selected, setSelected, respond, responding, error };
}
