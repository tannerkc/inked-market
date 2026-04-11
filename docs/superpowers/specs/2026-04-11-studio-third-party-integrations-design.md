# Studio Third-Party Integrations Design

## Context

Studios joining Inked Market already have established presences across multiple platforms -- Google Business profiles, Yelp listings, booking software (Square, Acuity, Booksy), and POS systems. Forcing studios to manually re-enter all their data creates onboarding friction and makes profiles feel incomplete. This design creates an **Integration Hub** in the studio dashboard where studios can either **link** (paste a URL) or **connect** (OAuth import) their existing third-party services, reducing setup effort and enriching their public profile with verified external data.

---

## Architecture: Integration Hub

A dedicated **Integrations** section in the studio dashboard. Each third-party service is represented as a card with two modes:

- **Link Mode** (all tiers): Studio pastes a URL. Displayed as a branded button/badge on their public profile. No API calls, no OAuth. Works immediately.
- **Connect Mode** (tier-gated): Studio authorizes via OAuth. Inked Market pulls data (reviews, bookings, business details) into the platform.

Cards are grouped by category with section headers: Business Profile, Reviews, Booking, POS.

---

## Integration Categories & Services

### Business Profile

| Service | Link Mode | Connect Mode | API |
|---|---|---|---|
| Google Business | Link to listing | Import name, address, hours, photos, description via Places API | Google Places API (New) |
| Yelp | Link to listing | Display badge (rating + count) | Yelp Fusion API v3 |
| Facebook | Link to page | Low priority (binary reviews, restrictive API) | Graph API (heavily gated) |

### Reviews

| Service | Link Mode | Connect Mode | API |
|---|---|---|---|
| Google Reviews | Link to listing | Import up to 5 reviews via Places API; full reviews via Business Profile API at scale | Places API (New) / Business Profile API |
| Yelp Reviews | Link to listing | Embed official Yelp Review Badge/Widget | Yelp Fusion API + Badge |

### Booking

| Service | Link Mode | Connect Mode | API |
|---|---|---|---|
| Square Appointments | Link to booking page | Full R/W: availability, bookings, client sync, historical import | OAuth 2.0, REST API |
| Acuity (Squarespace) | Link to booking page | Full R/W: availability, bookings, client sync | OAuth 2.0, REST API |
| Calendly | Link to booking page | Read-only sync of bookings | OAuth 2.0, REST API |
| Booksy | Link to booking page | None (walled garden, no public API) | N/A |
| Fresha | Link to booking page | Partner API (must apply) | OAuth 2.0 (gated) |
| DaySmart | Link to booking page | Partner API (must apply) | API key (gated) |
| Vagaro | Link to booking page | Partner API (must apply) | OAuth 2.0 (gated) |
| Other/Generic | Paste any booking URL | iCal import, CSV client import | Universal fallback |

### POS

| Service | Link Mode | Connect Mode | API |
|---|---|---|---|
| Square POS | N/A | Transaction history, customer data, payment sync | OAuth 2.0, REST API |
| Clover | N/A | Orders, payments, customers | OAuth 2.0, REST API |
| Shopify POS | Link to store | Orders, customers, products | OAuth 2.0, REST + GraphQL |
| SumUp | N/A | Transaction history | OAuth 2.0, REST API |

---

## Tier Gating

| Feature | Liner ($19.85/mo) | Shader ($59.85/mo) | Magnum ($79.85/mo) |
|---|---|---|---|
| Direct Links (paste URL, any service) | All | All | All |
| Google Business import (auto-fill profile) | Yes | Yes | Yes |
| Review badges (Google rating, Yelp badge) | Yes | Yes | Yes |
| Booking platform connect (OAuth sync) | -- | Yes | Yes |
| Client list import (CSV or API pull) | -- | -- | Yes |
| Booking migration (historical data import) | -- | -- | Yes |
| POS connect (Square, Clover, Shopify) | -- | -- | Yes |
| Multi-platform sync | -- | -- | Yes |

**Rationale:**
- Liner gets links + Google auto-fill + review badges. Makes the profile-style listing feel complete.
- Shader gets booking connect -- the core feature that makes the platform functional for appointment-driven studios.
- Magnum gets migration/POS/client import -- power-user features for studios fully committing to Inked Market.

---

## Dashboard UX

### Entry Point

New **"Integrations"** card in the studio dashboard alongside existing cards (Profile, Hours, Services, Artists, Your Studio Page). Shows connected count (e.g., "2 of 12 connected") and logos of connected services.

### Integration Hub Page

Grid of integration cards grouped by category headers (Business Profile, Reviews, Booking, POS).

**Each card shows:**
- Service logo + name
- Connection status: `Not Connected` | `Linked` | `Connected` | `Syncing`
- One-line description of what it does
- Tier badge with upsell hint for locked features

**Card states:**
1. **Not Connected** -- CTA: "Link" and/or "Connect" buttons
2. **Linked** -- Shows the URL, "Edit" and "Remove" options
3. **Connected (OAuth)** -- Sync status, last synced time, "Disconnect" and "Sync Now" buttons
4. **Locked** -- Grayed out, tier badge, "Upgrade to unlock" CTA

### Link Flow

1. Studio clicks "Link" on a service card
2. Modal opens with URL text input + help text ("Paste your [Service] page URL")
3. URL validated against expected pattern (e.g., starts with `yelp.com/biz/`)
4. Save. Branded badge appears on public profile.

### Connect Flow (OAuth)

1. Studio clicks "Connect" on a service card
2. Redirect to third-party OAuth consent screen
3. On callback, store tokens, show "Connected" state
4. Background sync begins immediately
5. Card shows sync progress and what was imported

### Public Profile Display

Connected integrations appear on the studio's public profile:
- **Review badges** in the details section (Google 4.8/5 with Google logo, Yelp 4.5/5 with Yelp logo, each linking to source)
- **Booking CTA** becomes functional: "Book Now" links out (Link mode) or opens in-platform flow (Connect mode)
- **Business hours** auto-synced from Google Business if connected

---

## API Deep Research

### Google Business / Reviews

**Recommended path: Google Places API (New)**

- Publicly accessible to any developer with a Google Cloud project + billing
- No user OAuth needed -- uses API key
- Returns: name, address, phone, hours, photos, description, rating, up to 5 reviews
- Reviews are "most relevant" (Google's algorithm), not all reviews
- Cost: $20/1K calls (Advanced tier, for reviews). $200/mo free credit from Google.
- Cache allowed for 30 days, then must refresh or delete
- Attribution: "Powered by Google" logo mandatory

**Google Business Profile API (future, at scale)**

- Gated to partners managing 100+ business locations
- Returns ALL reviews with pagination, full text
- Free to use once approved
- OAuth 2.0 with `business.manage` scope (sensitive/restricted, requires Google security review)
- Apply when Inked Market has 100+ active studios

**Auto-fill flow:**
1. Studio enters name + city during onboarding or from Integration Hub
2. Places API Text Search: `POST /v1/places:searchText` with `textQuery: "Studio Name, City, State"` ($32/1K, one-time)
3. Present matching results, studio confirms their listing
4. Pull details: `GET /v1/places/{placeId}` with field mask for hours, phone, address, reviews ($20/1K, cache 30 days)
5. Auto-populate profile fields, studio can edit before saving

**Cost projection (early stage, 200 studios, 5K MAU):**

| Operation | Monthly Volume | Cost/1K | Monthly Cost |
|---|---|---|---|
| Studio onboarding (Text Search) | 50 | $32 | $1.60 |
| Profile page views (Place Details for reviews) | 3,000 | $20 | $60.00 |
| Photo fetches | 2,000 | $7 | $14.00 |
| **Total before credit** | | | **$75.60** |
| **Google $200/mo credit** | | | **-$75.60** |
| **Net cost** | | | **$0.00** |

Comfortably free until ~1,000+ active studios with real traffic.

### Yelp

**Yelp Fusion API v3**

- Authentication: API key (Bearer token), free, self-serve
- Business Search: `GET /v3/businesses/search` -- search by term + location, returns up to 50 results
- Business Match: `GET /v3/businesses/matches` -- match by name + address (useful for linking)
- Reviews: `GET /v3/businesses/{id}/reviews` -- **only 3 reviews returned**, text truncated to 160 chars
- Rate limit: 5,000 calls/day across all endpoints
- Cache: 24-hour max. No permanent storage.
- Attribution: Yelp logo, Yelp star assets (their specific images, not custom stars), link to biz page -- ALL mandatory
- Cannot: blend Yelp rating into composite score, modify review text, store permanently, display more than 3 reviews

**Better option: Yelp Review Badge/Widget**
- Official embeddable widget showing rating + review count
- Handles all attribution requirements automatically
- Links out to Yelp for full reviews
- Available at yelp.com/developers/yelp_badge
- Lower engineering cost, zero ToS risk

**Recommendation:** Use Yelp API for Business Match only (linking studio to their Yelp listing). Use official Yelp Badge for display. Do not attempt to pull and render Yelp reviews in custom UI -- the restrictions make it impractical.

### Facebook Reviews

**Not recommended for initial implementation.**

- Renamed to "Recommendations" -- binary yes/no, no star ratings
- Graph API `/{page-id}/ratings` requires `pages_read_user_content` permission
- Facebook App Review process takes weeks-months, approval is difficult for aggregators
- Restrictive post-Cambridge Analytica API policies
- Low value: binary recommend/not-recommend is less useful than star ratings
- **Action:** Support as a Direct Link only. Skip API integration entirely.

### Booking Platforms

#### Square Appointments (Priority #1)

**API surface:**
- Bookings API: full CRUD (`POST /v2/bookings`, `GET /v2/bookings/{id}`, `PUT`, `POST .../cancel`, `POST /v2/bookings/search`)
- Customers API: full CRUD with custom attributes
- Catalog API: services, pricing, durations
- Team API: staff/artist management
- Locations API: multi-location support

**Auth:** OAuth 2.0 with granular scopes: `APPOINTMENTS_READ`, `APPOINTMENTS_WRITE`, `CUSTOMERS_READ`, `CUSTOMERS_WRITE`, `MERCHANT_PROFILE_READ`, `EMPLOYEES_READ`, `PAYMENTS_READ`, `ORDERS_READ`

**Webhooks:** `booking.created`, `booking.updated`, `customer.created`, `customer.updated`, `payment.completed`

**Cost:** Free API. Square charges merchant standard processing (2.6% + $0.10 in-person).

**Migration:** Full historical booking data accessible via `POST /v2/bookings/search` with date range filters. Client lists via paginated `POST /v2/customers/search`. Supports bulk export.

**Rate limit:** 1,000 requests per 60 seconds per application.

#### Acuity Scheduling (Priority #2)

**API surface:**
- `GET /api/v1/appointments` -- list with date range filters, canceled status
- `POST /api/v1/appointments` -- create
- `PUT /api/v1/appointments/{id}` -- update
- `PUT /api/v1/appointments/{id}/cancel` -- cancel
- `GET /api/v1/clients` -- list clients
- `GET /api/v1/calendars` -- list calendars (one per artist)
- `GET /api/v1/appointment-types` -- list services
- `GET /api/v1/availability/dates` and `/times` -- check availability

**Auth:** OAuth 2.0 for multi-merchant use. Basic Auth for direct access.

**Webhooks:** Via Zapier or native webhook feature. Events: appointment scheduled, rescheduled, canceled, completed.

**Cost:** Included with Acuity subscription. No API fees.

**Embeddable widget:** iFrame + JS embed with CSS customization for colors/fonts. "Schedule" button opens modal.

**Migration:** Full historical data via paginated endpoints. Client records include name, email, phone, appointment history, intake form responses.

#### Calendly (Priority #3)

**API surface:**
- `GET /scheduled_events` -- list events with date/status filters
- `GET /scheduled_events/{uuid}` -- event details
- `GET /event_types` -- list services
- `GET /users/{uuid}/availability_schedules` -- availability
- **Cannot create bookings via API** -- read-only for events

**Auth:** OAuth 2.0 or Personal Access Tokens.

**Webhooks:** `invitee.created`, `invitee.canceled`, `routing_form_submission.created`

**Cost:** API requires Professional plan ($12/user/mo). No per-call charges.

**Limitation:** No write access for bookings. Can only read and display. Cannot create appointments on behalf of customers. More suited to "consultation booking" than full appointment management.

#### Booksy (Popular but closed)

- No public API. Invitation-only partner program.
- Very popular with tattoo artists and barbers.
- Offers a "Book Now" button for websites (link-out, not true embed).
- CSV export of client data and appointment history from dashboard.
- **Integration path:** Direct link only. Explore business partnership at scale.

#### Fresha, DaySmart, Vagaro (Partner-gated)

- All have REST APIs gated behind partner programs requiring application and approval.
- DaySmart (formerly Orchid/DaySmart Body Art) is the most established tattoo-specific platform with a documented partner API program. Apply early.
- Fresha is free for businesses (monetizes through payment processing) -- many cost-conscious studios use it.
- **Action:** Apply for all three partner programs when Inked Market has 50+ active studios. Build adapters when approved.

#### GlossGenius (Skip)

- No public API. No documented partner program. Completely closed.
- Manual data export only (if available).
- **Action:** Direct link only.

### POS Systems

#### Square POS (Priority #1, same OAuth as Appointments)

- Payments API: full CRUD + refunds, tips, split payments
- Orders API: full lifecycle, line items, discounts, taxes
- Inventory API: stock tracking
- Customers API: shared with Appointments
- Terminal API: hardware control
- **Same OAuth token** as Square Appointments -- one connect flow covers both

#### Clover (Priority #2)

- Orders, Payments, Customers, Inventory, Employees APIs
- REST endpoints: `https://api.clover.com/v3/merchants/{mId}/...`
- OAuth 2.0. Apps must be published to Clover App Market or use developer tokens.
- Webhooks for orders, payments, customers.
- More common in retail-oriented tattoo shops selling merchandise/jewelry.

#### Shopify POS (Priority #3)

- Excellent API (REST + GraphQL Admin API)
- Full access to orders, customers, products, inventory
- OAuth 2.0. Rate limited (40 req/sec on higher plans).
- Relevant for studios selling merchandise, prints, flash sheets, gift cards.

#### SumUp (Low priority)

- Transaction history, payment links/checkouts
- Popular for mobile/pop-up tattoo events and conventions
- Moderate API. No comprehensive business management features.

### Migration Feasibility Summary

| Source | Bookings | Clients | Transactions | Method |
|---|---|---|---|---|
| Square | Full history | Full export | Full history | API (paginated search) |
| Acuity | Full history | Full export | N/A | API (paginated list) |
| Calendly | Read-only | Limited | N/A | API (read events) |
| Booksy | Manual | Manual | Manual | CSV export from dashboard |
| Fresha | Full (if partner) | Full (if partner) | Full (if partner) | Partner API |
| DaySmart | Full (if partner) | Full (if partner) | N/A | Partner API |
| Clover | N/A | Full | Full history | API |
| Any platform | Dates/times only | Name/email/phone | N/A | iCal import / CSV upload |

**Universal fallback:** CSV upload with flexible column mapper + dedup on email/phone. iCal import for appointment dates (loses rich metadata like service type, deposits, notes).

---

## Booking Adapter Architecture

All booking integrations implement a common adapter interface, following CLAUDE.md guidance: "Keep booking UI as a thin adapter layer that can swap backends."

```typescript
interface BookingAdapter {
  // Connection
  getAuthUrl(): string;
  handleOAuthCallback(code: string): Promise<ConnectionCredentials>;
  
  // Availability
  getAvailableSlots(params: {
    artistId: string;
    dateRange: { start: Date; end: Date };
    serviceId?: string;
  }): Promise<TimeSlot[]>;
  
  // Bookings
  createBooking(params: CreateBookingInput): Promise<Booking>;
  cancelBooking(bookingId: string, reason?: string): Promise<void>;
  getBooking(bookingId: string): Promise<Booking>;
  listBookings(params: DateRangeFilter): Promise<Booking[]>;
  
  // Clients
  getClients(params: PaginationParams): Promise<Client[]>;
  createClient(client: ClientInput): Promise<Client>;
  
  // Sync
  syncBookings(since: Date): Promise<SyncResult>;
  registerWebhook(events: string[], callbackUrl: string): Promise<void>;
}
```

**Implementations:**
- `SquareBookingAdapter` -- full R/W, webhooks, client sync
- `AcuityBookingAdapter` -- full R/W, webhooks, client sync
- `CalendlyBookingAdapter` -- read-only, webhooks
- `ManualBookingAdapter` -- for studios without existing software (Inked Market native)

---

## Legal & Compliance

- **Yelp ToS:** Most restrictive. No permanent storage, mandatory branded assets, no composite scores. Use official badge only.
- **Google:** 30-day cache, "Powered by Google" attribution required. Cannot scrape -- use APIs only.
- **GDPR:** Imported reviews contain personal data. Respect source platform's deletion. Short cache windows safest. Client data migration requires business to have legal basis to share.
- **Web scraping:** Not viable for any platform. All major platforms prohibit it and enforce technically + legally.
- **Review attribution:** Each platform's reviews must be displayed in clearly branded, separate sections. Never blend into a single composite score.

---

## Implementation Phases

### Phase 1: Direct Links

All tiers. Every integration service gets "Link" mode. Studio pastes URL, we validate, display as branded badge on public profile.

Priority services: Google Business, Yelp, Booksy, Square, Acuity, Calendly, any custom booking URL.

### Phase 2: Google Auto-Fill + Review Badges

All tiers. Places API auto-populate during onboarding or from Integration Hub. Display Google rating badge and Yelp badge on public profile.

APIs: Google Places API (New) for search + details. Yelp Fusion API for business match. Yelp Badge widget for display.

### Phase 3: Booking Platform Connect

Shader+. OAuth connect for Square Appointments and Acuity. Read availability, sync bookings, functional "Book Now" on public profile.

Architecture: BookingAdapter interface with per-platform implementations + webhook handlers.

### Phase 4: Client Import & Booking Migration

Magnum. Import client lists (CSV universal + API for connected platforms). Import historical bookings. Dedup on email/phone.

Migration wizard: detect platform, guide through export/import. API-connected platforms pull automatically; others use CSV upload with flexible column mapping.

### Phase 5: POS Connect

Magnum. OAuth connect for Square POS, Clover, Shopify POS. Sync transactions, customer purchase data, revenue analytics.

### Phase 6: Advanced (Future)

- Apply for partner programs (Fresha, DaySmart, Vagaro, Booksy) as studio count grows past 50+
- Google Calendar two-way sync
- Embeddable "Book on Inked Market" widget for studios' own websites
- Google Business Profile API (full reviews) when approved as partner at 100+ studios
- Multi-platform sync (e.g., Square POS + Acuity booking simultaneously)
