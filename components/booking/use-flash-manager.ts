"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteFlashItem,
  fetchOwnFlashItems,
  insertFlashItem,
  resolveBookingEntity,
  setFlashItemActive,
} from "@/lib/data/supabase-booking";
import { uploadBookingReference } from "@/lib/utils/image-upload";
import type { FlashItem } from "@/lib/types/booking";

export function useFlashManager() {
  const supabaseRef = useRef(createClient());
  const artistIdRef = useRef<string | null>(null);
  const [items, setItems] = useState<FlashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const rows = await fetchOwnFlashItems(supabase, entity.artistId);
      if (cancelled) return;
      setItems(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback(
    async (input: {
      file: File;
      title: string;
      priceCents: number;
      depositCents: number;
      durationMin: number;
      oneOff: boolean;
    }) => {
      const artistId = artistIdRef.current;
      if (!artistId) return false;
      setAdding(true);
      setError(null);
      try {
        const supabase = supabaseRef.current;
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Sign in first.");
        const uploaded = await uploadBookingReference(supabase, auth.user.id, input.file);
        if (!uploaded.ok) throw new Error(uploaded.error);
        const item = await insertFlashItem(supabase, artistId, {
          title: input.title,
          imageUrl: uploaded.url,
          priceCents: input.priceCents,
          depositCents: input.depositCents,
          durationMin: input.durationMin,
          oneOff: input.oneOff,
        });
        setItems((prev) => [item, ...prev]);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add flash.");
        return false;
      } finally {
        setAdding(false);
      }
    },
    []
  );

  const toggleActive = useCallback(async (item: FlashItem) => {
    await setFlashItemActive(supabaseRef.current, item.id, !item.active);
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, active: !item.active } : x)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteFlashItem(supabaseRef.current, id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { items, loading, add, toggleActive, remove, adding, error };
}
