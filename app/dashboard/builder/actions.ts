"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishStudioForOwner } from "@/lib/studios/publish";
import { tierMeetsRequirement } from "@/lib/utils/integration-helpers";
import type { TierSlug } from "@/lib/types";

async function requireUserTier(): Promise<{ userId: string; tier: TierSlug | null } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .maybeSingle();
  return { userId: user.id, tier: (profile?.tier as TierSlug | null) ?? null };
}

/** Publish = copy draft to live. Requires a plan with a custom web page. */
export async function publishCurrentStudio(): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireUserTier();
  if (!ctx) return { ok: false, error: "Not signed in." };
  if (!tierMeetsRequirement(ctx.tier, "shader")) {
    return { ok: false, error: "Publishing requires the Shader or Magnum plan." };
  }
  return publishStudioForOwner(createAdminClient(), ctx.userId);
}

/** Listing visibility. Any paid tier lists; turning it off is always allowed. */
export async function setStudioVisibility(visible: boolean): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireUserTier();
  if (!ctx) return { ok: false, error: "Not signed in." };
  if (visible && !tierMeetsRequirement(ctx.tier, "liner")) {
    return { ok: false, error: "Going live requires an active plan." };
  }
  const { error } = await createAdminClient()
    .from("studios")
    .update({ is_visible: visible })
    .eq("claimed_by", ctx.userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
