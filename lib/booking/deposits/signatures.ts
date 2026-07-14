import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_TOLERANCE_SEC = 300;

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && ab.length > 0 && timingSafeEqual(ab, bb);
}

/** Stripe-Signature: t=<unix>,v1=<hmac-sha256-hex of "<t>.<body>">. */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000)
): boolean {
  if (!header || !secret) return false;
  const parts = new Map(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1)] as const;
    })
  );
  const t = Number(parts.get("t"));
  const v1 = parts.get("v1");
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(nowSec - t) > STRIPE_TOLERANCE_SEC) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return safeEqualHex(expected, v1);
}

/** x-square-hmacsha256-signature: base64 HMAC-SHA256 of notificationUrl+body. */
export function verifySquareSignature(
  rawBody: string,
  header: string | null,
  signatureKey: string,
  notificationUrl: string
): boolean {
  if (!header || !signatureKey) return false;
  const expected = createHmac("sha256", signatureKey).update(notificationUrl + rawBody).digest();
  const given = Buffer.from(header, "base64");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
