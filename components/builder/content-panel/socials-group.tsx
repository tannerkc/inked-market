"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import type { StudioData } from "@/lib/repositories";
import { GroupSection } from "./group-section";
import { PanelInput, useSavedFlash } from "./fields";

export function SocialsGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const commit = (partial: Partial<StudioData>) => {
    void update(partial).then(flash);
  };

  return (
    <GroupSection id="socials" title="Social Links" saved={saved} highlighted={highlighted}>
      <PanelInput label="Instagram" value={studio?.instagram ?? ""} onCommit={(instagram) => commit({ instagram })} placeholder="@yourstudio" />
      <PanelInput label="TikTok" value={studio?.tiktok ?? ""} onCommit={(tiktok) => commit({ tiktok })} placeholder="@yourstudio" />
      <PanelInput label="Facebook" value={studio?.facebook ?? ""} onCommit={(facebook) => commit({ facebook })} placeholder="facebook.com/yourstudio" />
      <PanelInput label="Website" value={studio?.website ?? ""} onCommit={(website) => commit({ website })} placeholder="https://yourstudio.com" />
    </GroupSection>
  );
}
