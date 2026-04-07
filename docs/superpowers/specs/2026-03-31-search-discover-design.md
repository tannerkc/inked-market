# Search & Discover — Design Spec

## Context

The current `/discover` page is a curated editorial landing showing featured shops and artists. The "View All" button links to itself. There is no way to search, filter, or browse the full catalog. This spec defines a dedicated search page that transforms Inked Market from a showcase into a functional discovery tool.

## Decisions

| Decision | Choice |
|----------|--------|
| Route strategy | New `/discover/search` route; discover landing stays as-is |
| Entity organization | Tabbed: Artists \| Studios with tab-specific filters |
| Visual tone | Theme-aware (light + dark, respects system preference) |
| Result cards | Rich cards with portfolio image strip in a responsive grid |
| Filter UX | Compact filter bar with animated dropdown panels + active chips |
| URL state | Full deep-linkable query params; discover page hands off context |

## Route & Navigation

**New route:** `app/discover/search/page.tsx` — `"use client"` (needs `useState` for dropdowns, `useSearchParams` for filter state).

**URL schema:**

| Param | Type | Example | Default |
|-------|------|---------|---------|
| `tab` | `"artists" \| "studios"` | `tab=artists` | `artists` |
| `q` | string | `q=fine+line` | empty |
| `styles` | comma-separated slugs | `styles=fine-line,japanese` | empty (all) |
| `location` | slug | `location=los-angeles-ca` | empty (all) |
| `rating` | number | `rating=4.5` | empty (any) |
| `exp` | range string | `exp=5-10` | empty (any) |
| `verified` | boolean | `verified=true` | empty (false) |
| `booking` | boolean | `booking=true` | empty (false) |
| `sort` | enum | `sort=rating` | `relevance` |
| `page` | number | `page=2` | `1` |

**Connections from discover page:**
- "View All" → `/discover/search?tab=artists` (carries active filter if set)
- Search bar submit → `/discover/search?q={query}`
- Style filter pills → `/discover/search?tab=artists&styles={style}`

## Page Layout

Four vertical zones, top to bottom:

### 1. Header Zone (sticky below nav)

- **Search bar:** Centered, max-width ~520px, pill shape. Reuses `DiscoverSearch` component pattern (light/dark variant).
- **Entity tabs:** Artists | Studios, underline style, centered. Updates `tab` URL param.
- **Filter bar:** Compact trigger buttons (Style ▾, Location ▾, Rating ▾, Experience ▾) + inline toggles (Verified, Booking Open). Filter triggers open animated dropdown panels below.
- **Dropdown panels:** Centered, max-width ~520px. Animate open/closed. Contain the full filter UI for that category (multi-select pills, location search, rating options, experience chips).
- **Active chips row:** Removable filter chips with × buttons and "Clear all".

### 2. Results Meta

- Left: result count ("Showing 12 artists")
- Right: sort dropdown (Relevance, Rating, Reviews, Newest)

### 3. Results Grid

Responsive grid: 1 col → 2 cols (sm) → 3 cols (lg). Rich cards with portfolio strip, linking to detail pages.

### 4. Load More

"Load More" button (not infinite scroll). Shows "Showing X of Y results" count.

## Filter Differences by Tab

| Filter | Artists Tab | Studios Tab |
|--------|------------|-------------|
| Style | All 15 TattooStyle values | Shop specialties |
| Location | City/state | City/state |
| Rating | Min rating threshold | Min rating threshold |
| Experience | Years range (1-3, 3-5, 5-10, 10+) | **Team Size** (1-3, 4-8, 8+ artists) |
| Verified | Toggle | Toggle |
| Booking Open | Toggle | **Walk-ins Welcome** |

Experience swaps to Team Size and Booking Open swaps to Walk-ins when switching to Studios tab. Filter bar trigger labels update accordingly.

## Search Result Card

### Artist Card

```
┌─────────────────────────────────────────┐
│ [img1 (wider)] [img2] [img3] [img4]    │  ← portfolio strip, ~120px
├─────────────────────────────────────────┤
│ (avatar) Name ●verified    ★ 4.9 (243) │
│ City, State                              │
│ [Style1] [Style2] [Style3]              │
└─────────────────────────────────────────┘
```

### Shop Card

```
┌─────────────────────────────────────────┐
│ [img1 (wider)] [img2] [img3] [img4]    │  ← gallery strip from shop.images
├─────────────────────────────────────────┤
│ (avatar) Name ●verified       ★ 4.8    │
│ City, State · 3 artists                  │
│ [Specialty1] [Specialty2] [Specialty3]   │
└─────────────────────────────────────────┘
```

**Interactions:**
- Entire card is a `next/link` to detail page
- Portfolio strip: `saturate-0.85` at rest, normalizes on hover
- Card lifts on hover (`translateY(-2px)`, border brightens)
- Verified dot: sage with `shadow-ink-sage-glow`

**Theme:**
- Dark: `bg-ink-cream/[0.02]`, `border-ink-cream/[0.06]`, cream text
- Light: `bg-white`, `border-ink-black/[0.06]`, dark text

**Fallbacks:**
- Fewer than 4 images: strip adjusts, first image takes more space
- No images: gradient placeholder with entity name in display font

## Components

### New Components

| Component | Path | Client? | Purpose |
|-----------|------|---------|---------|
| `SearchResultCard` | `components/search/search-result-card.tsx` | No | Rich card with portfolio strip |
| `FilterBar` | `components/search/filter-bar.tsx` | Yes | Filter trigger buttons row |
| `FilterDropdown` | `components/search/filter-dropdown.tsx` | Yes | Animated dropdown panel wrapper |
| `FilterChips` | `components/search/filter-chips.tsx` | Yes | Active filter chips with remove |
| `SearchTabs` | `components/search/search-tabs.tsx` | Yes | Artists \| Studios tab switcher |
| `SortSelect` | `components/search/sort-select.tsx` | Yes | Sort dropdown |
| Barrel export | `components/search/index.tsx` | — | Re-exports all |

### Reused Components (no changes)

- `DiscoverSearch` — pill search bar (light/dark variants)
- `FilterPills` — reuse inside Style dropdown for multi-select
- `Button`, `StatusDot`, `SectionLabel`, `Divider` from `components/ui/`
- Badge type/colors from `FlashCard`

### Data Layer

- **`lib/data/search.ts`** (new) — `searchArtists(filters)` and `searchShops(filters)` functions. Filters existing mock data from `lib/data/artists.ts` and `lib/data/shops.ts`. Returns `PaginatedResponse<T>`.
- **`lib/types/index.ts`** — extend `DiscoverFilters` if needed for `sort` and `exp` fields.

## Filter State & URL Sync

All filter state is URL-driven — no `useState` for filter values.

1. `page.tsx` reads params via `useSearchParams()`
2. Parses into typed filter object
3. Calls `searchArtists()` or `searchShops()` with filters
4. Filter components update URL via `router.replace()` with new params
5. React re-renders on URL change
6. "Load More" is the one piece of `useState` — accumulates pages of results

**Sort logic (mock):**
- `relevance` — verified first, then by rating
- `rating` — descending
- `reviews` — descending by review count
- `newest` — descending by `createdAt`

## Verification

1. `npm run build` — no errors
2. Visit `/discover/search` — default view shows all artists
3. Switch tabs — Studios tab shows shops with swapped filter labels
4. Apply style filters — results update, active chips appear, URL updates
5. Share URL with filters — opening it restores exact filter state
6. Click "View All" on `/discover` — navigates to search with context
7. Click a result card — navigates to correct detail page
8. Test responsive: cards stack 1→2→3 cols, filter bar wraps gracefully
9. Test both themes: toggle system preference, verify all components adapt
10. `npm run lint` — no errors
