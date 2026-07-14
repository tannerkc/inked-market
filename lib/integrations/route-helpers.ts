import { createClient } from "@/lib/supabase/server";
import { studioIdForUser } from "./connections";

/** Session-derived studio ownership for the integration routes. Ownership is
 * never read from cookies or request bodies — only from the live session. */
export async function requireStudioOwner(): Promise<
  { ok: true; userId: string; studioId: string } | { ok: false; reason: "unauthenticated" | "no_studio" }
> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, reason: "unauthenticated" };
  const studioId = await studioIdForUser(supabase, data.user.id);
  if (!studioId) return { ok: false, reason: "no_studio" };
  return { ok: true, userId: data.user.id, studioId };
}

/** Where OAuth flows land back in the app, with a status the dashboard can surface. */
export function dashboardRedirect(origin: string, platform: string, status: string): string {
  const params = new URLSearchParams({ integration: platform, status });
  return `${origin}/dashboard?${params.toString()}`;
}

/** Session-derived artist ownership for the payment routes (deposits). */
export async function requireArtistOwner(): Promise<
  { ok: true; userId: string; artistId: string } | { ok: false; reason: "unauthenticated" | "no_artist" }
> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, reason: "unauthenticated" };
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .or(`user_id.eq.${data.user.id},claimed_by.eq.${data.user.id}`)
    .limit(1)
    .maybeSingle();
  if (!artist) return { ok: false, reason: "no_artist" };
  return { ok: true, userId: data.user.id, artistId: artist.id };
}

/** Payment OAuth landing redirect (distinct query keys from integrations). */
export function paymentRedirect(origin: string, provider: string, status: string): string {
  const params = new URLSearchParams({ payment: provider, status });
  return `${origin}/dashboard?${params.toString()}`;
}
