import { randomBytes, createHash } from "node:crypto";

/** Short-lived httpOnly cookie carrying the OAuth round-trip state.
 * CSRF safety = state param must equal the cookie value; studio ownership is
 * re-derived from the session on BOTH legs, never trusted from the cookie. */
export const OAUTH_COOKIE = "im_oauth";
export const OAUTH_COOKIE_MAX_AGE = 600;

export interface OAuthCookiePayload {
  state: string;
  platform: string;
  verifier?: string;
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

/** RFC 7636 S256 pair. Verifier length (64 chars) sits inside the 43-128 spec. */
export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomToken(48);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function encodeOAuthCookie(payload: OAuthCookiePayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeOAuthCookie(value: string | undefined): OAuthCookiePayload | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString()) as OAuthCookiePayload;
    if (typeof parsed.state !== "string" || typeof parsed.platform !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}
