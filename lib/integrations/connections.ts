import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IntegrationPlatform,
  IntegrationRecord,
  StudioIntegrations,
} from "@/lib/types/integrations";
import { openToken, sealToken } from "./crypto";
import type { ExternalAccount, OAuthProvider, TokenSet } from "./types";

/** studio_connections access. Service-role client only — the table has
 * deny-all RLS so tokens are unreadable outside these server paths. */

interface ConnectionRow {
  studio_id: string;
  platform: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  external_account_id: string | null;
  external_account_name: string | null;
}

function rowToTokens(row: ConnectionRow): TokenSet {
  return {
    accessToken: openToken(row.access_token),
    refreshToken: row.refresh_token ? openToken(row.refresh_token) : undefined,
    expiresAt: row.expires_at ?? undefined,
    scope: row.scope ?? undefined,
  };
}

export async function saveConnection(
  admin: SupabaseClient,
  input: {
    studioId: string;
    platform: IntegrationPlatform;
    tokens: TokenSet;
    account: ExternalAccount;
  },
): Promise<void> {
  const { error } = await admin.from("studio_connections").upsert(
    {
      studio_id: input.studioId,
      platform: input.platform,
      access_token: sealToken(input.tokens.accessToken),
      refresh_token: input.tokens.refreshToken ? sealToken(input.tokens.refreshToken) : null,
      expires_at: input.tokens.expiresAt ?? null,
      scope: input.tokens.scope ?? null,
      external_account_id: input.account.id,
      external_account_name: input.account.name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "studio_id,platform" },
  );
  if (error) throw new Error(`Failed to store connection: ${error.message}`);
}

export async function getConnectionTokens(
  admin: SupabaseClient,
  studioId: string,
  platform: IntegrationPlatform,
): Promise<TokenSet | null> {
  const { data, error } = await admin
    .from("studio_connections")
    .select("*")
    .eq("studio_id", studioId)
    .eq("platform", platform)
    .maybeSingle();
  if (error) throw new Error(`Failed to read connection: ${error.message}`);
  return data ? rowToTokens(data as ConnectionRow) : null;
}

export async function deleteConnection(
  admin: SupabaseClient,
  studioId: string,
  platform: IntegrationPlatform,
): Promise<void> {
  const { error } = await admin
    .from("studio_connections")
    .delete()
    .eq("studio_id", studioId)
    .eq("platform", platform);
  if (error) throw new Error(`Failed to delete connection: ${error.message}`);
}

/** Tokens guaranteed usable: refreshes (and persists) when expiring within 5 minutes. */
export async function getFreshTokens(
  admin: SupabaseClient,
  studioId: string,
  provider: OAuthProvider,
): Promise<TokenSet | null> {
  const tokens = await getConnectionTokens(admin, studioId, provider.platform);
  if (!tokens) return null;
  const expiringSoon =
    tokens.expiresAt !== undefined &&
    new Date(tokens.expiresAt).getTime() - Date.now() < 5 * 60 * 1000;
  if (!expiringSoon || !provider.refreshTokens) return tokens;

  // Calendly (and Square PKCE) rotate refresh tokens: the old one dies on use,
  // so the new one is persisted before anything else can touch the connection.
  // ponytail: refreshes are user-triggered and rare; add per-row locking if a
  // background refresh cron ever runs concurrently with imports.
  const refreshed = await provider.refreshTokens(tokens);
  const nextRefreshToken = refreshed.refreshToken ?? tokens.refreshToken;
  const { error } = await admin
    .from("studio_connections")
    .update({
      access_token: sealToken(refreshed.accessToken),
      refresh_token: nextRefreshToken ? sealToken(nextRefreshToken) : null,
      expires_at: refreshed.expiresAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("studio_id", studioId)
    .eq("platform", provider.platform);
  if (error) throw new Error(`Failed to persist refreshed tokens: ${error.message}`);
  return { ...refreshed, refreshToken: nextRefreshToken };
}

/** Merge (or remove, with null) a platform's client-visible record in studios.integrations. */
export async function updateIntegrationProjection(
  admin: SupabaseClient,
  studioId: string,
  platform: IntegrationPlatform,
  patch: Partial<IntegrationRecord> | null,
): Promise<void> {
  const { data, error } = await admin
    .from("studios")
    .select("integrations")
    .eq("id", studioId)
    .single();
  if (error) throw new Error(`Failed to read integrations: ${error.message}`);

  const integrations: StudioIntegrations = { ...((data?.integrations as StudioIntegrations) ?? {}) };
  if (patch === null) {
    delete integrations[platform];
  } else {
    integrations[platform] = { status: "connected", ...integrations[platform], ...patch };
  }

  const { error: writeError } = await admin
    .from("studios")
    .update({ integrations, updated_at: new Date().toISOString() })
    .eq("id", studioId);
  if (writeError) throw new Error(`Failed to write integrations: ${writeError.message}`);
}

// ─── Artist-scoped payment connections (Stripe/Square deposits) ───────────
// Same sealed-token table, artist_id column (migration 021). The platform
// key is a payment provider, intentionally outside IntegrationPlatform so
// the studio integrations UI never sees these rows.

export async function savePaymentConnection(
  admin: SupabaseClient,
  input: {
    artistId: string;
    platform: "stripe" | "square";
    tokens: TokenSet;
    account: ExternalAccount;
  },
): Promise<void> {
  const { error } = await admin.from("studio_connections").upsert(
    {
      artist_id: input.artistId,
      studio_id: null,
      platform: input.platform,
      access_token: sealToken(input.tokens.accessToken),
      refresh_token: input.tokens.refreshToken ? sealToken(input.tokens.refreshToken) : null,
      expires_at: input.tokens.expiresAt ?? null,
      scope: input.tokens.scope ?? null,
      external_account_id: input.account.id,
      external_account_name: input.account.name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "artist_id,studio_id,platform" },
  );
  if (error) throw new Error(`Failed to store payment connection: ${error.message}`);
}

export async function getPaymentConnection(
  admin: SupabaseClient,
  artistId: string,
  platform: "stripe" | "square",
): Promise<{ tokens: TokenSet; accountId: string; accountName: string | null } | null> {
  const { data, error } = await admin
    .from("studio_connections")
    .select("*")
    .eq("artist_id", artistId)
    .eq("platform", platform)
    .maybeSingle();
  if (error) throw new Error(`Failed to read payment connection: ${error.message}`);
  if (!data) return null;
  const row = data as ConnectionRow;
  return {
    tokens: rowToTokens(row),
    accountId: row.external_account_id ?? "",
    accountName: row.external_account_name,
  };
}

export async function deletePaymentConnection(
  admin: SupabaseClient,
  artistId: string,
  platform: "stripe" | "square",
): Promise<void> {
  const { error } = await admin
    .from("studio_connections")
    .delete()
    .eq("artist_id", artistId)
    .eq("platform", platform);
  if (error) throw new Error(`Failed to delete payment connection: ${error.message}`);
}

/** The authenticated owner's studio id, or null. Ownership is always derived
 * from the live session — never from cookies or request bodies. */
export async function studioIdForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("studios")
    .select("id")
    .eq("claimed_by", userId)
    .maybeSingle();
  return data?.id ?? null;
}
