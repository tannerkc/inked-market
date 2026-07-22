"use client";

import { useState } from "react";
import type { StudioData } from "@/lib/repositories";
import { copyDefinedFields } from "@/lib/utils";

export type StudioForm = {
  name: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  bio: string;
  specialties: string[];
  instagram: string;
  website: string;
  tiktok: string;
};

const FORM_KEYS = [
  "name", "city", "state", "phone", "email", "address",
  "zipCode", "bio", "specialties", "instagram", "website", "tiktok",
] as const satisfies readonly (keyof StudioForm)[];

const EMPTY_FORM: StudioForm = {
  name: "", city: "", state: "", phone: "", email: "", address: "",
  zipCode: "", bio: "", specialties: [], instagram: "", website: "", tiktok: "",
};

export function studioToForm(studio: StudioData | null): StudioForm {
  const form: StudioForm = { ...EMPTY_FORM };
  copyDefinedFields(form as Record<string, unknown>, studio, FORM_KEYS);
  return form;
}

export function useStudioForm(
  studio: StudioData | null,
  update: (partial: Partial<StudioData>) => Promise<void>
) {
  const [editStudioOpen, setEditStudioOpen] = useState(false);
  const [studioForm, setStudioForm] = useState<StudioForm>(() => studioToForm(studio));

  const loadFromStudio = (s: StudioData) => setStudioForm(studioToForm(s));

  const handleSaveStudio = () => {
    update({ ...studioForm });
    setEditStudioOpen(false);
  };

  return {
    editStudioOpen,
    setEditStudioOpen,
    studioForm,
    setStudioForm,
    loadFromStudio,
    handleSaveStudio,
  };
}
