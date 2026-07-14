import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_COOKIE,
  OAUTH_COOKIE_MAX_AGE,
  encodeOAuthCookie,
  randomToken,
} from "@/lib/integrations/oauth";
import { requireArtistOwner, paymentRedirect } from "@/lib/integrations/route-helpers";
import { stripeAuthorizeUrl, stripeOAuthConfigured } from "@/lib/booking/deposits/stripe";

const SQUARE_IS_PROD = process.env.SQUARE_ENVIRONMENT === "production";
const SQUARE_BASE = SQUARE_IS_PROD
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";
/** Payment scopes — wider than the studio hours-import connection. */
const SQUARE_PAYMENT_SCOPES =
  "MERCHANT_PROFILE_READ PAYMENTS_WRITE ORDERS_WRITE ORDERS_READ PAYMENTS_READ";

/** Starts payment-account linking for the signed-in artist. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const { origin } = request.nextUrl;
  if (provider !== "stripe" && provider !== "square") {
    return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  }

  const owner = await requireArtistOwner();
  if (!owner.ok) {
    return NextResponse.redirect(
      owner.reason === "unauthenticated"
        ? `${origin}/login`
        : paymentRedirect(origin, provider, "no_artist")
    );
  }

  const state = randomToken(16);
  let authorizeUrl: string;

  if (provider === "stripe") {
    if (!stripeOAuthConfigured()) {
      return NextResponse.redirect(paymentRedirect(origin, provider, "not_configured"));
    }
    authorizeUrl = stripeAuthorizeUrl({
      state,
      redirectUri: `${origin}/api/payments/stripe/callback`,
    });
  } else {
    if (!process.env.SQUARE_OAUTH_CLIENT_ID || !process.env.SQUARE_OAUTH_CLIENT_SECRET) {
      return NextResponse.redirect(paymentRedirect(origin, provider, "not_configured"));
    }
    // Square ignores redirect_uri — the callback URL is console-registered.
    const params = new URLSearchParams({
      client_id: process.env.SQUARE_OAUTH_CLIENT_ID,
      scope: SQUARE_PAYMENT_SCOPES,
      session: "false",
      state,
    });
    authorizeUrl = `${SQUARE_BASE}/oauth2/authorize?${params.toString()}`;
  }

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_COOKIE, encodeOAuthCookie({ state, platform: `pay-${provider}` }), {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  });
  return response;
}
