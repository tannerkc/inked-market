"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getArtistDashboardData, getDefaultAvailability, getStudioSearchResults } from "@/lib/data/dashboard";
import type { WeeklyAvailability, Affiliation } from "@/lib/types";

export function useArtistDashboard() {
  const { user, updateUser } = useAuth();

  const mockData = getArtistDashboardData();
  const data = {
    ...mockData,
    name: user?.name || "",
    tags: user?.styles || [],
  };

  // Bio state
  const [bioEditing, setBioEditing] = useState(false);
  const [bioText, setBioText] = useState("");

  // Panel open/close
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [findStudioOpen, setFindStudioOpen] = useState(false);

  // Availability state
  const [takingBookings, setTakingBookings] = useState(true);
  const [availability, setAvailability] = useState<WeeklyAvailability>(getDefaultAvailability());

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    location: user?.location || "",
    bio: user?.bio || "",
    styles: (user?.styles || []) as string[],
    instagram: user?.instagram || "",
    website: user?.website || "",
    tiktok: user?.tiktok || "",
  });

  // Studio affiliation
  const [studioSearch, setStudioSearch] = useState("");
  const [studioAffiliation, setStudioAffiliation] = useState<Affiliation | null>(null);

  const allStudios = getStudioSearchResults();
  const filteredStudios = studioSearch
    ? allStudios.filter(
        (s) =>
          s.name.toLowerCase().includes(studioSearch.toLowerCase()) ||
          s.location.toLowerCase().includes(studioSearch.toLowerCase())
      )
    : allStudios;

  const handleRequestToJoin = (studio: { id: string; name: string; avatarUrl?: string; location: string }) => {
    setStudioAffiliation({
      id: studio.id,
      name: studio.name,
      avatarUrl: studio.avatarUrl,
      status: "pending-request",
      role: "studio",
    });
    setFindStudioOpen(false);
  };

  const handleToggleDay = (day: string, enabled: boolean) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }));
  };

  const handleAddSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "10:00 AM", end: "6:00 PM" }],
      },
    }));
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateSlot = (day: string, index: number, field: "start" | "end", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleSaveProfile = () => {
    updateUser({
      name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      styles: profileForm.styles,
      location: profileForm.location,
      bio: profileForm.bio,
      instagram: profileForm.instagram,
      website: profileForm.website,
      tiktok: profileForm.tiktok,
    });
    setEditProfileOpen(false);
  };

  return {
    data,
    user,
    // Bio
    bioEditing,
    setBioEditing,
    bioText,
    setBioText,
    // Panels
    editProfileOpen,
    setEditProfileOpen,
    availabilityOpen,
    setAvailabilityOpen,
    findStudioOpen,
    setFindStudioOpen,
    // Availability
    takingBookings,
    setTakingBookings,
    availability,
    handleToggleDay,
    handleAddSlot,
    handleRemoveSlot,
    handleUpdateSlot,
    // Profile form
    profileForm,
    setProfileForm,
    handleSaveProfile,
    // Studio affiliation
    studioSearch,
    setStudioSearch,
    studioAffiliation,
    setStudioAffiliation,
    filteredStudios,
    handleRequestToJoin,
  };
}
