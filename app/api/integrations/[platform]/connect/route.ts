import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOAuthProvider } from "@/lib/integrations/providers";
import { OAUTH_COOKIE, OAUTH_COOKIE_MAX_AGE, encodeOAuthCookie, pkcePair, randomToken } from "@/lib/integrations/oauth";
import { requireStudioOwner, dashboardRedirect } from "@/lib/integrations/route-helpers";
import { getPlatformMeta } from "@/lib/data/integration-platforms";
import { tierMeetsRequirement } from "@/lib/utils/integration-helpers";
import type { IntegrationPlatform } from "@/lib/types/integrations";
import type { TierSlug } from "@/lib/types";

/** Starts the OAuth dance: verifies the signed-in studio owner, then redirects
 * to the provider with a state nonce bound to a short-lived httpOnly cookie. */
export async function GET(request: NextRequest, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;
  const { origin } = request.nextUrl;

  const provider = getOAuthProvider(platform);
  if (!provider) {
    return NextResponse.redirect(dashboardRedirect(origin, platform, "unknown_platform"));
  }
  if (!provider.isConfigured()) {
    return NextResponse.redirect(dashboardRedirect(origin, platform, "not_configured"));
  }

  const owner = await requireStudioOwner();
  if (!owner.ok) {
    return NextResponse.redirect(
      owner.reason === "unauthenticated" ? `${origin}/login` : dashboardRedirect(origin, platform, "no_studio"),
    );
  }

  // Tier-gated platforms: enforce minTier server-side (client gating is UX only).
  const meta = getPlatformMeta(platform as IntegrationPlatform);
  if (meta?.minTier) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", owner.userId)
      .maybeSingle();
    if (!tierMeetsRequirement((profile?.tier as TierSlug | null) ?? null, meta.minTier)) {
      return NextResponse.redirect(dashboardRedirect(origin, platform, "plan_required"));
    }
  }

  const state = randomToken(16);
  const pkce = provider.usesPkce ? pkcePair() : null;
  const redirectUri = `${origin}/api/integrations/${platform}/callback`;

  const response = NextResponse.redirect(
    provider.authorizeUrl({ redirectUri, state, codeChallenge: pkce?.challenge }),
  );
  response.cookies.set(OAUTH_COOKIE, encodeOAuthCookie({ state, platform, verifier: pkce?.verifier }), {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  });
  return response;
}
