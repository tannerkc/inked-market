"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { isSlugAvailable } from "@/lib/utils/studio-slug";
import { CustomUrlField } from "@/components/dashboard/custom-url-field";

interface ArtistSlugRow {
  id: string;
  slug: string;
  slug_customized_at: string | null;
}

/**
 * Artist flavor of the one-shot URL editor. The artist dashboard's profile
 * form persists to auth metadata, so this field owns its artists-row slice
 * (load + RLS-scoped update) directly.
 */
export function ArtistUrlField() {
  const { user } = useAuth();
  const [row, setRow] = useState<ArtistSlugRow | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    createClient()
      .from("artists")
      .select("id, slug, slug_customized_at")
      .or(`user_id.eq.${user.id},claimed_by.eq.${user.id}`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setRow(data as ArtistSlugRow);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!row) return null;

  const save = async (next: string) => {
    const { error } = await createClient()
      .from("artists")
      .update({ slug: next })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
    setRow({ ...row, slug: next, slug_customized_at: new Date().toISOString() });
  };

  return (
    <CustomUrlField
      basePath="artists"
      slug={row.slug}
      locked={Boolean(row.slug_customized_at)}
      checkAvailable={(next) => isSlugAvailable(createClient(), "artists", next, row.id)}
      save={save}
    />
  );
}
