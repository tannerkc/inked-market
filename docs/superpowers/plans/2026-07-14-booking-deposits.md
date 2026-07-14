# Booking Phase 4 (Deposits) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deposits on the artist's own rails: Stripe Connect Standard or Square checkout links, `pending_deposit` holds with 24h expiry, signature-verified webhooks, verify-on-return, cron sweep backstop, and a manual mark-received path for artists with no provider.

**Architecture:** A `DepositProvider` abstraction (`lib/booking/deposits/`) with fetch-based Stripe and Square implementations (matching the existing SDK-free provider style). Payment account linking reuses the sealed-token `studio_connections` table, generalized with an `artist_id` column, through new artist-scoped connection functions and dedicated `/api/payments/[provider]` OAuth routes — the studio integration routes are untouched. Deposit state transitions are all status-guarded single UPDATEs: webhook, verify-on-return, cron sweep, and manual confirmation are mutually idempotent, and a payment landing after hold-expiry cancellation records `refund_due` instead of silently vanishing.

**Tech Stack:** No new dependencies. `node:crypto` HMAC for both webhook signature schemes. Env (all gated by `isConfigured()`, absence degrades to the manual path): `STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SQUARE_WEBHOOK_SIGNATURE_KEY` (+ existing `SQUARE_OAUTH_CLIENT_ID/SECRET`, `SQUARE_ENVIRONMENT`, `CRON_SECRET`, `INTEGRATIONS_TOKEN_KEY` fallback).

## Global Constraints

- Supabase project `cktvpfenygxhfaodihbz` ONLY; migrations via `supabase db push`.
- No emoji in code. No AI attribution in commits. No `npm run dev`/`build` (dev server on :3002 is the user's).
- Verification loop: `npx tsx scripts/check-booking.ts && npx tsx scripts/check-builder.ts && npx tsc --noEmit && npm run lint`. `noUncheckedIndexedAccess` on. Lint: ternaries for conditional JSX; inline-IIFE effects.
- The platform NEVER holds funds: Stripe sessions are created on the connected account (`Stripe-Account` header), Square links on the merchant's own token. No application fees.
- Tokens only via sealed-token connection functions (service role); never returned to the client. Webhook handlers verify signatures BEFORE parsing; raw body is read exactly once.
- Every deposit transition is a status-guarded UPDATE checked for affected rows. A success redirect is never proof of payment.

---

### Task 1: Migration 021 — artist connections, checkout URL, hold-release cron

**Files:**
- Create: `supabase/migrations/021_deposits.sql`

**Interfaces:**
- Produces: `studio_connections.artist_id` (entity XOR), `appointments.deposit_checkout_url`, hourly `release-deposit-holds` pg_cron job.

- [ ] **Step 1: Write the migration**

```sql
-- Phase 4 (deposits): artist-level payment connections, checkout URL storage,
-- hourly release of unpaid deposit holds.
-- Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md

-- Connections become entity-scoped (artist XOR studio). Existing rows are all
-- studio rows; RLS stays deny-all (service-role only).
alter table public.studio_connections
  add column if not exists artist_id uuid references public.artists(id) on delete cascade;
alter table public.studio_connections
  alter column studio_id drop not null;
alter table public.studio_connections
  add constraint studio_connections_entity_xor
  check (num_nonnulls(artist_id, studio_id) = 1);
alter table public.studio_connections
  drop constraint if exists studio_connections_studio_id_platform_key;
alter table public.studio_connections
  add constraint studio_connections_entity_platform_key
  unique nulls not distinct (artist_id, studio_id, platform);
create index if not exists studio_connections_artist_idx
  on public.studio_connections (artist_id);

-- Reusable checkout URL so an abandoned customer can resume payment.
alter table public.appointments
  add column if not exists deposit_checkout_url text;

-- Hourly: unpaid holds release their slot. deposit_status stays 'pending' so a
-- late webhook payment maps to refund_due instead of disappearing.
do $$
begin
  perform cron.unschedule('release-deposit-holds');
exception when others then
  null;
end $$;

select cron.schedule(
  'release-deposit-holds',
  '5 * * * *',
  $$update public.appointments
      set status = 'cancelled',
          cancelled_by = 'customer',
          cancellation_reason = 'Deposit hold expired'
    where status = 'pending_deposit' and hold_expires_at < now()$$
);
```

- [ ] **Step 2: Push** — `supabase db push --dry-run` (only 021), then `supabase db push`. Expected: applied clean.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/021_deposits.sql
git commit -m "feat(booking): migration 021 - artist payment connections, checkout url, hold release cron"
```

---

### Task 2: Deposit types, webhook signatures, deposit plan (pure, TDD)

**Files:**
- Create: `lib/booking/deposits/types.ts`
- Create: `lib/booking/deposits/signatures.ts`
- Create: `lib/booking/deposits/plan.ts`
- Modify: `lib/types/booking.ts` (append `depositCheckoutUrl` to `AppointmentRecord`)
- Modify: `lib/supabase/booking-types.ts` (`DbAppointment.deposit_checkout_url` + mapper line)
- Modify: `scripts/check-booking.ts` (append 4 checks)

**Interfaces:**
- Produces:
  - `types.ts`: `PaymentProviderKey = "stripe" | "square"`; `CheckoutLink { url: string; checkoutId: string }`; `DepositProvider { key; isConfigured(): boolean; createCheckoutLink(input: { tokens: TokenSet; accountId: string; amountCents: number; description: string; appointmentId: string; returnUrl: string }): Promise<CheckoutLink>; verifyCheckout(input: { tokens: TokenSet; accountId: string; checkoutId: string }): Promise<"paid" | "open"> }` (`TokenSet` from `@/lib/integrations/types`)
  - `signatures.ts`: `verifyStripeSignature(rawBody: string, header: string | null, secret: string, nowSec?: number): boolean` (t/v1 scheme, HMAC-SHA256 hex, 5-min tolerance, timing-safe compare); `verifySquareSignature(rawBody: string, header: string | null, signatureKey: string, notificationUrl: string): boolean` (base64 HMAC-SHA256 of url+body)
  - `plan.ts`: `depositPlanFor(input: { depositCents: number; provider: PaymentProviderKey | null; connected: boolean; configured: boolean }): "none" | "provider" | "manual"`

- [ ] **Step 1: Append failing checks**

```ts
// ─── phase 4: deposits ───────────────────────────────────────────────────
import { createHmac } from "node:crypto";
import { verifyStripeSignature, verifySquareSignature } from "../lib/booking/deposits/signatures";
import { depositPlanFor } from "../lib/booking/deposits/plan";

check("stripe webhook signature verifies and rejects", () => {
  const secret = "whsec_test";
  const body = '{"id":"evt_1"}';
  const t = 1_800_000_000;
  const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const header = `t=${t},v1=${v1}`;
  assert.ok(verifyStripeSignature(body, header, secret, t + 60));
  assert.ok(!verifyStripeSignature(body, header, secret, t + 600)); // stale
  assert.ok(!verifyStripeSignature(body, `t=${t},v1=deadbeef`, secret, t + 60));
  assert.ok(!verifyStripeSignature(body, null, secret, t + 60));
});

check("square webhook signature verifies and rejects", () => {
  const key = "sq_sig_key";
  const url = "https://example.com/api/webhooks/square";
  const body = '{"event_id":"e1"}';
  const sig = createHmac("sha256", key).update(url + body).digest("base64");
  assert.ok(verifySquareSignature(body, sig, key, url));
  assert.ok(!verifySquareSignature(body, sig, key, "https://example.com/other"));
  assert.ok(!verifySquareSignature(body, null, key, url));
});

check("depositPlanFor picks provider, manual, or none", () => {
  const base = { depositCents: 10000, provider: "stripe" as const, connected: true, configured: true };
  assert.equal(depositPlanFor(base), "provider");
  assert.equal(depositPlanFor({ ...base, depositCents: 0 }), "none");
  assert.equal(depositPlanFor({ ...base, connected: false }), "manual");
  assert.equal(depositPlanFor({ ...base, configured: false }), "manual");
  assert.equal(depositPlanFor({ ...base, provider: null }), "manual");
});

check("appointment mapper carries deposit checkout url", () => {
  const vm = mapDbAppointment({ ...DB_APPT, deposit_checkout_url: "https://pay.example/x" });
  assert.equal(vm.depositCheckoutUrl, "https://pay.example/x");
});
```

(The `DB_APPT` fixture gains `deposit_checkout_url: null`.)

- [ ] **Step 2: Run to verify failure** — module not found.

- [ ] **Step 3: Implement**

`lib/booking/deposits/types.ts`:

```ts
import type { TokenSet } from "@/lib/integrations/types";

export type PaymentProviderKey = "stripe" | "square";

export interface CheckoutLink {
  url: string;
  checkoutId: string;
}

/**
 * Checkout on the artist's own account — the platform never holds funds.
 * verifyCheckout is the webhook's redundant twin: redirect, sweep, and
 * webhook all converge on the same idempotent DB transition.
 */
export interface DepositProvider {
  key: PaymentProviderKey;
  isConfigured(): boolean;
  createCheckoutLink(input: {
    tokens: TokenSet;
    accountId: string;
    amountCents: number;
    description: string;
    appointmentId: string;
    returnUrl: string;
  }): Promise<CheckoutLink>;
  verifyCheckout(input: {
    tokens: TokenSet;
    accountId: string;
    checkoutId: string;
  }): Promise<"paid" | "open">;
}
```

`lib/booking/deposits/signatures.ts`:

```ts
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
```

`lib/booking/deposits/plan.ts`:

```ts
import type { PaymentProviderKey } from "./types";

/** How a deposit ask gets collected. "manual" = artist marks it received. */
export function depositPlanFor(input: {
  depositCents: number;
  provider: PaymentProviderKey | null;
  connected: boolean;
  configured: boolean;
}): "none" | "provider" | "manual" {
  if (input.depositCents <= 0) return "none";
  if (input.provider && input.connected && input.configured) return "provider";
  return "manual";
}
```

Type/mapper edits: `AppointmentRecord` gains `depositCheckoutUrl: string | null`; `DbAppointment` gains `deposit_checkout_url: string | null`; `mapDbAppointment` maps it.

- [ ] **Step 4: Verify** — `npx tsx scripts/check-booking.ts` → `36 checks passed`; tsc clean.

- [ ] **Step 5: Commit**

```bash
git add lib/booking/deposits/ lib/types/booking.ts lib/supabase/booking-types.ts scripts/check-booking.ts
git commit -m "feat(booking): deposit provider types, webhook signatures, deposit plan"
```

---

### Task 3: Artist-scoped payment connections

**Files:**
- Modify: `lib/integrations/connections.ts` (append artist functions; no changes to existing exports)

**Interfaces:**
- Produces (Tasks 4-7):
  - `savePaymentConnection(admin, input: { artistId: string; platform: PaymentProviderKey; tokens: TokenSet; account: ExternalAccount }): Promise<void>` — upsert `onConflict: "artist_id,studio_id,platform"`
  - `getPaymentConnection(admin, artistId, platform): Promise<{ tokens: TokenSet; accountId: string; accountName: string | null } | null>`
  - `deletePaymentConnection(admin, artistId, platform): Promise<void>`

- [ ] **Step 1: Append to `lib/integrations/connections.ts`**

```ts
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
  const row = data as ConnectionRow & { external_account_id: string | null };
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
```

- [ ] **Step 2: Verify + commit** — tsc clean.

```bash
git add lib/integrations/connections.ts
git commit -m "feat(booking): artist-scoped payment connections on sealed-token table"
```

---

### Task 4: Stripe and Square deposit providers + registry

**Files:**
- Create: `lib/booking/deposits/stripe.ts`
- Create: `lib/booking/deposits/square.ts`
- Create: `lib/booking/deposits/index.ts`

**Interfaces:**
- Produces:
  - `stripeDeposits: DepositProvider`, plus Stripe Connect OAuth helpers used by Task 5: `stripeAuthorizeUrl({ state, redirectUri }): string`, `stripeExchangeCode(code): Promise<{ accountId: string }>`, `stripeAccountName(accountId): Promise<string>`
  - `squareDeposits: DepositProvider`
  - `index.ts`: `getDepositProvider(key: PaymentProviderKey): DepositProvider`, re-exports

**Provider facts (verify against docs if calls fail live):**
- Stripe: form-encoded `POST https://api.stripe.com/v1/checkout/sessions` with `Stripe-Account: acct_...` header and platform `Authorization: Bearer STRIPE_SECRET_KEY`; `mode=payment`, one `line_items` price_data entry, `metadata[appointment_id]`, `success_url`/`cancel_url` = returnUrl. Verify: `GET /v1/checkout/sessions/{id}` (same headers) → `payment_status === "paid"`. Connect OAuth: authorize `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=...&scope=read_write&redirect_uri=...&state=...`; exchange `POST https://connect.stripe.com/oauth/token` (form: `grant_type=authorization_code&code=...`, auth = secret key) → `stripe_user_id`. Account name: `GET /v1/accounts/{id}` → `settings.dashboard.display_name` or `business_profile.name`.
- Square: `POST {BASE}/v2/online-checkout/payment-links` with the MERCHANT token, body `{ idempotency_key, quick_pay: { name, price_money: { amount, currency: "USD" }, location_id } }`. `location_id` from `GET /v2/locations` (first ACTIVE). Response `payment_link: { id, url, order_id }` — store `order_id` as the checkoutId (webhooks and order lookups key on it). Verify: `GET /v2/orders/{order_id}` → `order.state === "COMPLETED"`. BASE/env/version identical to `lib/integrations/providers/square.ts` (sandbox vs production via `SQUARE_ENVIRONMENT`).

- [ ] **Step 1: Implement `lib/booking/deposits/stripe.ts`**

```ts
import type { CheckoutLink, DepositProvider } from "./types";

const API = "https://api.stripe.com";
const CONNECT = "https://connect.stripe.com";

const secretKey = () => process.env.STRIPE_SECRET_KEY ?? "";
const clientId = () => process.env.STRIPE_CLIENT_ID ?? "";

async function stripeForm(
  path: string,
  params: Record<string, string>,
  accountId?: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(accountId ? { "Stripe-Account": accountId } : {}),
    },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function stripeGet(path: string, accountId?: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      ...(accountId ? { "Stripe-Account": accountId } : {}),
    },
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

// ─── Connect Standard OAuth (account linking) ──────────────────────────────

export function stripeOAuthConfigured(): boolean {
  return Boolean(secretKey() && clientId());
}

export function stripeAuthorizeUrl(input: { state: string; redirectUri: string }): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    scope: "read_write",
    redirect_uri: input.redirectUri,
    state: input.state,
  });
  return `${CONNECT}/oauth/authorize?${params.toString()}`;
}

export async function stripeExchangeCode(code: string): Promise<{ accountId: string }> {
  const res = await fetch(`${CONNECT}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code }).toString(),
  });
  if (!res.ok) throw new Error(`Stripe token exchange failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { stripe_user_id?: string };
  if (!json.stripe_user_id) throw new Error("Stripe token exchange returned no account id.");
  return { accountId: json.stripe_user_id };
}

export async function stripeAccountName(accountId: string): Promise<string> {
  try {
    const acct = (await stripeGet(`/v1/accounts/${accountId}`)) as {
      settings?: { dashboard?: { display_name?: string } };
      business_profile?: { name?: string };
    };
    return acct.settings?.dashboard?.display_name ?? acct.business_profile?.name ?? accountId;
  } catch {
    return accountId;
  }
}

// ─── Deposit checkout ───────────────────────────────────────────────────────

export const stripeDeposits: DepositProvider = {
  key: "stripe",
  isConfigured: () => Boolean(secretKey()),
  async createCheckoutLink({ accountId, amountCents, description, appointmentId, returnUrl }) {
    const session = (await stripeForm(
      "/v1/checkout/sessions",
      {
        mode: "payment",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(amountCents),
        "line_items[0][price_data][product_data][name]": description,
        "metadata[appointment_id]": appointmentId,
        success_url: returnUrl,
        cancel_url: returnUrl,
      },
      accountId
    )) as { id?: string; url?: string };
    if (!session.id || !session.url) throw new Error("Stripe session missing id/url.");
    return { url: session.url, checkoutId: session.id } satisfies CheckoutLink;
  },
  async verifyCheckout({ accountId, checkoutId }) {
    const session = (await stripeGet(`/v1/checkout/sessions/${checkoutId}`, accountId)) as {
      payment_status?: string;
    };
    return session.payment_status === "paid" ? "paid" : "open";
  },
};
```

(Stripe's `tokens` param is unused — Standard accounts are charged via the platform key + `Stripe-Account` header; the interface keeps it for Square symmetry.)

- [ ] **Step 2: Implement `lib/booking/deposits/square.ts`**

```ts
import { randomUUID } from "node:crypto";
import type { CheckoutLink, DepositProvider } from "./types";
import type { TokenSet } from "@/lib/integrations/types";

const IS_PROD = process.env.SQUARE_ENVIRONMENT === "production";
const BASE = IS_PROD ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
const SQUARE_VERSION = process.env.SQUARE_API_VERSION ?? "2026-05-20";

async function squareCall(
  path: string,
  tokens: TokenSet,
  init?: { method?: string; body?: unknown }
): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) throw new Error(`Square ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function firstActiveLocationId(tokens: TokenSet): Promise<string> {
  const json = (await squareCall("/v2/locations", tokens)) as {
    locations?: { id: string; status?: string }[];
  };
  const location =
    json.locations?.find((l) => l.status === "ACTIVE") ?? json.locations?.[0];
  if (!location) throw new Error("Square account has no locations.");
  return location.id;
}

export const squareDeposits: DepositProvider = {
  key: "square",
  isConfigured: () =>
    Boolean(process.env.SQUARE_OAUTH_CLIENT_ID && process.env.SQUARE_OAUTH_CLIENT_SECRET),
  async createCheckoutLink({ tokens, amountCents, description }) {
    const locationId = await firstActiveLocationId(tokens);
    const json = (await squareCall("/v2/online-checkout/payment-links", tokens, {
      method: "POST",
      body: {
        idempotency_key: randomUUID(),
        quick_pay: {
          name: description.slice(0, 255),
          price_money: { amount: amountCents, currency: "USD" },
          location_id: locationId,
        },
      },
    })) as { payment_link?: { id: string; url: string; order_id: string } };
    if (!json.payment_link?.url || !json.payment_link.order_id) {
      throw new Error("Square payment link missing url/order_id.");
    }
    // order_id is the checkoutId: webhooks and order lookups both key on it.
    return { url: json.payment_link.url, checkoutId: json.payment_link.order_id } satisfies CheckoutLink;
  },
  async verifyCheckout({ tokens, checkoutId }) {
    const json = (await squareCall(`/v2/orders/${checkoutId}`, tokens)) as {
      order?: { state?: string };
    };
    return json.order?.state === "COMPLETED" ? "paid" : "open";
  },
};
```

- [ ] **Step 3: `lib/booking/deposits/index.ts`**

```ts
import type { DepositProvider, PaymentProviderKey } from "./types";
import { stripeDeposits } from "./stripe";
import { squareDeposits } from "./square";

const PROVIDERS: Record<PaymentProviderKey, DepositProvider> = {
  stripe: stripeDeposits,
  square: squareDeposits,
};

export function getDepositProvider(key: PaymentProviderKey): DepositProvider {
  return PROVIDERS[key];
}

export * from "./types";
export { depositPlanFor } from "./plan";
export { verifyStripeSignature, verifySquareSignature } from "./signatures";
```

- [ ] **Step 4: Verify + commit** — tsc + lint clean on new files.

```bash
git add lib/booking/deposits/
git commit -m "feat(booking): stripe and square deposit providers"
```

---

### Task 5: Payment OAuth routes + status

**Files:**
- Create: `app/api/payments/[provider]/start/route.ts`
- Create: `app/api/payments/[provider]/callback/route.ts`
- Create: `app/api/payments/[provider]/disconnect/route.ts`
- Create: `app/api/payments/status/route.ts`
- Modify: `lib/integrations/route-helpers.ts` (append `requireArtistOwner`)

**Behavior spec:**
- `requireArtistOwner()`: session user → artists row via `user_id`/`claimed_by` → `{ ok: true, userId, artistId } | { ok: false, reason }` (mirror `requireStudioOwner`).
- `start` (GET): artist required; provider param ∈ stripe|square else 404. Stripe: `stripeOAuthConfigured()` or redirect `/dashboard?payment=stripe&status=unconfigured`; set the `OAUTH_COOKIE` (`encodeOAuthCookie({ state, platform: "pay-stripe" })`, httpOnly, maxAge 600) and redirect to `stripeAuthorizeUrl({ state, redirectUri: `${origin}/api/payments/stripe/callback` })`. Square: reuse `squareProvider.isConfigured()`; authorize URL built like the studio flow but with payment scopes — construct directly: `${SQUARE_BASE}/oauth2/authorize?client_id=...&scope=MERCHANT_PROFILE_READ+PAYMENTS_WRITE+ORDERS_WRITE+ORDERS_READ+PAYMENTS_READ&session=false&state=...` (Square ignores redirect_uri — console-registered; read the BASE/env through the same constants pattern as `lib/booking/deposits/square.ts`).
- `callback` (GET): artist required (session again — never from cookie); state must equal cookie state; cookie cleared. Stripe: `stripeExchangeCode(code)` → `stripeAccountName` → `savePaymentConnection(admin, { artistId, platform: "stripe", tokens: { accessToken: "connect-standard" }, account: { id: accountId, name } })` (Standard accounts don't need a stored token — seal the placeholder; `accountId` is the credential). Square: exchange via the same `/oauth2/token` JSON call the studio provider uses (duplicate the small `obtainToken` shape locally in the route or export it from the studio provider — export is cleaner: add `export { obtainSquareToken }` to `lib/integrations/providers/square.ts` if trivially extractable, else inline 15 lines) → fetch merchant name via `GET /v2/merchants/me` → `savePaymentConnection`. Both: also `saveBookingSettings`-style update `booking_settings.payment_provider` to the connected provider via admin update (only if currently null — do not stomp an explicit choice). Redirect `/dashboard?payment=<provider>&status=connected|error`.
- `disconnect` (POST): artist required; `deletePaymentConnection`; if `booking_settings.payment_provider` equals it, null it; 200 JSON.
- `status` (GET): artist required; returns `{ stripe: { configured, connected, accountName }, square: { ... }, chosen: "stripe" | "square" | null }` — no tokens, ever.

- [ ] **Step 1-4:** Implement the four routes + helper exactly per the behavior spec, following the CSRF/state pattern quoted in `lib/integrations/oauth.ts` and the existing `[platform]/connect` + `callback` routes as structural reference (read them first: `app/api/integrations/[platform]/connect/route.ts`, `callback/route.ts`).

- [ ] **Step 5: Verify + commit** — tsc + lint clean.

```bash
git add app/api/payments/ lib/integrations/route-helpers.ts lib/integrations/providers/square.ts
git commit -m "feat(booking): artist payment account linking (stripe connect, square)"
```

---

### Task 6: Deposit orchestration in booking actions

**Files:**
- Create: `lib/booking/deposits/orchestrate.ts`
- Modify: `app/book/actions.ts` (wire all three appointment-creating paths)

**Interfaces:**
- Produces: `applyDepositToAppointment(admin, input: { appointmentId: string; artistId: string; depositCents: number; description: string; origin: string }): Promise<{ checkoutUrl: string | null }>` — decides the plan, creates the checkout link when provider-backed, and updates the appointment row.
- Action result shape gains `checkoutUrl?: string` on `scheduleFromRequest`, `bookFlash`, `bookConsultation`.

**Orchestration contract (each numbered point must be in the code):**
1. Appointments with `depositCents > 0` are INSERTED as `status='pending_deposit'`, `deposit_status='pending'`, `hold_expires_at = now + 24h` (the exclusion constraint already covers `pending_deposit`). Zero-deposit appointments keep today's `confirmed`/`not_required` insert.
2. After insert, `applyDepositToAppointment` runs: reads `booking_settings.payment_provider` + `getPaymentConnection`; `depositPlanFor` decides.
   - `provider`: `createCheckoutLink` with `returnUrl = ${origin}/api/booking/deposit-return?appointment=<id>`; UPDATE the row: `deposit_provider`, `deposit_checkout_id`, `deposit_checkout_url`.
   - `manual`: UPDATE `deposit_provider='manual'` only. The hold still applies; the artist confirms.
   - Link-creation failure degrades to `manual` (never lose the booking) — wrap in try/catch.
3. `bookConsultation` deposit = `consultPriceCents` (spec: paid consults charge through deposit rails); description "Consultation with {artist}". `bookFlash` deposit = `item.depositCents`, description "Deposit: {item.title}". `scheduleFromRequest` deposit = `request.depositCents ?? 0`, description "Tattoo deposit - {artistName or 'session'}".
4. `origin` derives from the server action's request headers: `(await headers()).get("origin") ?? (await headers()).get("x-forwarded-host") ...` — use Next's `headers()`; fall back to `https://${host}`.
5. The one-off flash claim ordering is unchanged; deposit orchestration runs after a successful insert only.

- [ ] **Step 1: Implement `orchestrate.ts`** (complete code):

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { depositPlanFor } from "./plan";
import { getDepositProvider } from "./index";
import type { PaymentProviderKey } from "./types";
import { getPaymentConnection } from "@/lib/integrations/connections";

export async function applyDepositToAppointment(
  admin: SupabaseClient,
  input: {
    appointmentId: string;
    artistId: string;
    depositCents: number;
    description: string;
    origin: string;
  }
): Promise<{ checkoutUrl: string | null }> {
  if (input.depositCents <= 0) return { checkoutUrl: null };

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("payment_provider")
    .eq("artist_id", input.artistId)
    .maybeSingle();
  const providerKey = (settingsRow?.payment_provider ?? null) as PaymentProviderKey | null;
  const connection = providerKey
    ? await getPaymentConnection(admin, input.artistId, providerKey)
    : null;
  const provider = providerKey ? getDepositProvider(providerKey) : null;

  const plan = depositPlanFor({
    depositCents: input.depositCents,
    provider: providerKey,
    connected: Boolean(connection),
    configured: Boolean(provider?.isConfigured()),
  });

  if (plan === "provider" && provider && connection) {
    try {
      const link = await provider.createCheckoutLink({
        tokens: connection.tokens,
        accountId: connection.accountId,
        amountCents: input.depositCents,
        description: input.description,
        appointmentId: input.appointmentId,
        returnUrl: `${input.origin}/api/booking/deposit-return?appointment=${input.appointmentId}`,
      });
      await admin
        .from("appointments")
        .update({
          deposit_provider: provider.key,
          deposit_checkout_id: link.checkoutId,
          deposit_checkout_url: link.url,
        })
        .eq("id", input.appointmentId);
      return { checkoutUrl: link.url };
    } catch {
      // Degrade to manual — never lose the booking over a checkout hiccup.
    }
  }

  await admin
    .from("appointments")
    .update({ deposit_provider: "manual" })
    .eq("id", input.appointmentId);
  return { checkoutUrl: null };
}
```

- [ ] **Step 2: Wire the three actions.** In each: compute `depositCents`; insert with `status`/`deposit_status`/`hold_expires_at` per contract point 1 (a small local helper `depositInsertFields(depositCents)` returning the three fields keeps it DRY inside actions.ts); after successful insert call `applyDepositToAppointment` and return `checkoutUrl` in the result. `import { headers } from "next/headers"` for origin (`const h = await headers(); const origin = h.get("origin") ?? \`https://${h.get("host") ?? "localhost:3002"}\`;`).

- [ ] **Step 3: Verify + commit** — 36 checks, tsc, lint.

```bash
git add lib/booking/deposits/orchestrate.ts app/book/actions.ts
git commit -m "feat(booking): deposit orchestration with holds and checkout links"
```

---

### Task 7: Webhooks, verify-on-return, cron sweep

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`
- Create: `app/api/webhooks/square/route.ts`
- Create: `app/api/booking/deposit-return/route.ts`
- Create: `app/api/cron/deposit-sweep/route.ts`
- Create: `lib/booking/deposits/confirm.ts` (the one idempotent transition, shared by all four)
- Modify: `vercel.json` (add sweep cron)

**Interfaces:**
- `confirm.ts`: `confirmDepositPaid(admin, appointmentId): Promise<"confirmed" | "refund_due" | "noop">`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The single idempotent paid-transition. Webhook, redirect verification,
 * cron sweep, and manual confirmation all converge here.
 * Late payment after hold-expiry cancellation becomes refund_due — money
 * never disappears.
 */
export async function confirmDepositPaid(
  admin: SupabaseClient,
  appointmentId: string
): Promise<"confirmed" | "refund_due" | "noop"> {
  const paidAt = new Date().toISOString();
  const { data: confirmed } = await admin
    .from("appointments")
    .update({ status: "confirmed", deposit_status: "paid", deposit_paid_at: paidAt })
    .eq("id", appointmentId)
    .eq("status", "pending_deposit")
    .eq("deposit_status", "pending")
    .select("id");
  if (confirmed && confirmed.length > 0) return "confirmed";

  const { data: refund } = await admin
    .from("appointments")
    .update({ deposit_status: "refund_due", deposit_paid_at: paidAt })
    .eq("id", appointmentId)
    .eq("status", "cancelled")
    .eq("deposit_status", "pending")
    .select("id");
  if (refund && refund.length > 0) return "refund_due";
  return "noop";
}
```

**Route specs:**
- **Stripe webhook** (POST): `const raw = await request.text()`; `verifyStripeSignature(raw, request.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET ?? "")` else 400. Parse; only `checkout.session.completed` with `data.object.payment_status === "paid"` acts: `appointment_id = data.object.metadata?.appointment_id`; guard: appointment's `deposit_checkout_id` must equal `data.object.id` (fetch row via admin first); then `confirmDepositPaid`. Always 200 on handled/ignored (Stripe retries non-2xx).
- **Square webhook** (POST): raw body; `verifySquareSignature(raw, request.headers.get("x-square-hmacsha256-signature"), process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? "", request.url)` else 400. Event `payment.updated` where `data.object.payment.status === "COMPLETED"`: `order_id = data.object.payment.order_id` → find appointment by `deposit_checkout_id = order_id` and `deposit_provider = 'square'` → `confirmDepositPaid`. 200 always after verify.
- **deposit-return** (GET): `appointment` query param (uuid regex or 400). Admin-load the row; if `deposit_status === "pending"` and provider ∈ stripe|square: `getPaymentConnection(admin, artist_id, provider)` → `verifyCheckout` → `"paid"` → `confirmDepositPaid`. Redirect (302) to `/dashboard?deposit=paid` when confirmed/already-paid else `/dashboard?deposit=pending`. Never expose row data.
- **deposit-sweep** (GET, `Authorization: Bearer ${CRON_SECRET}` exactly like `pause-unconfirmed`): select up to 50 appointments `status='pending_deposit'`, `deposit_status='pending'`, `deposit_provider in ('stripe','square')`, `created_at < now - 10 min`; for each, verify + confirm; return `{ scanned, confirmed }`.
- `vercel.json` crons array gains `{ "path": "/api/cron/deposit-sweep", "schedule": "*/30 * * * *" }`.

- [ ] **Steps 1-6:** Implement per spec, verify (`36 checks`, tsc, lint), commit.

```bash
git add app/api/webhooks/ app/api/booking/deposit-return/ app/api/cron/deposit-sweep/ lib/booking/deposits/confirm.ts vercel.json
git commit -m "feat(booking): deposit webhooks, verify-on-return, cron sweep"
```

---

### Task 8: Deposit UI — connect, pay, mark received

**Files:**
- Modify: `components/booking/booking-settings-panel.tsx` (payment provider section)
- Create: `components/booking/use-payment-status.ts`
- Create: `components/booking/pending-deposit-banner.tsx`
- Modify: `components/booking/booking-flow.tsx` + `customer-request-panel.tsx` (redirect to checkout)
- Modify: `components/booking/upcoming-appointments-card.tsx` (+ mark received / waive)
- Create: `app/book/deposit-actions.ts` (`markDepositReceived`, `waiveDeposit` server actions)
- Modify: `components/dashboard/customer/customer-dashboard.tsx` (render banner)
- Modify: `components/booking/index.tsx`

**Behavior spec:**
- `use-payment-status.ts`: fetches `/api/payments/status` (inline-IIFE effect), returns `{ status, loading, refresh }`.
- Settings panel gains a "Deposits" section under the deposit-amount select: per provider a row with connected account name + Disconnect (POST to `/api/payments/{p}/disconnect`, then `refresh`), or a Connect link (`<a href="/api/payments/{p}/start">` styled as the panel's buttons); provider radio (SelectRow: none/stripe/square) bound to `settings.paymentProvider`. Show "not configured on this deployment" hint when `configured` is false.
- `bookConsultation`/`bookFlash`/`scheduleFromRequest` callers: when result has `checkoutUrl`, `window.location.assign(result.checkoutUrl)` instead of the success state (the return route brings them back to `/dashboard?deposit=paid`).
- `PendingDepositBanner`: props `records: AppointmentRecord[]`; renders nothing unless some record has `status === "pending_deposit"` && `depositStatus === "pending"` && `depositCheckoutUrl`; each row: artist name, `$deposit`, "Pay deposit" link (`<a href={depositCheckoutUrl}>`), hold deadline copy ("hold expires {time}" from `hold...` — the record has no holdExpiresAt field; omit the deadline, keep copy "complete payment to lock in your time"). Rendered in the customer dashboard activity tab above `CustomerAppointmentsSection`, fed `dashboard.appointmentRecords` (already exposed).
- `deposit-actions.ts`: both actions verify the caller owns the artist (same `artists` lookup as `respondToBookingRequest`) and the appointment's `artist_id` matches; transitions: mark received → `update set deposit_status='paid', deposit_paid_at=now, status='confirmed' where id and status='pending_deposit' and deposit_status='pending'` (user-scoped server client — RLS "Providers manage appointments" allows it); waive → same guard, `deposit_status='waived', status='confirmed'`. 0 rows → "already handled".
- Upcoming card: `pending_deposit` rows show an amber "awaiting deposit" tag; when `depositStatus === "pending"`, two small buttons Mark received / Waive calling the actions then refetching (`useArtistUpcoming` gains a `refresh`).

- [ ] **Steps 1-7:** Implement per spec; verify (36 checks, tsc, lint scoped clean); commit.

```bash
git add components/booking/ components/dashboard/customer/customer-dashboard.tsx app/book/deposit-actions.ts
git commit -m "feat(booking): deposit UI - provider connect, pay banner, mark received"
```

---

### Task 9: Verification sweep + transition smoke

- [ ] **Step 1:** Full check run — 36 booking checks, 44 builder checks, tsc clean, 17 baseline lint errors.
- [ ] **Step 2:** Service-role smoke (scratchpad, deleted after), asserting against live DB with a throwaway artist:
  1. Insert `pending_deposit` appointment with `hold_expires_at` in the past → run the hold-release SQL manually (same statement as the cron) → row is `cancelled`, `deposit_status` still `pending`.
  2. `confirmDepositPaid`-equivalent UPDATE on the cancelled row → lands as `refund_due` (late-payment path).
  3. Fresh `pending_deposit` row → paid-transition UPDATE → `confirmed`/`paid`; second identical UPDATE → 0 rows (idempotent).
  4. Cleanup.
- [ ] **Step 3:** Report to Tanner: env vars needed to go live (`STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SQUARE_WEBHOOK_SIGNATURE_KEY`), webhook URLs to register (`/api/webhooks/stripe` on the Connect application, `/api/webhooks/square`), Square console redirect URL (`/api/payments/square/callback`), Stripe redirect (`/api/payments/stripe/callback`), and that everything degrades to the manual mark-received path until credentials exist.
- [ ] **Step 4:** Commit any sweep fixes (specific files).
