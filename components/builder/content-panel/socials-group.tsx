"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import type { StudioData } from "@/lib/repositories";
import { socialUrl, type SocialPlatform } from "@/lib/utils/external-links";
import { GroupSection } from "./group-section";
import { PanelInput, useSavedFlash } from "./fields";

const SOCIAL_FIELDS: {
  key: SocialPlatform & keyof StudioData;
  label: string;
  placeholder: string;
  hint: string;
}[] = [
  { key: "instagram", label: "Instagram", placeholder: "@yourstudio", hint: "Enter a handle like @yourstudio or your profile URL." },
  { key: "tiktok", label: "TikTok", placeholder: "@yourstudio", hint: "Enter a handle like @yourstudio or your profile URL." },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourstudio", hint: "Enter your page name or facebook.com URL." },
  { key: "website", label: "Website", placeholder: "https://yourstudio.com", hint: "Enter a full URL like https://yourstudio.com." },
];

export function SocialsGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const commit = (partial: Partial<StudioData>) => {
    void update(partial).then(flash);
  };

  return (
    <GroupSection id="socials" title="Social Links" saved={saved} highlighted={highlighted}>
      {SOCIAL_FIELDS.map((field) => {
        const value = studio?.[field.key] ?? "";
        // Saved but unresolvable input would silently render no link — surface it.
        const unresolvable = value.trim().length > 0 && !socialUrl(field.key, value);
        return (
          <div key={field.key}>
            <PanelInput
              label={field.label}
              value={value}
              onCommit={(next) => commit({ [field.key]: next } as Partial<StudioData>)}
              placeholder={field.placeholder}
            />
            {unresolvable ? (
              <p role="alert" className="mt-1 text-[10px] font-medium text-ink-red">
                This won&rsquo;t show on your site &mdash; {field.hint.charAt(0).toLowerCase() + field.hint.slice(1)}
              </p>
            ) : null}
          </div>
        );
      })}
    </GroupSection>
  );
}
