"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getStudioDashboardData, getArtistSearchResults, getStudioRoster } from "@/lib/data/dashboard";
import { computeAutoSpecialties } from "@/lib/utils/compute-auto-specialties";
import type { Affiliation, StudioService } from "@/lib/types";

export function useStudioDashboard() {
  const { user, updateUser } = useAuth();

  const mockData = getStudioDashboardData();
  const data = {
    ...mockData,
    name: user?.studioName || "",
    subtitle: user?.city && user?.state ? `${user.city}, ${user.state}${user.phone ? ` · ${user.phone}` : ""}` : "",
    tags: user?.specialties || [],
  };

  // Panel open/close
  const [editStudioOpen, setEditStudioOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<"invite" | "roster">("invite");

  // Studio form
  const [studioForm, setStudioForm] = useState({
    name: user?.studioName || "",
    city: user?.city || "",
    state: user?.state || "",
    phone: user?.phone || "",
    email: user?.email || "",
    specialties: user?.specialties || [] as string[],
    instagram: user?.instagram || "",
    website: user?.website || "",
    tiktok: user?.tiktok || "",
  });

  // Auto-specialties
  const [autoSpecialties, setAutoSpecialties] = useState(user?.autoSpecialties ?? false);

  // Services (walk-ins, piercing)
  const [services, setServices] = useState<StudioService[]>(user?.services ?? []);

  // Business hours
  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    Monday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    Tuesday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    Wednesday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    Thursday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    Friday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    Saturday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    Sunday: { open: "10:00 AM", close: "6:00 PM", closed: true },
  });
  const [hoursSaved, setHoursSaved] = useState(false);

  // Artist management
  const [artistSearch, setArtistSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [roster, setRoster] = useState<Affiliation[]>(getStudioRoster());

  const allArtists = getArtistSearchResults();
  const filteredArtists = artistSearch
    ? allArtists.filter(
        (a) =>
          a.name.toLowerCase().includes(artistSearch.toLowerCase()) ||
          a.styles.some((s) => s.toLowerCase().includes(artistSearch.toLowerCase()))
      )
    : allArtists;

  const handleToggleDay = (day: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }));
  };

  const handleUpdateHour = (day: string, field: "open" | "close", value: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveHours = () => {
    setHoursSaved(true);
    setHoursOpen(false);
  };

  const handleInviteArtist = (artist: { id: string; name: string; avatarUrl?: string; styles: string[] }) => {
    if (!roster.find((r) => r.id === artist.id)) {
      setRoster((prev) => [...prev, { id: artist.id, name: artist.name, avatarUrl: artist.avatarUrl, styles: artist.styles, status: "pending-invite" as const, role: "artist" as const }]);
    }
  };

  const handleSendEmailInvite = () => {
    if (inviteEmail.trim()) {
      const id = `email-${Date.now()}`;
      setRoster((prev) => [...prev, { id, name: inviteEmail.trim(), status: "pending-invite" as const, role: "artist" as const }]);
      setInviteEmail("");
    }
  };

  const handleAcceptRequest = (id: string) => {
    setRoster((prev) => prev.map((r) => r.id === id ? { ...r, status: "active" as const } : r));
  };

  const handleDeclineOrRemove = (id: string) => {
    setRoster((prev) => prev.filter((r) => r.id !== id));
  };

  // Recompute specialties when roster changes and auto mode is on
  useEffect(() => {
    if (!autoSpecialties) return;
    const computed = computeAutoSpecialties(roster);
    setStudioForm((prev) => ({ ...prev, specialties: computed }));
  }, [roster, autoSpecialties]);

  const handleToggleAutoSpecialties = () => {
    const next = !autoSpecialties;
    setAutoSpecialties(next);
    updateUser({ autoSpecialties: next });
    if (next) {
      const computed = computeAutoSpecialties(roster);
      setStudioForm((prev) => ({ ...prev, specialties: computed }));
      updateUser({ autoSpecialties: next, specialties: computed });
    }
  };

  const handleToggleService = (service: StudioService) => {
    const next = services.includes(service)
      ? services.filter((s) => s !== service)
      : [...services, service];
    setServices(next);
    updateUser({ services: next });
  };

  const handleSaveStudio = () => {
    updateUser({
      studioName: studioForm.name,
      city: studioForm.city,
      state: studioForm.state,
      phone: studioForm.phone,
      email: studioForm.email,
      specialties: studioForm.specialties,
      instagram: studioForm.instagram,
      website: studioForm.website,
      tiktok: studioForm.tiktok,
    });
    setEditStudioOpen(false);
  };

  return {
    data,
    user,
    // Panels
    editStudioOpen,
    setEditStudioOpen,
    hoursOpen,
    setHoursOpen,
    inviteOpen,
    setInviteOpen,
    inviteTab,
    setInviteTab,
    // Studio form
    studioForm,
    setStudioForm,
    handleSaveStudio,
    // Auto-specialties
    autoSpecialties,
    handleToggleAutoSpecialties,
    // Services
    services,
    handleToggleService,
    // Business hours
    businessHours,
    hoursSaved,
    handleToggleDay,
    handleUpdateHour,
    handleSaveHours,
    // Artist management
    artistSearch,
    setArtistSearch,
    inviteEmail,
    setInviteEmail,
    roster,
    filteredArtists,
    handleInviteArtist,
    handleSendEmailInvite,
    handleAcceptRequest,
    handleDeclineOrRemove,
  };
}
