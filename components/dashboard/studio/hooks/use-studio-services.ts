"use client";

import { useState } from "react";
import type { StudioData } from "@/lib/repositories";
import type { StudioService } from "@/lib/types";

export function useStudioServices(
  studio: StudioData | null,
  update: (partial: Partial<StudioData>) => Promise<void>
) {
  const [services, setServices] = useState<StudioService[]>(studio?.services ?? []);

  const loadFromStudio = (s: StudioData) => setServices(s.services ?? []);

  const handleToggleService = (service: StudioService) => {
    const next = services.includes(service)
      ? services.filter((s) => s !== service)
      : [...services, service];
    setServices(next);
    update({ services: next });
  };

  return { services, loadFromStudio, handleToggleService };
}
