# The Line Up — Magazine Issue Newsletter Page

## Context

The "Line Up" nav item currently links to `/discover/search`. The landing page already has a "THE LINEUP" zine editorial section with handpicked artist/studio spotlights. This feature builds that concept into a full dedicated page — a curated, newsletter-style feed with spotlights, news, events, and editorial picks. It replaces the nav link target and becomes the platform's primary content discovery and engagement surface.

**Approach chosen:** Hybrid "Magazine Issue" model (Approach D). The default tab is a curated mixed feed ("This Week") that leverages variable reward theory for engagement, with breakout tabs for Spotlights, Events, and Archive. Fixed template structure every week for user muscle memory.

---

## Route Structure

```
/lineup                        → Main page (4 tabs, default: "This Week")
/lineup/spotlights/[slug]      → Individual spotlight article pages
```

**Navigation update:** Change nav link from `{ href: "/discover/search", label: "Line Up" }` to `{ href: "/lineup", label: "Line Up" }` in `components/layout/navigation.tsx`.

---

## Page Layout

### Hero

Reuses the existing Inked Market editorial aesthetic from the landing page's "THE LINEUP" section:

- Eyebrow: `Issue No. XX · Month YYYY` (Permanent Marker font, ink-red, slight rotation)
- Title: `THE LINE UP` (Bebas Neue, large tracking)
- Divider: horizontal lines flanking `handpicked · no algorithms · just taste`
- Subtitle: `Your weekly tattoo briefing. Spotlights, news, events, and the artists we can't stop watching.`
- Background: dark with subtle red radial glow (`radial-gradient(ellipse at 50% 0%, rgba(255,51,51,0.08), transparent)`)

### Tab Bar

4 tabs, client-side switching via `useState` (no URL changes per tab):

| Tab | Label | Content |
|-----|-------|---------|
| 1 | **This Week** | Current issue mixed feed (default active) |
| 2 | **Spotlights** | Grid of all spotlight features across issues |
| 3 | **Events** | Upcoming/recent blasts and flash events |
| 4 | **Archive** | Past issues as a browsable grid |

Tab styling follows existing `SearchTabs` pattern: monospace uppercase, ink-red active indicator with bottom border, horizontal scroll on mobile.

Event count badge on Events tab when there are upcoming events.

---

## Tab 1: This Week (Fixed Template)

Every issue renders in this exact section order:

### Section 1 — Cover Story
- **Component:** `CoverStory` (new)
- **Layout:** Grid `1.4fr 1fr` — image panel left, text panel right (reverses on mobile to stack)
- **Content:** One artist or studio deep-dive
- **Elements:** "Cover Story" badge, issue tag (Permanent Marker), Bebas Neue headline, subtitle paragraph, specialty tags, "Read Feature →" CTA linking to spotlight article
- **Visual:** Full-bleed image with hover scale, text side with subtle background tint

### Section 2 — Ink & Culture
- **Divider:** `SectionLabel` with "Ink & Culture"
- **Component:** `NewsCard` (new) × 1-2
- **Content:** Trending articles, industry stories, cultural pieces
- **Elements:** Category label (ink-rust), headline, excerpt (2 lines), byline with read time and date

### Section 3 — On Our Radar
- **Divider:** `SectionLabel` with "On Our Radar"
- **Component:** Existing `FlashCard` / `ProfileCard` in 2-up grid
- **Content:** 2-4 quick artist/studio highlights
- **Layout:** `grid-cols-1 sm:grid-cols-2 gap-[3px]`

### Section 4 — Don't Miss
- **Divider:** `SectionLabel` with "Don't Miss"
- **Component:** `BlastCard` (new) × 1-2
- **Content:** Upcoming flash events, sales, guest spots
- **Elements:** Pulsing dot + "Flash Event" label, date badge, title, details, "Save Event →" CTA button (ink-red)
- **Visual:** Subtle red gradient border/background to distinguish from other cards

### Section 5 — Studio of the Week
- **Divider:** `SectionLabel` with "Studio of the Week"
- **Component:** Spotlight card (large, same pattern as cover story but simpler)
- **Content:** One featured studio
- **Elements:** 16:9 image with gradient overlay, badges, studio name (Bebas Neue), location + artist count, specialty tags

### Section 6 — Editor's Picks
- **Divider:** `SectionLabel` with "Editor's Picks · Artists to Watch"
- **Component:** `PickRow` (new) × 3-5
- **Content:** Ranked list of artists to watch
- **Elements:** Large number (Bebas Neue, faded), avatar thumbnail, name, location + styles, "View →" action
- **Layout:** Vertical list with subtle bottom borders

### Section 7 — From the Culture
- **Divider:** `SectionLabel` with "From the Culture"
- **Component:** `NewsCard` × 1
- **Content:** Industry article, opinion piece, or cultural story
- **Purpose:** Bookends the feed with editorial content to close the "issue"

---

## Tab 2: Spotlights

Grid of all spotlight features (artists + studios) across all issues.

- **Layout:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]`
- **Cards:** Each spotlight rendered as a card with image, name, type badge (artist/studio), issue number, excerpt
- **Click:** Links to `/lineup/spotlights/[slug]`
- **Order:** Most recent first
- **Empty state:** "No spotlights yet — check back next week." with link back to This Week tab

---

## Tab 3: Events

List of upcoming and recent events/blasts from shops and artists.

- **Layout:** Vertical stack of `BlastCard` components
- **Sorting:** Upcoming events first (sorted by date ascending), then past events
- **Past events:** Greyed out / reduced opacity with "Past" badge
- **Empty state:** "No upcoming events — follow artists and studios to get notified." 

---

## Tab 4: Archive

Past issues displayed as a browsable grid.

- **Layout:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px]`
- **Component:** `IssueCard` (new) — shows issue number, date, cover story title/image as a preview
- **Click:** Navigates to... the same page but renders that issue's content in the "This Week" template (swap the active issue in state)
- **Empty state:** "This is the first issue! Archive grows weekly."

---

## Spotlight Article Pages

**Route:** `/lineup/spotlights/[slug]`

Full editorial page for a featured artist or studio. Structured as:

1. **Header:** `PageHero` with spotlight image background, eyebrow ("Artist Spotlight" or "Studio Spotlight"), headline (artist/studio name), subtitle (tagline/quote)
2. **Feature text:** 2-3 `ContentSection` blocks with the editorial story — background, style evolution, what makes them unique
3. **Portfolio grid:** 2x3 or 3x3 grid of work images (placeholder images for now)
4. **Pull quote:** Highlighted quote from the artist/studio (styled blockquote)
5. **Tags & links:** Specialty tags, location, "View Full Profile →" CTA linking to `/artists/[id]` or `/shops/[id]`
6. **Related:** "More Spotlights" section at bottom with 2-3 cards linking to other spotlight articles

---

## Data Model

### Types (`lib/types/lineup.ts`)

```typescript
interface LineupIssue {
  id: string;                       // "issue-007"
  number: number;                   // 7
  date: string;                     // "2026-04-05"
  coverStory: LineupSpotlight;
  news: LineupArticle[];            // 2-3
  onOurRadar: LineupProfile[];      // 2-4
  events: LineupEvent[];            // 1-3
  studioOfTheWeek: LineupSpotlight;
  editorsPicks: LineupProfile[];    // 3-5
  cultureArticle: LineupArticle;    // closing article
}

interface LineupSpotlight {
  slug: string;                     // URL slug for article page
  type: "artist" | "studio";
  name: string;
  tagline: string;                  // short subtitle/quote
  image: string;                    // hero image
  location: string;
  specialties: string[];
  badges: Badge[];                  // reuse existing Badge type
  excerpt: string;                  // preview text for cards
  content: SpotlightContent;       // full article content
}

interface SpotlightContent {
  sections: {
    title: string;
    body: string;                   // rich text / markdown
  }[];
  pullQuote?: string;
  portfolioImages: string[];        // image URLs
  profileLink: string;              // link to /artists/[id] or /shops/[id]
}

interface LineupArticle {
  slug: string;
  category: string;                 // "Trending", "Industry", "Culture"
  headline: string;
  excerpt: string;
  readTime: string;                 // "5 min read"
  date: string;
  // No dedicated article pages in v1 — these are display-only cards
}

interface LineupEvent {
  id: string;
  type: "flash" | "guest-spot" | "sale" | "opening";
  title: string;
  details: string;
  date: string;                     // event date
  location: string;
  shopId?: string;
  artistId?: string;
  ctaLabel: string;                 // "Save Event", "RSVP", etc.
}

interface LineupProfile {
  id: string;
  type: "artist" | "studio";
  name: string;
  image: string;
  location: string;
  specialties: string[];
  badges: Badge[];
  // Links to existing /artists/[id] or /shops/[id]
}
```

### Mock Data (`lib/data/lineup.ts`)

- 2-3 full `LineupIssue` objects (current week + 1-2 past issues for archive)
- 4-6 `LineupSpotlight` entries with full article content
- Uses consistent artist/studio names from existing mock data where possible

---

## New Components

| Component | File | Purpose |
|-----------|------|---------|
| `LineupTabs` | `components/lineup/lineup-tabs.tsx` | Tab bar for the 4 views, manages active tab state |
| `CoverStory` | `components/lineup/cover-story.tsx` | Hero feature banner — image + text split panel |
| `NewsCard` | `components/lineup/news-card.tsx` | Article preview with category, headline, excerpt, byline |
| `BlastCard` | `components/lineup/blast-card.tsx` | Event card with pulsing indicator, date, CTA button |
| `PickRow` | `components/lineup/pick-row.tsx` | Compact ranked artist row with number, avatar, info |
| `IssueCard` | `components/lineup/issue-card.tsx` | Archive grid item showing issue cover preview |
| `SpotlightArticle` | `components/lineup/spotlight-article.tsx` | Full article layout for spotlight pages |

Barrel export: `components/lineup/index.tsx`

### Reused Components

- `SectionLabel` — section dividers between template slots
- `FlashCard` / `ProfileCard` — "On Our Radar" grid cards
- `PageHero` — spotlight article page headers
- `ContentSection` — spotlight article body sections
- `Eyebrow` — issue number/category badges
- `Headline` / `Subtitle` — typography primitives

---

## Visual Design

Consistent with the existing Inked Market dark editorial aesthetic:

- **Background:** `ink-black` with film grain overlay
- **Text:** `ink-cream` primary, reduced opacity for secondary
- **Accents:** `ink-red` (active tabs, badges, CTAs), `ink-rust` (categories, section labels), `ink-sage` (verified badges)
- **Typography:** Bebas Neue for headlines/names, Permanent Marker for editorial accents (issue tags), monospace uppercase for labels/metadata
- **Cards:** `rounded-2xl`, `border border-ink-cream/[0.06]`, hover states with border brightening
- **Blast cards:** Subtle red gradient background + border to visually distinguish time-sensitive content
- **Section dividers:** Existing `SectionLabel` pattern — centered text with horizontal lines

---

## File Structure

```
app/
  lineup/
    page.tsx                    # Main Line Up page with tabs
    layout.tsx                  # Optional layout wrapper
    spotlights/
      [slug]/
        page.tsx                # Spotlight article page
components/
  lineup/
    index.tsx                   # Barrel export
    lineup-tabs.tsx
    cover-story.tsx
    news-card.tsx
    blast-card.tsx
    pick-row.tsx
    issue-card.tsx
    spotlight-article.tsx
lib/
  types/
    lineup.ts                   # LineupIssue, LineupSpotlight, etc.
  data/
    lineup.ts                   # Mock issues and spotlights
```

---

## Verification Plan

1. **Dev server:** `npm run dev` → navigate to `/lineup`
2. **Tab switching:** Click all 4 tabs, verify content renders correctly and scroll position is maintained
3. **Cover story:** Verify image + text split layout, responsive stacking on mobile
4. **Section order:** Confirm fixed template renders sections in correct order
5. **Spotlight click-through:** Click a spotlight card → verify `/lineup/spotlights/[slug]` renders full article
6. **Events tab:** Verify blast cards render with dates, CTAs
7. **Archive tab:** Verify past issues appear as grid, clicking opens that issue's content
8. **Navigation:** Verify "Line Up" nav item links to `/lineup`
9. **Responsive:** Check mobile (375px), tablet (768px), desktop (1280px)
10. **Dark mode:** Verify all components respect dark theme tokens
11. **Build:** `npm run build` passes with no errors
