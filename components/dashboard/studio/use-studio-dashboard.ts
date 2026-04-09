"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useStudio } from "@/lib/providers/studio-provider";
import { getStudioDashboardData, getArtistSearchResults, getStudioRoster } from "@/lib/data/dashboard";
import { computeAutoSpecialties } from "@/lib/utils/compute-auto-specialties";
import type { Affiliation, StudioService } from "@/lib/types";

export function useStudioDashboard() {
  const { user } = useAuth();
  const { studio, update } = useStudio();

  const mockData = getStudioDashboardData();
  const data = {
    ...mockData,
    name: studio?.name ?? "",
    subtitle: studio?.city && studio?.state
      ? `${studio.city}, ${studio.state}${studio.phone ? ` · ${studio.phone}` : ""}`
      : "",
    tags: studio?.specialties ?? [],
  };

  // Panel open/close
  const [editStudioOpen, setEditStudioOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<"invite" | "roster">("invite");

  // Studio form
  const [studioForm, setStudioForm] = useState({
    name: studio?.name ?? "",
    city: studio?.city ?? "",
    state: studio?.state ?? "",
    phone: studio?.phone ?? "",
    email: studio?.email ?? "",
    address: studio?.address ?? "",
    zipCode: studio?.zipCode ?? "",
    bio: studio?.bio ?? "",
    specialties: studio?.specialties ?? [] as string[],
    instagram: studio?.instagram ?? "",
    website: studio?.website ?? "",
    tiktok: studio?.tiktok ?? "",
  });

  // Auto-specialties
  const [autoSpecialties, setAutoSpecialties] = useState(studio?.autoSpecialties ?? false);

  // Services (walk-ins, piercing)
  const [services, setServices] = useState<StudioService[]>(studio?.services ?? []);

  // Business hours
  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(
    studio?.hours ?? {
      Monday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Tuesday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Wednesday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Thursday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Friday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Saturday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Sunday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    }
  );
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
    update({ hours: businessHours });
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

  // Sync form state once when studio data loads from the repository.
  // `useState` initializers run before the async repo.get() resolves,
  // so studio is null at mount. This effect runs exactly once when it arrives.
  const initialized = useRef(false);
  useEffect(() => {
    if (!studio || initialized.current) return;
    initialized.current = true;
    setStudioForm({
      name: studio.name ?? "",
      city: studio.city ?? "",
      state: studio.state ?? "",
      phone: studio.phone ?? "",
      email: studio.email ?? "",
      address: studio.address ?? "",
      zipCode: studio.zipCode ?? "",
      bio: studio.bio ?? "",
      specialties: studio.specialties ?? [],
      instagram: studio.instagram ?? "",
      website: studio.website ?? "",
      tiktok: studio.tiktok ?? "",
    });
    setAutoSpecialties(studio.autoSpecialties ?? false);
    setServices(studio.services ?? []);
    if (studio.hours) {
      setBusinessHours(studio.hours);
      setHoursSaved(true);
    }
  }, [studio]);

  // Recompute specialties when roster changes and auto mode is on
  useEffect(() => {
    if (!autoSpecialties) return;
    const computed = computeAutoSpecialties(roster);
    setStudioForm((prev) => ({ ...prev, specialties: computed }));
  }, [roster, autoSpecialties]);

  const handleToggleAutoSpecialties = () => {
    const next = !autoSpecialties;
    setAutoSpecialties(next);
    if (next) {
      const computed = computeAutoSpecialties(roster);
      setStudioForm((prev) => ({ ...prev, specialties: computed }));
      update({ autoSpecialties: next, specialties: computed });
    } else {
      update({ autoSpecialties: next });
    }
  };

  const handleToggleService = (service: StudioService) => {
    const next = services.includes(service)
      ? services.filter((s) => s !== service)
      : [...services, service];
    setServices(next);
    update({ services: next });
  };

  const handleSaveStudio = () => {
    update({
      name: studioForm.name,
      city: studioForm.city,
      state: studioForm.state,
      phone: studioForm.phone,
      email: studioForm.email,
      address: studioForm.address,
      zipCode: studioForm.zipCode,
      bio: studioForm.bio,
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
