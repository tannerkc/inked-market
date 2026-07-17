import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOAuthProvider } from "@/lib/integrations/providers";
import { OAUTH_COOKIE, decodeOAuthCookie } from "@/lib/integrations/oauth";
import { saveConnection, updateIntegrationProjection } from "@/lib/integrations/connections";
import { requireStudioOwner, dashboardRedirect } from "@/lib/integrations/route-helpers";

/** OAuth return leg: state check against the httpOnly cookie, code exchange,
 * token storage (sealed, service-role-only table), and projection of the
 * client-visible IntegrationRecord onto studios.integrations. */
export async function GET(request: NextRequest, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;
  const { origin, searchParams } = request.nextUrl;

  const finish = (status: string) => {
    const response = NextResponse.redirect(dashboardRedirect(origin, platform, status));
    response.cookies.set(OAUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  };

  const provider = getOAuthProvider(platform);
  if (!provider || !provider.isConfigured()) return finish("not_configured");
  if (searchParams.get("error")) return finish("denied");

  const code = searchParams.get("code");
  const cookie = decodeOAuthCookie(request.cookies.get(OAUTH_COOKIE)?.value);
  if (!code || !cookie || cookie.platform !== platform || cookie.state !== searchParams.get("state")) {
    return finish("state_mismatch");
  }

  const owner = await requireStudioOwner();
  if (!owner.ok) return finish(owner.reason === "unauthenticated" ? "unauthenticated" : "no_studio");

  try {
    const redirectUri = `${origin}/api/integrations/${platform}/callback`;
    const tokens = await provider.exchangeCode({ code, redirectUri, codeVerifier: cookie.verifier });
    const account = await provider.fetchAccount(tokens);

    const admin = createAdminClient();
    await saveConnection(admin, { studioId: owner.studioId, platform: provider.platform, tokens, account });

    const now = new Date().toISOString();
    await updateIntegrationProjection(admin, owner.studioId, provider.platform, {
      status: "connected",
      mode: "integrate",
      accountName: account.name,
      connectedAt: now,
      lastSyncAt: now,
      errorMessage: undefined,
      ...provider.connectProjection?.(account),
    });
    await provider.afterConnect?.({ admin, studioId: owner.studioId, account });

    return finish("connected");
  } catch (error) {
    console.error(`[integrations:${platform}] callback failed:`, error);
    return finish("error");
  }
}
