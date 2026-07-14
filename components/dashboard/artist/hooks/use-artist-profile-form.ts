"use client";

import { useState } from "react";
import type { AuthUser } from "@/components/providers/auth-provider";
import { copyDefinedFields, splitFullName } from "@/lib/utils";

export type ArtistProfileForm = {
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  styles: string[];
  instagram: string;
  website: string;
  tiktok: string;
};

const FORM_KEYS = ["location", "bio", "styles", "instagram", "website", "tiktok"] as const;

function emptyForm(): ArtistProfileForm {
  return { firstName: "", lastName: "", location: "", bio: "", styles: [], instagram: "", website: "", tiktok: "" };
}

export function userToArtistForm(user: AuthUser | null): ArtistProfileForm {
  const form = emptyForm();
  if (!user) return form;
  const { first, last } = splitFullName(user.name);
  form.firstName = first;
  form.lastName = last;
  copyDefinedFields(form as Record<string, unknown>, user, FORM_KEYS);
  return form;
}

export function useArtistProfileForm(
  user: AuthUser | null,
  updateUser: (data: Partial<AuthUser>) => void
) {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ArtistProfileForm>(() => userToArtistForm(user));

  const loadFromUser = (u: AuthUser) => setProfileForm(userToArtistForm(u));

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
    editProfileOpen,
    setEditProfileOpen,
    profileForm,
    setProfileForm,
    loadFromUser,
    handleSaveProfile,
  };
}
