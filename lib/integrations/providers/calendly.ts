import type { ExternalAccount, OAuthProvider, TokenSet } from "../types";

/**
 * Calendly OAuth (web/code flow) — on connect, the user's scheduling_url is
 * projected as the booking integration's linkUrl, so the site's Book buttons
 * and the Calendly embed go live without pasting anything.
 * Docs: developer.calendly.com — access tokens last 2h; refresh tokens are
 * single-use with rotation (enforced for all apps since mid-2026).
 */

const AUTH_BASE = "https://auth.calendly.com";
const API_BASE = "https://api.calendly.com";

const clientId = () => process.env.CALENDLY_OAUTH_CLIENT_ID ?? "";
const clientSecret = () => process.env.CALENDLY_OAUTH_CLIENT_SECRET ?? "";

async function obtainToken(body: Record<string, string>): Promise<TokenSet> {
  const res = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), ...body }).toString(),
  });
  if (!res.ok) throw new Error(`Calendly token exchange failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : undefined,
    scope: json.scope,
  };
}

export const calendlyProvider: OAuthProvider = {
  platform: "calendly",
  isConfigured: () => Boolean(clientId() && clientSecret()),
  usesPkce: false,

  authorizeUrl({ redirectUri, state }) {
    const params = new URLSearchParams({
      client_id: clientId(),
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    });
    return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
  },

  exchangeCode: ({ code, redirectUri }) =>
    obtainToken({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),

  refreshTokens: (tokens) => {
    if (!tokens.refreshToken) throw new Error("Calendly connection has no refresh token.");
    return obtainToken({ grant_type: "refresh_token", refresh_token: tokens.refreshToken });
  },

  async fetchAccount(tokens): Promise<ExternalAccount> {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!res.ok) throw new Error(`Calendly users/me failed (${res.status}): ${await res.text()}`);
    const json = (await res.json()) as { resource?: { uri: string; name?: string; scheduling_url?: string } };
    if (!json.resource?.uri) throw new Error("Calendly returned no user resource.");
    return {
      id: json.resource.uri,
      name: json.resource.name || "Calendly account",
      url: json.resource.scheduling_url,
    };
  },

  connectProjection(account) {
    // scheduling_url lives on calendly.com, so the booking widget both links
    // AND embeds (registry marks calendly as officially iframe-embeddable).
    return account.url ? { linkUrl: account.url } : {};
  },

  async revoke(tokens) {
    await fetch(`${AUTH_BASE}/oauth/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        token: tokens.refreshToken ?? tokens.accessToken,
      }).toString(),
    });
  },
};
