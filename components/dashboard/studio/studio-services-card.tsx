"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { StudioService } from "@/lib/types";

interface ServiceRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ServiceRow({ label, description, checked, onChange }: ServiceRowProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className={cn("text-[11px] font-medium", isDark ? "text-ink-cream/50" : "text-ink-black/50")}>{label}</p>
        <p className={cn("text-[9px]", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>{description}</p>
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
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={cn("rounded-[20px] p-5 border", isDark ? "bg-ink-cream/[0.02] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]")}>
      <p className={cn("font-mono text-[9px] tracking-[0.2em] uppercase mb-1", isDark ? "text-ink-cream/35" : "text-ink-black/35")}>
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
