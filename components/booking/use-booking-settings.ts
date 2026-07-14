"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copyDefinedFields } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  fetchBookingSettings,
  fetchOwnGrantRows,
  resolveBookingEntity,
  saveBookingSettings,
  setManageBookings,
} from "@/lib/data/supabase-booking";
import {
  DEFAULT_BOOKING_SETTINGS,
  type BookingEntityRef,
  type BookingSettingsInput,
} from "@/lib/types/booking";

export interface GrantRow {
  id: string;
  manageBookings: boolean;
  studioName: string;
}

export function useBookingSettings() {
  const supabaseRef = useRef(createClient());
  const [entity, setEntity] = useState<BookingEntityRef | null>(null);
  const [settings, setSettings] = useState<BookingSettingsInput>(DEFAULT_BOOKING_SETTINGS);
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const resolved = await resolveBookingEntity(supabase);
      if (cancelled || !resolved) {
        if (!cancelled) setLoading(false);
        return;
      }
      const [existing, grantRows] = await Promise.all([
        fetchBookingSettings(supabase, resolved),
        resolved.artistId ? fetchOwnGrantRows(supabase, resolved.artistId) : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setEntity(resolved);
      setGrants(grantRows);
      if (existing) {
        setSettings((prev) => {
          const next: BookingSettingsInput = { ...prev };
          copyDefinedFields(next, existing, Object.keys(prev) as (keyof BookingSettingsInput)[]);
          return next;
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    <K extends keyof BookingSettingsInput>(key: K, value: BookingSettingsInput[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const save = useCallback(async () => {
    if (!entity) return;
    setSaving(true);
    setError(null);
    try {
      await saveBookingSettings(supabaseRef.current, entity, settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [entity, settings]);

  const toggleGrant = useCallback(async (id: string, value: boolean) => {
    await setManageBookings(supabaseRef.current, id, value);
    setGrants((prev) => prev.map((g) => (g.id === id ? { ...g, manageBookings: value } : g)));
  }, []);

  return { entity, settings, grants, toggleGrant, update, save, loading, saving, error };
}
