"use client";

import { useState } from "react";
import type { BusinessHours, StudioData } from "@/lib/repositories";

const DEFAULT_HOURS: BusinessHours = {
  Monday: { open: "10:00 AM", close: "6:00 PM", closed: false },
  Tuesday: { open: "10:00 AM", close: "6:00 PM", closed: false },
  Wednesday: { open: "10:00 AM", close: "6:00 PM", closed: false },
  Thursday: { open: "10:00 AM", close: "6:00 PM", closed: false },
  Friday: { open: "10:00 AM", close: "6:00 PM", closed: false },
  Saturday: { open: "10:00 AM", close: "6:00 PM", closed: false },
  Sunday: { open: "10:00 AM", close: "6:00 PM", closed: true },
};

export function useBusinessHours(
  studio: StudioData | null,
  update: (partial: Partial<StudioData>) => Promise<void>
) {
  const [hoursOpen, setHoursOpen] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(studio?.hours ?? DEFAULT_HOURS);
  const [hoursSaved, setHoursSaved] = useState(false);

  const loadFromStudio = (s: StudioData) => {
    if (s.hours) {
      setBusinessHours(s.hours);
      setHoursSaved(true);
    }
  };

  const handleToggleDay = (day: string) => {
    setBusinessHours((prev) => {
      const current = prev[day] ?? DEFAULT_HOURS[day]!;
      return { ...prev, [day]: { ...current, closed: !current.closed } };
    });
  };

  const handleUpdateHour = (day: string, field: "open" | "close", value: string) => {
    setBusinessHours((prev) => {
      const current = prev[day] ?? DEFAULT_HOURS[day]!;
      return { ...prev, [day]: { ...current, [field]: value } };
    });
  };

  const handleSaveHours = () => {
    update({ hours: businessHours });
    setHoursSaved(true);
    setHoursOpen(false);
  };

  return {
    hoursOpen,
    setHoursOpen,
    businessHours,
    hoursSaved,
    loadFromStudio,
    handleToggleDay,
    handleUpdateHour,
    handleSaveHours,
  };
}
