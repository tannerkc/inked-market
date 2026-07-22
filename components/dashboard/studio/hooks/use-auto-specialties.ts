"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { StudioData } from "@/lib/repositories";
import { computeAutoSpecialties } from "@/lib/utils/compute-auto-specialties";
import type { Affiliation } from "@/lib/types";
import type { StudioForm } from "./use-studio-form";

export function useAutoSpecialties(
  studio: StudioData | null,
  update: (partial: Partial<StudioData>) => Promise<void>,
  roster: Affiliation[],
  setStudioForm: Dispatch<SetStateAction<StudioForm>>
) {
  const [autoSpecialties, setAutoSpecialties] = useState(studio?.autoSpecialties ?? false);

  const loadFromStudio = (s: StudioData) => setAutoSpecialties(s.autoSpecialties ?? false);

  useEffect(() => {
    if (!autoSpecialties) return;
    const computed = computeAutoSpecialties(roster);
    setStudioForm((prev) => ({ ...prev, specialties: computed }));
  }, [roster, autoSpecialties, setStudioForm]);

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

  return { autoSpecialties, loadFromStudio, handleToggleAutoSpecialties };
}
