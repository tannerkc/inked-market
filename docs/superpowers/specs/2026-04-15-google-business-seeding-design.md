# Google Business Profile Seeding & Claim Flow

## Context

Inked Market faces a classic cold-start problem: the discover and search pages need density to feel valuable, but shops won't sign up until there's user traffic, and users won't visit without shops to browse. This feature solves that by seeding the platform with real tattoo shop data from Google Business Profiles, creating temporary listings that shop owners can then claim to customize and manage.

This also triggers a full Supabase migration — replacing the localStorage-based repository pattern with a real database. The existing repository factory in `lib/repositories/index.ts` was designed for exactly this swap.

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Storage | Supabase | Need persistent server-side data for API keys, business records, claim status |
| Data source | Google Places API (free $200/mo tier) | Legal, reliable, structured data, $0 under free credit |
| Architecture | Unified `studios` table | Simplest queries, claiming is UPDATE not migration |
| Display | Identical cards + subtle "Unclaimed" badge | Maximizes perceived platform density |
| Claim verification | Supabase magic links | Free, built-in, one-click claim+account creation |
| Post-claim | Pre-fill dashboard, full edit access | Lowest friction for shop owners |
| Feature flags | 4-level priority (env var > global DB > per-city DB > per-listing) | Env var fallback if Supabase is down |
| Seeding | CLI script now + admin panel trigger later | Same logic, two entry points |
| Photo storage | Download to Supabase Storage | Own the images, faster page loads, no ongoing API calls |
| Migration scope | Full Supabase migration | One source of truth, no dual-data-source maintenance |

---

## Database Schema

### `studios` table

```sql
CREATE TABLE studios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,

  -- Source tracking
  source          text NOT NULL CHECK (source IN ('google', 'organic')),
  google_place_id text UNIQUE,
  claimed_by      uuid REFERENCES auth.users(id),
  claimed_at      timestamptz,

  -- Location
  address         text,
  city            text NOT NULL,
  state           text NOT NULL,
  zip_code        text,
  latitude        float8,
  longitude       float8,

  -- Contact
  phone           text,
  email           text,
  website         text,

  -- Business data
  hours           jsonb,
  specialties     text[] DEFAULT '{}',
  rating          float4,
  review_count    int DEFAULT 0,

  -- Media
  profile_image   text,
  cover_image     text,
  images          text[],

  -- Visibility
  is_visible      boolean DEFAULT true,

  -- Timestamps
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_studios_source ON studios(source);
CREATE INDEX idx_studios_city_state ON studios(city, state);
CREATE INDEX idx_studios_claimed_by ON studios(claimed_by);
CREATE INDEX idx_studios_slug ON studios(slug);
```

### `seed_config` table

```sql
CREATE TABLE seed_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  enabled    boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Initial entries created by seeding script:
-- key = 'global_seeded_visible' (master toggle)
-- key = 'city:austin_tx' (per-city toggle, one per seeded city)
```

### Supabase Storage

- Bucket: `studio-images`
- Path structure: `seeded/{google_place_id}/{filename}.jpg`
- After claim: images can be re-uploaded to `studios/{studio_id}/`

---

## Feature Flag System

4-level priority chain (first `false` wins):

1. **Env var:** `NEXT_PUBLIC_SEEDED_LISTINGS_ENABLED` — hardest kill switch, works even if Supabase is down
2. **Global DB toggle:** `seed_config` row with `key = 'global_seeded_visible'`
3. **Per-city DB toggle:** `seed_config` rows with `key = 'city:{slug}'` (e.g., `city:austin_tx`)
4. **Per-listing:** `is_visible` column on `studios` table

### Implementation

```typescript
// lib/utils/feature-flags.ts
async function isSeededVisible(studio: Studio): Promise<boolean> {
  // Level 1: Env var kill switch
  if (process.env.NEXT_PUBLIC_SEEDED_LISTINGS_ENABLED === 'false') return false;

  // Organic listings always visible (flag system doesn't apply)
  if (studio.source === 'organic') return true;

  // Level 4: Per-listing
  if (!studio.is_visible) return false;

  // Level 2: Global toggle
  const globalFlag = await getSeedConfig('global_seeded_visible');
  if (!globalFlag?.enabled) return false;

  // Level 3: Per-city toggle
  const cityKey = `city:${slugify(studio.city + '_' + studio.state)}`;
  const cityFlag = await getSeedConfig(cityKey);
  if (!cityFlag?.enabled) return false;

  return true;
}
```

Query-level filtering (more efficient than per-row checks):

```typescript
// Applied in data fetching layer, not components
function buildStudioQuery(supabase, filters) {
  let query = supabase.from('studios').select('*');

  if (process.env.NEXT_PUBLIC_SEEDED_LISTINGS_ENABLED === 'false') {
    query = query.eq('source', 'organic');
  }
  // Additional flag checks via join or subquery on seed_config

  return query;
}
```

---

## Seeding Pipeline

### CLI Script

```
npm run seed:google -- --city "Austin, TX" [--radius 25000] [--dry-run]
```

**Location:** `scripts/seed-google.ts`

**Flow:**
1. Parse CLI args (city name, optional radius in meters, dry-run flag)
2. Call Google Places Text Search: `"tattoo shop in {city}"`
3. Paginate through results (up to 60 per query)
4. For each result, call Place Details for phone, email, hours, photos
5. Check `google_place_id` uniqueness against Supabase
6. Download photos to Supabase Storage (`studio-images/seeded/{place_id}/`)
7. Generate URL slug from name + city
8. Insert into `studios` table with `source: 'google'`
9. Auto-create `seed_config` entry for the city if it doesn't exist
10. Log summary: X new, Y skipped (duplicates), Z errors

**Duplicate handling:**
- `google_place_id` UNIQUE constraint prevents re-seeding same shop
- Normalized exact match (lowercase, strip punctuation) on name + city to detect shops that already signed up organically

### API Credit Budget

| Operation | Cost per call | Per city (~75 shops) | 10 cities |
|---|---|---|---|
| Text Search | $0.032 | ~$0.10 | $1.00 |
| Place Details | $0.025 | ~$1.88 | $18.75 |
| Place Photos | $0.007 | ~$0.53 | $5.25 |
| **Total** | | **~$2.50** | **~$25.00** |

Well within the $200/month free tier.

### Target Cities (initial seed)

**Confirmed:** Raleigh, Charlotte, Los Angeles, New York City, Austin, Houston, Portland, Denver, Miami, Richmond

**Research candidates (high tattoo demand):** Nashville, Chicago, Seattle, San Francisco, Atlanta, Philadelphia, Minneapolis, San Diego, Brooklyn (separate from NYC proper)

---

## Claim Flow

### User Journey

1. **Browse** — User sees seeded listing on discover/search with "Unclaimed" badge
2. **Detail page** — Prominent claim CTA banner: "Is this your shop? Claim it to customize your listing"
3. **Claim page** (`/claim/[studioId]`) — Shows shop name + address for confirmation
4. **Email entry** — User enters the business email (must match the email from Google listing)
5. **Magic link** — Supabase sends magic link to that email
6. **Click link** — User clicks magic link in email, authenticated + account created
7. **Post-claim redirect** — Listing `claimed_by` set to user ID, `source` stays `google` (for analytics), redirected to studio dashboard with all Google data pre-filled
8. **Customize** — Shop owner edits/enhances their listing in the existing dashboard

### Edge Cases

- **No email on Google listing:** Show "Contact support to claim this listing" with a manual review path
- **Already claimed:** "This listing has been claimed" message with support contact
- **Email doesn't match:** Reject with "The email must match the business email on file"
- **User already has a studio account:** Link the claimed listing to their existing account (merge)

### New Page

`/claim/[studioId]` — Server component that:
- Fetches studio by ID, verifies it's unclaimed
- Shows shop name, address, photo for confirmation
- Email input + "Send verification link" button
- Post-verification redirect logic

---

## App Integration

### Data Fetching Layer Changes

**Replace mock data with Supabase queries in:**
- `lib/data/discover.ts` → `getDiscoverStudios()` fetches from Supabase, applies feature flags
- `lib/data/search.ts` → `searchStudios(filters)` queries Supabase with existing filter params
- `lib/data/shops.ts` → `getStudioById(id)` fetches from Supabase

**New files:**
- `lib/supabase/client.ts` — Supabase client initialization
- `lib/supabase/server.ts` — Server-side Supabase client (for Server Components)
- `lib/utils/feature-flags.ts` — Seed visibility logic

### UI Changes

**Cards (no component changes):**
- Seeded listings get badge `{ label: "Unclaimed", color: "sage" }` added to their badge array
- Uses existing `Badge` system from `DiscoverProfile` type
- `ProfileCard`, `FlashCard`, `SearchResultCard` are untouched

**Studio detail page:**
- Add claim CTA banner for unclaimed listings (conditional on `!claimed_by && source === 'google'`)

**New pages:**
- `/claim/[studioId]` — claim verification flow

**Modified pages:**
- `app/discover/page.tsx` — swap mock data for Supabase fetch
- `app/discover/search/page.tsx` — swap mock search for Supabase queries
- `app/studios/[id]/page.tsx` — add claim CTA for unclaimed

### Full Supabase Migration

**Repository swap:**
- Implement `SupabaseStudioRepository` satisfying existing `Repository<StudioData>` interface
- Swap factory in `lib/repositories/index.ts` (the designed one-line change)
- Auth provider migrates to Supabase Auth (replaces localStorage auth)
- Signup flow writes to Supabase instead of localStorage

---

## Verification Plan

### Seeding Script
1. Run `npm run seed:google -- --city "Austin, TX" --dry-run` — verify it logs what it would insert without writing
2. Run without `--dry-run` — verify studios appear in Supabase dashboard
3. Verify photos downloaded to Supabase Storage bucket
4. Run again — verify duplicates are skipped

### Feature Flags
1. Set `NEXT_PUBLIC_SEEDED_LISTINGS_ENABLED=false` — verify seeded listings disappear from discover/search
2. Toggle `global_seeded_visible` to false in Supabase — same result
3. Toggle a specific city off — verify only that city's seeded listings disappear
4. Set `is_visible=false` on one listing — verify it alone disappears

### Discover/Search Pages
1. Load discover page — verify mix of seeded + organic listings render correctly
2. Verify "Unclaimed" badge appears on seeded listings
3. Search/filter — verify seeded listings are included in results
4. Verify existing filters (style, location, rating) work with Supabase data

### Claim Flow
1. Click unclaimed listing — verify claim CTA banner shows on detail page
2. Click "Claim this shop" — verify redirects to `/claim/[studioId]`
3. Enter matching email — verify magic link sent
4. Click magic link — verify account created + listing claimed
5. Verify redirect to studio dashboard with pre-filled Google data
6. Verify "Unclaimed" badge removed from listing
7. Test edge cases: wrong email, already claimed, no email on listing

### Migration
1. Verify existing signup flow works with Supabase Auth
2. Verify studio dashboard reads/writes to Supabase
3. Verify no localStorage remnants for studio data
