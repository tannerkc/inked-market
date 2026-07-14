import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OAUTH_COOKIE, decodeOAuthCookie } from "@/lib/integrations/oauth";
import { savePaymentConnection } from "@/lib/integrations/connections";
import { requireArtistOwner, paymentRedirect } from "@/lib/integrations/route-helpers";
import {
  stripeAccountName,
  stripeExchangeCode,
  stripeOAuthConfigured,
} from "@/lib/booking/deposits/stripe";
import type { TokenSet } from "@/lib/integrations/types";

const SQUARE_IS_PROD = process.env.SQUARE_ENVIRONMENT === "production";
const SQUARE_BASE = SQUARE_IS_PROD
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";
const SQUARE_VERSION = process.env.SQUARE_API_VERSION ?? "2026-05-20";

async function squareExchangeCode(code: string): Promise<TokenSet> {
  const res = await fetch(`${SQUARE_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Square-Version": SQUARE_VERSION },
    body: JSON.stringify({
      client_id: process.env.SQUARE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.SQUARE_OAUTH_CLIENT_SECRET ?? "",
      grant_type: "authorization_code",
      code,
    }),
  });
  if (!res.ok) throw new Error(`Square token exchange failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: json.expires_at,
  };
}

async function squareMerchant(tokens: TokenSet): Promise<{ id: string; name: string }> {
  const res = await fetch(`${SQUARE_BASE}/v2/merchants/me`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}`, "Square-Version": SQUARE_VERSION },
  });
  if (!res.ok) throw new Error(`Square merchants/me failed (${res.status})`);
  const json = (await res.json()) as { merchant?: { id?: string; business_name?: string } };
  return {
    id: json.merchant?.id ?? "square-merchant",
    name: json.merchant?.business_name ?? "Square account",
  };
}

/** OAuth return leg for payment linking: state check, exchange, sealed save. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const { origin, searchParams } = request.nextUrl;

  const finish = (status: string) => {
    const response = NextResponse.redirect(paymentRedirect(origin, provider, status));
    response.cookies.set(OAUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  };

  if (provider !== "stripe" && provider !== "square") return finish("unknown_provider");
  if (searchParams.get("error")) return finish("denied");

  const code = searchParams.get("code");
  const cookie = decodeOAuthCookie(request.cookies.get(OAUTH_COOKIE)?.value);
  if (
    !code ||
    !cookie ||
    cookie.platform !== `pay-${provider}` ||
    cookie.state !== searchParams.get("state")
  ) {
    return finish("state_mismatch");
  }

  const owner = await requireArtistOwner();
  if (!owner.ok) return finish(owner.reason === "unauthenticated" ? "unauthenticated" : "no_artist");

  try {
    const admin = createAdminClient();

    if (provider === "stripe") {
      if (!stripeOAuthConfigured()) return finish("not_configured");
      const { accountId } = await stripeExchangeCode(code);
      const name = await stripeAccountName(accountId);
      // Standard accounts are charged via the platform key + Stripe-Account
      // header; the account id is the credential. Seal a placeholder token.
      await savePaymentConnection(admin, {
        artistId: owner.artistId,
        platform: "stripe",
        tokens: { accessToken: "connect-standard" },
        account: { id: accountId, name },
      });
    } else {
      const tokens = await squareExchangeCode(code);
      const merchant = await squareMerchant(tokens);
      await savePaymentConnection(admin, {
        artistId: owner.artistId,
        platform: "square",
        tokens,
        account: { id: merchant.id, name: merchant.name },
      });
    }

    // Adopt as the deposit provider only when none is chosen yet.
    const { data: settings } = await admin
      .from("booking_settings")
      .select("id, payment_provider")
      .eq("artist_id", owner.artistId)
      .maybeSingle();
    if (settings && !settings.payment_provider) {
      await admin
        .from("booking_settings")
        .update({ payment_provider: provider })
        .eq("id", settings.id);
    } else if (!settings) {
      await admin
        .from("booking_settings")
        .insert({ artist_id: owner.artistId, payment_provider: provider });
    }

    return finish("connected");
  } catch (error) {
    console.error(`[payments:${provider}] callback failed:`, error);
    return finish("error");
  }
}
