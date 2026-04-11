# Gallery & Reviews Overflow Design

**Date:** 2026-04-09  
**Status:** Approved  
**Scope:** Live studio page + builder preview

---

## Context

The gallery and reviews sections on a studio page will hold significantly more content than current mock data represents. A real studio could have 4+ connected artists each with 30–60 portfolio photos, and 40+ reviews. We needed a pattern that handles overflow gracefully without navigating users away from the studio page, and that lets studio owners preview the overflow behavior in the builder.

A second discovery during brainstorming: the studio gallery is not a single pool of mixed content — it is an aggregation of each connected artist's individual portfolio. Most professional tattoo studio websites organize work by artist. The gallery section must reflect this.

---

## Gallery Section — Artist Strips

### Pattern

Replace the current single-pool gallery grid (featured/uniform/masonry/carousel) with **per-artist horizontal strips**. Each connected artist gets their own named row.

### Strip anatomy

```
[Avatar] Artist Name                              View profile ↗
         Style · Style · N photos
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌ +N  ┐
│photo │ │photo │ │photo │ │photo │ │photo │ │ more│
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └─────┘
```

- **Photos shown per strip:** 5 by default. Builder config option: 3 / 5 / 8.
- **Overflow pill:** Shows remaining count ("+38 more"). Clicking opens the **Artist Gallery Sheet**.
- **"View profile ↗" link:** Navigates to the artist's individual profile page. This is the only navigation away from the studio page.
- **Strip ordering:** Follows the studio's artist roster order (configurable in dashboard, not in builder).

### Artist Gallery Sheet

A slide-up sheet that stays on the studio page, showing one artist's full gallery.

- **Header:** Artist avatar, name, style tags, photo count, "View full profile →" link
- **Body:** Full gallery grid (4-col on desktop, 2-col on mobile), scrollable
- **Layout:** Square grid by default — consistent, not layout-option-dependent
- **Close:** Tap outside or X button

### Builder preview behavior

- If the studio has connected artists with real photos: show real data in the preview strips.
- If no artists are connected yet: show 2–3 mock placeholder artists with a soft "Connect artists to populate your gallery" notice.
- The "+N more" pill is visible in the builder preview (showing real or estimated count) so owners understand the overflow pattern.
- Clicking "+N more" in the builder preview opens the sheet in a disabled/read-only state.

### Removed builder config options

- `galleryLayout` (featured / uniform / masonry / carousel) — **removed**. Artist strips is the layout. These options applied to a single content pool which no longer exists.
- `galleryWatermarks`, `galleryBeforeAbout`, `showGalleryHeading` — **retained** as-is.
- **New option:** `galleryPhotosPerArtist` — enum: `3 | 5 | 8`, default `5`.

### Empty state

When a studio has no connected artists: full-width empty state in the gallery section with icon, "No artists added yet", and a CTA button that links to the artist roster dashboard.

---

## Reviews Widget — Sheet Drawer

### Pattern

The reviews widget (inside the details section) shows **3 reviews truncated to 2 lines**. A "See all X reviews" trigger button at the bottom opens a **slide-up sheet** with the full review list.

### Widget (always visible)

- Header: "WHAT CLIENTS SAY" label + aggregate rating (e.g., "4.9 ★★★★★ · 47 verified reviews")
- Body: 3 review cards, text truncated at 2 lines
- Footer: "See all 47 reviews ↑" trigger (styled as a subtle bordered row, not a primary button)

### Reviews Sheet

- **Trigger:** "See all X reviews" footer in the widget
- **Content:** Full review list, full review text (no truncation), author + date + star rating per review
- **Scroll:** Sheet body scrolls; header is sticky (studio name, aggregate rating)
- **Close:** Tap outside overlay or X button
- **Future:** Filter by artist, sort by date/rating — not in scope now

### Builder preview behavior

- Widget shows mock reviews (3) with truncation and trigger button visible.
- Clicking the trigger in the builder preview opens the sheet in a read-only/mock state.
- This gives studio owners a full sense of how the pattern works before publishing.

### Layout constraint

The reviews widget lives inside the details section grid (three-col, two-one, or stacked layout variants). The sheet pattern was chosen specifically because inline expansion (Approach B) breaks the three-col grid alignment when the reviews column grows taller than its neighbors.

---

## Shared Sheet Component

Both the Artist Gallery Sheet and the Reviews Sheet share the same underlying sheet component:

```
SheetOverlay (fixed, full-screen, semi-transparent backdrop)
└── Sheet (slide-up panel, max-height 80vh, rounded top corners)
    ├── Handle bar
    ├── SheetHeader (sticky)
    └── SheetBody (scrollable)
```

Build this as a single reusable `<Sheet>` primitive in `components/ui/`. Both usages compose on top of it.

---

## Verification

1. **Live studio page — gallery:** Studio with 3+ connected artists renders an artist strip per artist. Overflow pill shows correct remaining count. Clicking pill opens artist gallery sheet. Sheet scrolls through all photos. "View profile" navigates to artist page. Closing sheet returns to studio page cleanly.

2. **Live studio page — reviews:** Reviews widget shows 3 truncated reviews. "See all" trigger opens sheet. Sheet shows full list. Close returns to studio page without scroll position loss.

3. **Builder preview — gallery:** Preview shows real artist data if connected, mock artists if not. Overflow pill is visible and interactive (sheet opens in read-only state).

4. **Builder preview — reviews:** Mock reviews visible with trigger button. Sheet opens from trigger.

5. **Empty state:** Studio with no connected artists shows gallery empty state with dashboard CTA.

6. **Mobile:** Both sheets are full-width, slide up from bottom, are dismissible by tapping outside. Strips scroll horizontally within their row on narrow viewports.

7. **Details section layout integrity:** Three-col, two-one, and stacked layout variants remain aligned after "See all reviews" is clicked (sheet opens over the page, not inline).
