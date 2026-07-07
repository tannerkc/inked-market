"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import type { StudioData } from "@/lib/repositories";
import { studioSpecialtyOptions } from "@/lib/data/signup-styles";
import { ToggleRow } from "@/components/builder/controls";
import { cn } from "@/lib/utils";
import { GroupSection } from "./group-section";
import { PanelTextarea, useSavedFlash } from "./fields";

type StudioService = StudioData["services"][number];

export function StoryGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();

  const specialties = studio?.specialties ?? [];
  const services = studio?.services ?? [];

  const commit = (partial: Partial<StudioData>) => {
    void update(partial).then(flash);
  };

  const toggleSpecialty = (tag: string) => {
    const next = specialties.includes(tag)
      ? specialties.filter((t) => t !== tag)
      : [...specialties, tag];
    commit({ specialties: next });
  };

  const toggleService = (service: StudioService, on: boolean) => {
    const next = on
      ? Array.from(new Set([...services, service]))
      : services.filter((s) => s !== service);
    commit({ services: next });
  };

  return (
    <GroupSection id="story" title="Story" saved={saved} highlighted={highlighted}>
      <PanelTextarea
        label="About / Story"
        value={studio?.bio ?? ""}
        onCommit={(bio) => commit({ bio })}
        placeholder="Tell your studio's story..."
      />

      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Specialties
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Specialties">
          {studioSpecialtyOptions.map((tag) => {
            const active = specialties.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSpecialty(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors",
                  active
                    ? "border-ink-red bg-ink-red/10 text-ink-red"
                    : "border-chrome-border bg-chrome-surface text-chrome-text-dim hover:border-chrome-border-hover hover:text-chrome-text-secondary",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <ToggleRow
          label="Walk-ins welcome"
          checked={services.includes("walk-ins")}
          onChange={(v) => toggleService("walk-ins", v)}
        />
        <ToggleRow
          label="Piercing available"
          checked={services.includes("piercing")}
          onChange={(v) => toggleService("piercing", v)}
        />
      </div>
    </GroupSection>
  );
}
