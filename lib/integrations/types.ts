import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntegrationPlatform, IntegrationRecord } from "@/lib/types/integrations";

/** Server-side only — these types describe token material that must never
 * reach the client. The client-visible shape is IntegrationRecord. */

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  /** ISO timestamp; undefined = non-expiring (or provider-managed). */
  expiresAt?: string;
  scope?: string;
}

export interface ExternalAccount {
  id: string;
  name: string;
  /** Public profile/booking URL for the linked account, when the API exposes one. */
  url?: string;
}

export interface ImportContext {
  admin: SupabaseClient;
  studioId: string;
  tokens: TokenSet;
}

export interface ImportResult {
  count: number;
  label: string;
}

export interface OAuthProvider {
  platform: IntegrationPlatform;
  /** True when the required env credentials are present. */
  isConfigured(): boolean;
  usesPkce: boolean;
  authorizeUrl(input: { redirectUri: string; state: string; codeChallenge?: string }): string;
  exchangeCode(input: { code: string; redirectUri: string; codeVerifier?: string }): Promise<TokenSet>;
  refreshTokens?(tokens: TokenSet): Promise<TokenSet>;
  fetchAccount(tokens: TokenSet): Promise<ExternalAccount>;
  /** Extra IntegrationRecord fields to project on connect (e.g. Calendly's scheduling URL as linkUrl). */
  connectProjection?(account: ExternalAccount): Partial<IntegrationRecord>;
  /** Post-connect side effects (e.g. fill an empty studios.instagram column). */
  afterConnect?(ctx: { admin: SupabaseClient; studioId: string; account: ExternalAccount }): Promise<void>;
  /** Provider data pull (Square hours, Instagram photos). Absent = nothing to import. */
  runImport?(ctx: ImportContext): Promise<ImportResult>;
  /** Best-effort token revocation on disconnect. */
  revoke?(tokens: TokenSet): Promise<void>;
}
