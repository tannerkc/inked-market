"use client";

import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/providers/studio-provider";
import { isSlugAvailable } from "@/lib/utils/studio-slug";
import { CustomUrlField } from "@/components/dashboard/custom-url-field";

/** Studio flavor of the one-shot URL editor — saves through the studio repo. */
export function StudioUrlField() {
  const { studio, update } = useStudio();
  if (!studio?.id || !studio.slug) return null;

  const currentSlug = studio.slug;
  const save = async (next: string) => {
    try {
      await update({ slug: next });
    } catch (e) {
      // The provider merges optimistically — put the real slug back on failure.
      void update({ slug: currentSlug });
      throw e;
    }
  };

  return (
    <CustomUrlField
      basePath="studios"
      slug={currentSlug}
      locked={Boolean(studio.slugCustomizedAt)}
      checkAvailable={(next) => isSlugAvailable(createClient(), "studios", next, studio.id)}
      save={save}
    />
  );
}
