"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { StudioService } from "@/lib/types";

interface ServiceRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ServiceRow({ label, description, checked, onChange }: ServiceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-ink-black/70 dark:text-ink-cream/70">{label}</p>
        <p className="text-[9px] text-ink-black/60 dark:text-ink-cream/60">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} size="sm" />
    </div>
  );
}

interface StudioServicesCardProps {
  services: StudioService[];
  onToggleService: (service: StudioService) => void;
}

export function StudioServicesCard({ services, onToggleService }: StudioServicesCardProps) {
  return (
    <div className="rounded-[20px] p-5 border bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.02] dark:border-ink-cream/[0.06]">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1 text-ink-black/60 dark:text-ink-cream/60">
        Services
      </p>
      <ServiceRow
        label="Walk-ins"
        description="Accept walk-in appointments"
        checked={services.includes("walk-ins")}
        onChange={() => onToggleService("walk-ins")}
      />
      <ServiceRow
        label="Piercing"
        description="Studio offers piercing services"
        checked={services.includes("piercing")}
        onChange={() => onToggleService("piercing")}
      />
    </div>
  );
}
