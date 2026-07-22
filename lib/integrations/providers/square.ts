import type { BusinessHours } from "@/lib/repositories/types";
import type { ExternalAccount, ImportContext, ImportResult, OAuthProvider, TokenSet } from "../types";

/**
 * Square OAuth (code flow) + Locations import.
 * Docs: developer.squareup.com/docs/oauth-api/overview — code-flow refresh
 * tokens are multi-use and never expire; access tokens last 30 days.
 * NOTE: Square's authorize URL takes no redirect_uri — the callback URL must
 * be registered in the Square Developer Console exactly.
 */

const IS_PROD = process.env.SQUARE_ENVIRONMENT === "production";
const BASE = IS_PROD ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
const SQUARE_VERSION = process.env.SQUARE_API_VERSION ?? "2026-05-20";
const SCOPES = "MERCHANT_PROFILE_READ"; // least privilege: covers merchants + locations reads

const clientId = () => process.env.SQUARE_OAUTH_CLIENT_ID ?? "";
const clientSecret = () => process.env.SQUARE_OAUTH_CLIENT_SECRET ?? "";

async function squareJson(path: string, tokens: TokenSet): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Square ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function obtainToken(body: Record<string, string>): Promise<TokenSet> {
  const res = await fetch(`${BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Square-Version": SQUARE_VERSION },
    body: JSON.stringify({ client_id: clientId(), client_secret: clientSecret(), ...body }),
  });
  if (!res.ok) throw new Error(`Square token exchange failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; refresh_token?: string; expires_at?: string };
  return { accessToken: json.access_token, refreshToken: json.refresh_token, expiresAt: json.expires_at, scope: SCOPES };
}

const DAY_MAP: Record<string, string> = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday",
  FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};

/** "09:00:00" → "9:00 AM" (matches the app's stored hours format). */
function formatLocalTime(time: string): string {
  const [hh = "0", mm = "00"] = time.split(":");
  const hours = Number(hh);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${mm} ${suffix}`;
}

interface SquareLocation {
  status?: string;
  business_hours?: { periods?: { day_of_week: string; start_local_time: string; end_local_time: string }[] };
}

export const squareProvider: OAuthProvider = {
  platform: "square",
  isConfigured: () => Boolean(clientId() && clientSecret()),
  usesPkce: false,

  authorizeUrl({ state }) {
    const params = new URLSearchParams({
      client_id: clientId(),
      scope: SCOPES,
      session: "false",
      state,
    });
    return `${BASE}/oauth2/authorize?${params.toString()}`;
  },

  exchangeCode: ({ code, redirectUri }) =>
    obtainToken({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),

  refreshTokens: (tokens) => {
    if (!tokens.refreshToken) throw new Error("Square connection has no refresh token.");
    return obtainToken({ grant_type: "refresh_token", refresh_token: tokens.refreshToken });
  },

  async fetchAccount(tokens): Promise<ExternalAccount> {
    const json = await squareJson("/v2/merchants", tokens);
    const merchant = (json.merchant as { id: string; business_name?: string }[] | undefined)?.[0];
    if (!merchant) throw new Error("No Square merchant on this account.");
    return { id: merchant.id, name: merchant.business_name || "Square account" };
  },

  /** Import business hours from the first active location with hours set. */
  async runImport({ admin, studioId, tokens }: ImportContext): Promise<ImportResult> {
    const json = await squareJson("/v2/locations", tokens);
    const locations = (json.locations as SquareLocation[] | undefined) ?? [];
    const withHours = locations.find(
      (l) => l.status !== "INACTIVE" && (l.business_hours?.periods?.length ?? 0) > 0,
    );

    const hours: BusinessHours = {};
    for (const period of withHours?.business_hours?.periods ?? []) {
      const day = DAY_MAP[period.day_of_week];
      if (!day) continue;
      hours[day] = {
        open: formatLocalTime(period.start_local_time),
        close: formatLocalTime(period.end_local_time),
        closed: false,
      };
    }
    const count = Object.keys(hours).length;
    if (count > 0) {
      const { error } = await admin
        .from("studios")
        .update({ hours, updated_at: new Date().toISOString() })
        .eq("id", studioId);
      if (error) throw new Error(`Failed to save imported hours: ${error.message}`);
    }
    return { count, label: "days of hours" };
  },

  async revoke(tokens) {
    await fetch(`${BASE}/oauth2/revoke`, {
      method: "POST",
      headers: {
        Authorization: `Client ${clientSecret()}`,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
      },
      body: JSON.stringify({ client_id: clientId(), access_token: tokens.accessToken }),
    });
  },
};
