# External Integrations — Setup Guide

Studios link accounts via OAuth at `/api/integrations/[platform]/connect`.
Tokens are AES-256-GCM sealed in the `studio_connections` table (deny-all RLS,
service-role only); the client only ever sees the `studios.integrations`
projection. Everything below is free — no paid vendor plan is required to run
the integration itself.

## What each connection does

| Platform | On connect | Data pull |
|---|---|---|
| Calendly | Auto-sets the booking link to the account's `scheduling_url`; site Book buttons + embedded scheduler go live | — |
| Square | Links the merchant account | "Sync business hours" imports location hours into the studio profile |
| Instagram | Links the profile; fills the Instagram social field if empty | "Import photos" copies recent posts into Supabase Storage → gallery (IG CDN URLs expire, so media is never hot-linked) |
| Facebook | Links the Page; fills the Facebook social field if empty | — |

Link-only by vendor design (no free API exists): Yelp (Fusion is paid-only),
Trustpilot (widgets/API paywalled), Booksy/Vagaro/Fresha/DaySmart (no public
API), Google Business Profile (API access is approval-gated — apply via
Google's GBP API form; until approved, Google stays link + place-id powered,
which already drives maps/directions/write-review deep links for free).

## 1. Square (self-serve, works today)

1. https://developer.squareup.com → create an application.
2. Sandbox first: copy the **sandbox** Application ID/Secret into
   `SQUARE_OAUTH_CLIENT_ID` / `SQUARE_OAUTH_CLIENT_SECRET`, keep
   `SQUARE_ENVIRONMENT=sandbox`.
3. In the app's OAuth settings register the redirect URL **exactly**:
   `http://localhost:3000/api/integrations/square/callback` (and the https
   production equivalent later). Square's authorize URL takes no redirect_uri —
   the console registration is the only source of truth.
4. Scope requested: `MERCHANT_PROFILE_READ` (least privilege — merchant +
   locations reads). Add `APPOINTMENTS_READ`/`APPOINTMENTS_ALL_READ` when
   bookings sync ships.
5. Production OAuth is self-serve (no review needed unless listing on the App
   Marketplace).
6. Ops note: Square wants refresh on a ≤7-day cadence; refresh currently
   happens lazily before imports. Add a weekly cron hitting the refresh path
   before launch scale.

## 2. Calendly (self-serve, works today)

1. https://developer.calendly.com → create a developer account (separate from
   the Calendly user account) → create an OAuth app: **web**, **Sandbox**
   environment for localhost.
2. Redirect URI: `http://localhost:3000/api/integrations/calendly/callback`.
3. Copy client id/secret into `CALENDLY_OAUTH_CLIENT_ID/SECRET`.
4. Behavior notes: access tokens last 2h; refresh tokens are **single-use with
   rotation** (enforced mid-2026) — the code persists the rotated token
   immediately; don't run concurrent refreshes for one connection.

## 3. Meta — Instagram + Facebook (works now for testers; App Review to go live)

1. https://developers.facebook.com → create an app.
2. Add the **Instagram** product → "API setup with Instagram login". Copy the
   Instagram app ID/secret into `INSTAGRAM_APP_ID/SECRET`. Scope used:
   `instagram_business_basic`. The studio's IG must be a professional
   (business/creator) account; no Facebook Page is required for this flow.
3. Add **Facebook Login** for the Pages link (`pages_show_list`); copy the
   main app ID/secret into `META_APP_ID/SECRET`.
4. Redirect URIs to register on both products:
   `http://localhost:3000/api/integrations/instagram/callback` and
   `http://localhost:3000/api/integrations/facebook/callback`.
5. Access levels: with Standard Access only users holding an app role
   (admin/developer/tester or Instagram Tester) can connect — perfect for
   pre-launch. To let arbitrary studios connect, submit **App Review** for the
   permissions plus (free) **Business Verification**. File early: this is
   weeks, not hours.
6. Instagram long-lived tokens last 60 days and refresh only after they're
   24h old; an unrefreshed token dies permanently (re-auth). Refresh happens
   lazily before imports — add the same weekly cron as Square before launch.

## 4. Google Maps embeds (optional, free)

Set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` (Maps Embed API key — free and
unlimited, but needs a Google Cloud project with billing enabled) to turn the
map placeholder on studio sites into a real embedded map. Without the key,
sites keep the designed placeholder plus keyless official directions links.

## 5. Token encryption key

`INTEGRATIONS_TOKEN_KEY` seals token columns (AES-256-GCM). Dev falls back to
a derivation of the service-role key so localhost is zero-config; generate a
dedicated value for production:

```bash
openssl rand -base64 32
```
