import type { SupabaseClient } from "@supabase/supabase-js";

/** Server-only publish/unpublish. Clients cannot write these columns
 *  (trg_studios_publish_guard, migration 026) — every path goes through here. */

export async function publishStudioForOwner(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: studio } = await admin
    .from("studios")
    .select("id, theme_config")
    .eq("claimed_by", userId)
    .maybeSingle();
  if (!studio) return { ok: false, error: "No studio found for this account." };
  if (!studio.theme_config) return { ok: false, error: "Nothing to publish yet — save a draft first." };
  const { error } = await admin
    .from("studios")
    .update({
      published_theme_config: studio.theme_config,
      published_at: new Date().toISOString(),
      is_visible: true,
    })
    .eq("id", studio.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unpublishStudioForOwner(
  admin: SupabaseClient,
  userId: string,
  opts?: { unlist?: boolean }
): Promise<void> {
  await admin
    .from("studios")
    .update({
      published_theme_config: null,
      published_at: null,
      ...(opts?.unlist ? { is_visible: false } : {}),
    })
    .eq("claimed_by", userId);
}
