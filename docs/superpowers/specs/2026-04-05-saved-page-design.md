# Saved Page — Design Spec

## Problem

The `/saved` page is currently a ComingSoon placeholder. Customers need a way to view and manage their saved studios, artists, and portfolio pieces. The `Customer` type already tracks `savedStudioIds`, `savedArtistIds`, and `savedDesignIds` — this page surfaces that data.

## Decisions

| Question | Decision |
|----------|----------|
| Page structure | Tabbed navigation (All / Studios / Artists / Portfolio) |
| Studio & Artist cards | Enhanced saved cards — 4:3 image, info footer, heart unsave, save date, CTA |
| Portfolio tab layout | Masonry inspiration board — mixed aspect ratios, gradient overlay with attribution |
| All tab layout | Mixed — enhanced cards for studios/artists, masonry-style images for portfolio pieces |
| Empty state | Minimal — heart icon, "Nothing saved yet", single CTA to /discover |

---

## Page Structure

### Header
- Eyebrow: "Your Collection" (mono, uppercase, tracked)
- Headline: "Saved"
- Subtitle: "{N} items saved" (total count across all types)
- Follows existing PageHeader pattern

### Tab Bar
- 4 tabs: **All** | **Studios** | **Artists** | **Portfolio**
- Each tab shows count badge (e.g., "Artists 5")
- Active tab: bottom border in ink-red, full opacity text
- Inactive tabs: reduced opacity
- Pattern: matches Lineup page tab bar (mono font, uppercase, tracked)

---

## Tab: Studios

### Card: Enhanced Saved Card
- **Image area** (aspect-ratio 4:3):
  - Studio cover image as background
  - Top-left: existing badges (Verified, Walk-ins, etc.)
  - Top-right: filled red heart button (click to unsave)
- **Info footer** (below image, on card background #161616):
  - Row 1: Studio avatar (16px circle) + studio name (bold) + location + rating
  - Row 2: Specialty tags (small pills, max 3)
  - Row 3 (separator line above): "Saved Xd ago" left, "View →" CTA right
- **Grid**: 3 columns desktop, 2 tablet, 1 mobile. Gap: 6px.

### Card click behavior
- Clicking the card navigates to `/studios/[id]`
- Clicking the heart unsaves (removes from `savedStudioIds`)

---

## Tab: Artists

### Card: Same Enhanced Saved Card
- Identical structure to Studios tab
- **Differences in info footer**:
  - Row 1: Artist avatar + name + location + rating
  - Row 2: Style tags (Fine Line, Traditional, etc.)
  - Row 3: "Saved Xd ago" left, "Book →" CTA right (or "View →" if booking not available)
- Card click → `/artists/[id]`

---

## Tab: Portfolio

### Layout: Masonry Inspiration Board
- 3-column grid desktop, 2-column mobile
- Gap: 3px (tight, like existing portfolio galleries)
- Mixed aspect ratios:
  - Tall pieces (2:3) span 2 grid rows
  - Square pieces (1:1) fill single cells
  - Default to 3:4 if aspect ratio unknown
- First image optionally spans 2x2 (matches existing PortfolioGallery pattern)

### Card: Masonry Image Card
- Full-bleed image, no info footer
- Top-right: filled red heart button (click to unsave)
- Bottom gradient overlay with:
  - Piece name (bold, 10-11px)
  - "by [Artist Name]" (mono, 7px, reduced opacity)
  - Style tags on hover (optional, small pills)
- Card click → navigates to artist's profile (`/artists/[artistId]`)

---

## Tab: All

### Layout: Mixed Grid
- 3-column grid desktop, 2 tablet, 1 mobile
- Gap: 6px
- Studios & artists: Enhanced saved cards (with info footer)
- Portfolio pieces: Masonry-style image cards (variable heights, gradient overlay, no footer)
- Each item gets a color-coded type badge top-left:
  - Studio: warm gold/amber (`rgba(180,140,100,0.35)`)
  - Artist: sage green (`rgba(100,140,100,0.35)`)
  - Piece: muted gold (`rgba(140,120,80,0.35)`)
- Sort order: by save date, newest first
- Portfolio pieces that are taller will push neighboring rows — this is intentional for visual variety

---

## Empty State

Shown when no items are saved (applies to both global empty and per-tab empty):

### Global Empty (no saved items at all)
- Tabs visible with 0 counts on each
- Centered content:
  - Circle container (48px) with heart icon inside, very low opacity
  - "Nothing saved yet" heading (14px, semi-bold)
  - "Tap the heart on any artist, studio, or tattoo piece to save it here." (11px, low opacity)
  - "Explore Artists" CTA button (ink-red background, mono uppercase)

### Per-Tab Empty (e.g., no saved studios but has saved artists)
- Same pattern but with tab-specific messaging:
  - Studios: "No studios saved yet" → "Browse Studios" CTA
  - Artists: "No artists saved yet" → "Discover Artists" CTA
  - Portfolio: "No pieces saved yet" → "Explore Work" CTA

---

## Data Model

### Existing (no changes needed)
```typescript
interface Customer {
  savedStudioIds: string[];
  savedArtistIds: string[];
  savedDesignIds: string[];
}
```

### New: SavedItem metadata
To support "Saved X ago" timestamps, introduce a lightweight saved-item type:

```typescript
interface SavedItemMeta {
  id: string;
  entityId: string;
  entityType: 'studio' | 'artist' | 'design';
  savedAt: string; // ISO date
}
```

For V1 with mock data, we can compute relative timestamps from mock dates. The `Customer` ID arrays remain the source of truth for what's saved — `SavedItemMeta` enriches with when.

### Mock Data
Create `lib/data/saved.ts` with:
- 3 saved studios (reference existing mock studio IDs)
- 5 saved artists (reference existing mock artist IDs)
- 4 saved portfolio pieces (reference existing mock portfolio image data)
- Each with a `savedAt` date for timestamp display

---

## Components

### New Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `SavedTabs` | `components/saved/saved-tabs.tsx` | Tab bar with counts, active state |
| `SavedCard` | `components/saved/saved-card.tsx` | Enhanced card for studios/artists |
| `SavedMasonryGrid` | `components/saved/saved-masonry-grid.tsx` | Masonry layout for portfolio tab |
| `SavedEmptyState` | `components/saved/saved-empty-state.tsx` | Empty state with icon + CTA |
| `SavedAllGrid` | `components/saved/saved-all-grid.tsx` | Mixed grid for All tab |

### Reused Components
- `PageHeader` — page heading with eyebrow/headline/subtitle
- Badge system from `ProfileCard` — for type badges and existing entity badges
- Heart/save button pattern — already exists on cards across the app
- Masonry grid pattern from `PortfolioGallery` / `ImageGallery`

### Barrel Export
`components/saved/index.tsx` exporting all saved components.

---

## Responsive Behavior

| Breakpoint | Columns (Cards) | Columns (Masonry) |
|------------|-----------------|-------------------|
| Mobile (<640px) | 1 | 2 |
| Tablet (640-1023px) | 2 | 2 |
| Desktop (1024px+) | 3 | 3 |

Tab bar: horizontally scrollable on mobile if tabs overflow.

---

## Dark/Light Mode

All components support both modes via the existing variant system:
- Light: parchment background, black text, ink-red accents
- Dark: ink-black background, cream text, ink-red accents
- Cards: subtle border opacity shifts between modes
- Uses existing CSS custom properties from globals.css

---

## Interactions

| Action | Behavior |
|--------|----------|
| Click tab | Switch view, smooth scroll to top |
| Click card (studio/artist) | Navigate to detail page |
| Click card (portfolio piece) | Navigate to artist's profile |
| Click heart | Remove from saved, card animates out (fade + scale down) |
| Hover card (enhanced) | Subtle border brighten, shadow lift |
| Hover card (masonry) | Image scale 1.03x, gradient overlay appears/darkens |

---

## Verification

1. Navigate to `/saved` — should show the full tabbed interface with mock data
2. Switch between all 4 tabs — each shows correct card style and content
3. All tab shows mixed layout (enhanced cards + masonry pieces)
4. Portfolio tab shows masonry grid with mixed aspect ratios
5. Empty states render correctly when a tab has no items
6. Heart button removes items (client-side state)
7. Cards link to correct detail pages
8. Responsive: check 1/2/3 column layouts at each breakpoint
9. Dark/light mode renders correctly
10. Component library entry added at `/component-library`
