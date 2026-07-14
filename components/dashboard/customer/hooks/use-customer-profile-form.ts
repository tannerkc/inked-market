"use client";

import { useState } from "react";
import type { AuthUser } from "@/components/providers/auth-provider";
import { copyDefinedFields, splitFullName } from "@/lib/utils";

export type CustomerProfileForm = {
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  styles: string[];
};

const FORM_KEYS = ["location", "bio", "styles"] as const;

function emptyForm(): CustomerProfileForm {
  return { firstName: "", lastName: "", location: "", bio: "", styles: [] };
}

export function userToCustomerForm(user: AuthUser | null): CustomerProfileForm {
  const form = emptyForm();
  if (!user) return form;
  const { first, last } = splitFullName(user.name);
  form.firstName = first;
  form.lastName = last;
  copyDefinedFields(form as Record<string, unknown>, user, FORM_KEYS);
  return form;
}

export function useCustomerProfileForm(
  user: AuthUser | null,
  updateUser: (data: Partial<AuthUser>) => void
) {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<CustomerProfileForm>(() => userToCustomerForm(user));

  const loadFromUser = (u: AuthUser) => setProfileForm(userToCustomerForm(u));

  const handleSaveProfile = () => {
    updateUser({
      name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
      styles: profileForm.styles,
      location: profileForm.location,
      bio: profileForm.bio,
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
