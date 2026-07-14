"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDefaultAvailability } from "@/lib/data/dashboard";
import {
  addBlockedDate,
  fetchAvailability,
  fetchBookingSettings,
  removeOverride,
  replaceWeeklyRules,
  resolveBookingEntity,
  saveBookingSettings,
} from "@/lib/data/supabase-booking";
import { rulesToWeekly } from "@/lib/supabase/booking-types";
import type { WeeklyAvailability } from "@/lib/types";
import type { AvailabilityOverride, BookingEntityRef } from "@/lib/types/booking";

export function useWeeklyAvailability() {
  const supabaseRef = useRef(createClient());
  const entityRef = useRef<BookingEntityRef | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [takingBookings, setTakingBookings] = useState(true);
  const [availability, setAvailability] = useState<WeeklyAvailability>(getDefaultAvailability);
  const [blockedDates, setBlockedDates] = useState<AvailabilityOverride[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const entity = await resolveBookingEntity(supabase);
      if (cancelled || !entity) return;
      entityRef.current = entity;
      const [{ rules, overrides }, settings] = await Promise.all([
        fetchAvailability(supabase, entity),
        fetchBookingSettings(supabase, entity),
      ]);
      if (cancelled) return;
      if (rules.length > 0) {
        setAvailability(rulesToWeekly(rules, getDefaultAvailability()));
      }
      setBlockedDates(overrides.filter((o) => o.closed));
      if (settings) setTakingBookings(settings.acceptingBookings);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleDay = (day: string, enabled: boolean) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return { ...prev, [day]: { ...current, enabled } };
    });
  };

  const handleAddSlot = (day: string) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: { ...current, slots: [...current.slots, { start: "10:00 AM", end: "6:00 PM" }] },
      };
    });
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: { ...current, slots: current.slots.filter((_, i) => i !== index) },
      };
    });
  };

  const handleUpdateSlot = (day: string, index: number, field: "start" | "end", value: string) => {
    setAvailability((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: {
          ...current,
          slots: current.slots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
        },
      };
    });
  };

  const saveAvailability = useCallback(async () => {
    const entity = entityRef.current;
    if (!entity) return;
    setSavingAvailability(true);
    try {
      await Promise.all([
        replaceWeeklyRules(supabaseRef.current, entity, availability),
        saveBookingSettings(supabaseRef.current, entity, { acceptingBookings: takingBookings }),
      ]);
    } finally {
      setSavingAvailability(false);
    }
  }, [availability, takingBookings]);

  const addBlocked = useCallback(async (date: string) => {
    const entity = entityRef.current;
    if (!entity || !date) return;
    const created = await addBlockedDate(supabaseRef.current, entity, date);
    setBlockedDates((prev) =>
      [...prev.filter((o) => o.date !== created.date), created].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
  }, []);

  const removeBlocked = useCallback(async (id: string) => {
    await removeOverride(supabaseRef.current, id);
    setBlockedDates((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return {
    availabilityOpen,
    setAvailabilityOpen,
    takingBookings,
    setTakingBookings,
    availability,
    handleToggleDay,
    handleAddSlot,
    handleRemoveSlot,
    handleUpdateSlot,
    saveAvailability,
    savingAvailability,
    blockedDates,
    addBlocked,
    removeBlocked,
  };
}
