import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * App-layer AES-256-GCM for OAuth token columns — defense in depth on top of
 * the deny-all RLS on studio_connections (per Square's token-storage guidance
 * and the OWASP OAuth2 cheat sheet: RLS stops API-path leaks, encryption
 * stops backup/log leaks).
 */

function encryptionKey(): Buffer {
  const dedicated = process.env.INTEGRATIONS_TOKEN_KEY;
  if (dedicated) return createHash("sha256").update(dedicated).digest();
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!fallback) {
    throw new Error("Token encryption needs INTEGRATIONS_TOKEN_KEY (or SUPABASE_SERVICE_ROLE_KEY) in the environment.");
  }
  // ponytail: dev fallback derives from the service key so local setup is
  // zero-config; set a dedicated INTEGRATIONS_TOKEN_KEY in production.
  return createHash("sha256").update(`inked-market-tokens:${fallback}`).digest();
}

export function sealToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${encrypted.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
}

export function openToken(sealed: string): string {
  const [version, iv, data, tag] = sealed.split(".");
  if (version !== "v1" || !iv || !data || !tag) throw new Error("Unrecognized sealed token format.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
