# Builder Live-Data Overhaul — Design Spec

**Date:** 2026-07-07
**Status:** Approved pending final review
**Quality bar:** Production-ready; intended as the industry standard for studio site builders.

## 1. Problem

The studio website builder shows filler data in "live" mode, has no empty states, no way to edit studio data without leaving the builder, and templates that feel samey. Studios are confused by dummy content and dead features.

### Filler-data audit (everything here must be eliminated from live mode)

| # | Leak | Location |
|---|---|---|
| 1 | Demo artists (Jake/Sarah/Marcus), 8 fake reviews, "4.9" rating always injected regardless of the mock toggle | `components/studio-site/demo-site-data.ts` (`buildBuilderSiteData`) |
| 2 | Fake booking widget: hardcoded artists, April-2026 calendar, fake slots — renders on public sites | `components/builder/preview/details-section.tsx` (`BookingWidget`) |
| 3 | Fake trust stats ("127+ Happy Clients", "80+ reviews") + randomuser.me avatars | `components/builder/preview/footer-cta-section.tsx` (`Booking` variant) |
| 4 | Dead read-only contact form | `footer-cta-section.tsx` (`ContactForm` variant) |
| 5 | "Private Rooms" / "Free Parking" hardcoded as fact | `components/builder/preview/about-section.tsx` (`FullWidthAbout`) |
| 6 | Placeholder-only hero/gallery with no upload path; footer social glyphs ignore real socials | hero, gallery, footers |

## 2. Decisions (user-confirmed)

1. **Reviews empty state:** show the widget with a real-world empty state — exactly what the live site shows.
2. **Public empty sections:** full parity — the live site renders the same designed empty states the builder shows. Empty states are public-facing product surfaces and must read as intentional, never broken.
3. **Uploads:** in scope, free-tier-safe (Supabase Storage is on the free tier: 1 GB storage / 2 GB egress; client-side compression keeps usage well inside it; no paid transforms).
4. **Templates:** consolidate 9 → 7 and give each 1–2 structural signatures.
5. **Editor focus:** control organization + guidance/progress (naming/pixel-polish were explicitly not the priority; "cleaner UI" is achieved through organization).
6. **Approach:** Content rail + truth model (one side panel for content; style stays in existing surfaces).

## 3. Truth model

**Rule: the builder renders exactly what the live site renders.** The only exception is the Sample Data toggle.

```
Sample ON  → MOCK_STUDIO_DATA + demo roster/reviews/photos  (clearly labeled sample)
Sample OFF → real StudioData + real roster + real reviews + real photos
             ↳ anything genuinely empty renders its designed empty state
```

- Rename the "Mock Data" button to **"Sample Data"**, tooltip: *"Preview with example content — never shown on your live site."*
- `buildBuilderSiteData(studio, useMockData, live)` injects `DEMO_*` content **only when `useMockData === true`**. Demo data is unreachable in live mode by construction.
- The fake booking calendar becomes Sample-mode-only demo content.

### Live data flow (builder)

- `StudioData` gains `id?: string` and `images?: string[]` (DB columns `studios.id`, `studios.images` already exist; `coverImage` already present). Mappers in `lib/supabase/types.ts` updated both directions (`images` writable; `id` read-only).
- New `useStudioLiveContent(studioId)` hook (browser Supabase client) fetches:
  - **Roster:** `getArtistsForStudio` + one batched `portfolio_images` query (`artist_id IN (…) ORDER BY sort_order`), grouped client-side (~12 thumbs per artist) → `StudioSiteArtist[]` with real photos/photoCount/profileHref.
  - **Reviews:** `getReviewsForTarget(supabase, "studio", id)` → `StudioSiteReview[]`; `ratingAverage`/`reviewCount` computed from the fetched rows (no schema change).
- No studio id (logged-out / localStorage dev) → fetches skip cleanly; sections show empty states.
- `StudioSiteData` gains `coverImage?: string` (hero background). Public mapper reads `studio.coverImage`; builder maps `StudioData.coverImage`.

### Public page parity

`lib/data/studio-page.ts` (`getStudioForPage`) gets the same roster portfolio-thumbnail enrichment and passes `coverImage`, so builder preview and live site stay pixel-identical. Public `ratingAverage` uses trigger-maintained `studio.rating`.

## 4. Empty-state matrix

Live mode; builder and public render identically. Empty states inherit the active template's signature styling (fonts, accent, borders, texture).

| Section | Has data | Empty state (public-facing, designed) | Builder prompt chip |
|---|---|---|---|
| Nav | "Book Now" → booking URL | no booking URL → CTA scrolls to contact section (never dead) | — |
| Hero | real cover photo (bg-image) | current placeholder texture (reads intentional) | + Add cover photo |
| Gallery | real photo tiles | grid silhouette of muted tiles + on-brand "Portfolio coming soon" | + Add photos |
| Our Story | bio + specialties + services | **reflows to what exists** (specialties/services from signup); all empty → heading + muted "Story coming soon" | + Tell your story |
| Artists | real strips; artist without portfolio → muted tiles inside their strip | "Artist lineup coming soon" card | + Add artists (panel group explains roster, links to dashboard) |
| Reviews | real reviews + computed average | widget stays: star outline + "No reviews yet — verified client reviews appear here"; no fake-it CTA | — (earned data) |
| Hours | real hours grid | "By appointment — contact us" + real phone/email | + Set hours |
| Booking card | real "Book" CTA → studio's booking URL (+ platform label) | "Contact to book" card from real phone/email/Instagram | + Add booking link |
| Footer CTA | real stats only: rating (if reviews > 0), artist count (if roster > 0); fake stats + randomuser avatars **deleted**; dead form replaced by real tap-to-call/email "Get in touch" card | zero stats → falls back to minimal centered CTA | — |
| Footer | real social icons/links only when set; link groups filtered to real destinations | icon row omitted | + Add social links |
| Policies | existing cards | existing empty state (already built) | feeds checklist |

**Prompt chips** are the single builder-only layer: small accent-bordered chips inside empty areas. Wired via a new optional `onEditContent?: (group: ContentGroup) => void` on `StudioSiteContext` — the public page passes nothing, so chips cannot leak to live sites by construction. Chip clicks `stopPropagation()` (chip → Content panel; section click → Style popover).

`ContentGroup = "story" | "contact-hours" | "photos" | "socials" | "booking" | "artists"`.

### Section-specific fixes folded in

- `FullWidthAbout`: hardcoded "Private Rooms" / "Free Parking" removed; render real services only.
- `DetailsSection`: reviews widget now always renders (data or empty state) → the previous 2-items-in-3-columns layout hole disappears.
- Booking link source: reuse the existing integrations model — a booking-category platform record (`integrations[platform].linkUrl`). Helper `getBookingLink(integrations)` returns the first connected booking platform's URL. No new fields.

## 5. Content panel

`BuilderContentPanel` — one component, three containers:

| Mode | Container |
|---|---|
| Inline (desktop) | `SlideOverPanel` overlay (right) |
| Split | docked view inside the 380px editor panel |
| Mobile | `BottomSheet` |

### Groups

| Group | Fields | Logic source |
|---|---|---|
| Story | bio, specialties, services | `use-studio-form` |
| Contact & Hours | phone, email, address, city/state/zip, weekly hours grid | `use-studio-form`, `use-business-hours` |
| Photos | cover image + gallery (multi-upload, drag-reorder, delete) | new upload pipeline |
| Socials | instagram, tiktok, facebook, website | `use-studio-form` |
| Booking | platform select (booking-category registry) + URL | `use-studio-integrations` |
| Artists | explainer + link to dashboard roster management | — (relational data) |

### Behavior

- **Autosave on commit** (blur / toggle / upload complete) via existing `useStudio().update()` → optimistic local state means the preview updates the instant a field commits (live WYSIWYG feedback). Per-group "Saved ✓" indicator; failed saves show field-level error + retry, input never silently dropped.
- **Deep-linking:** chips and checklist items open the panel pre-scrolled + highlighted to the target group.
- **DRY:** hooks/logic always shared with dashboard; `ui/` primitives always shared; field-group markup extracted to `components/studio-content/` where the surfaces align, per-surface only where density genuinely differs.

## 6. Upload pipeline (production spec)

- **Decode & orient:** `createImageBitmap(file, { imageOrientation: "from-image" })`; undecodable format → clear "export as JPG/PNG" message.
- **Compress client-side:** canvas re-encode → WebP q0.8 (JPEG fallback for older Safari), max edge 1600px gallery / 2400px cover. Re-encoding strips EXIF/GPS by construction (privacy).
- **Limits:** 10 MB source cap; 30-photo gallery soft cap; low-res warning under 800px.
- **Storage:** `studio-images/{studioId}/{uuid}.webp`, per-tile progress + retry.
- **Delete order:** DB array update first, storage removal best-effort second (orphan object is harmless; broken image on a live site is not).
- **Migration 011 (security fix):** current policies let any authenticated user INSERT anywhere in `studio-images` and nobody DELETE. Replace with owner-scoped INSERT/UPDATE/DELETE: path's first folder must equal a studio id whose `claimed_by = auth.uid()` (via `storage.foldername(name)`). Public read unchanged.

## 7. Guidance layer

- `useSetupProgress(studio, liveContent)` derives checklist items **from the same data the sections render** — checklist and empty states cannot disagree.
- Items: Story · Photos · Hours & Contact · Socials · Booking link · Policies · Artists (marked *optional*).
- Predicates: bio non-empty; images or coverImage present; phone/email + any hours (seeded defaults count — no false nagging); any social set; booking link set; any policy enabled; roster > 0.
- **Top bar chip:** progress ring + "Setup · 4/7" → dropdown checklist; item click scrolls preview to the section, pulses its outline, opens the panel at that group. All required done → sage "Ready to publish". Mobile: mini-bar chip → bottom-sheet checklist. Derived state only; nothing persisted.

## 8. Editor reorganization (Content/Style rule)

**Rule: Content lives in the Content panel; Style lives where it always did.**

- **Section popover:** two tabs — **Style** (existing controls) · **Content** (summary of that section's current data + "Edit" → opens panel at that group). Lean handoff, not an embedded form; gives filled sections a discoverable edit path (chips cover the empty case).
- **Split mode:** editor panel gains a segmented **Content | Style** switch; Content docks the panel groups inline; Style keeps Flash/Custom controls.
- **Inline toolbar:** gains a Content button alongside existing tabs.
- **Top bar:** "Sample Data" rename + tooltip; setup progress chip; **Preview button wired** (full-screen chrome-free render of current config — a dead button violates "never confused"). Publish button untouched (paywall workstream).

## 9. Accessibility (non-negotiable)

Panel = `role="dialog"` + `aria-modal`, focus trap, focus-return to invoking element; chips are real `<button>`s with labels; full keyboard operability; visible focus rings in dark chrome; `prefers-reduced-motion` respected for panel/chip/pulse/Ken Burns animations.

## 10. Templates

### Consolidation (9 → 7)

- `immersive-dark` + `dark-cinematic` → **Dark Cinematic** (keep slug `dark-cinematic`)
- `clean-minimal` + `studio-minimal` → **Studio Minimal** (keep slug `studio-minimal`)
- Keep: `bold-editorial`, `warm-artisan`, `gutter-punk`, `fine-line`, `traditional-flash`
- `LEGACY_TEMPLATE_MAP = { "immersive-dark": "dark-cinematic", "clean-minimal": "studio-minimal" }` applied at every config-read boundary (DB `theme_config`, localStorage draft, per-template draft cache, public page). `TemplateSlug` narrows to 7; remap runs before type assertion. Pre-launch, lossless.

### Structural signatures

New variant values in real code + CSS signatures keyed off a new `data-template` attribute on the site root. All variants remain user-selectable (Custom tier); defaults create identity. Empty states inherit signature styling.

| Template | Structural signature | CSS signature |
|---|---|---|
| Bold Editorial | `heroLayout: "masthead"` — oversized masthead name, rule lines, issue-style meta row | numbered gallery captions |
| Studio Minimal | `heroLayout: "grid-overlay"` — hero is a photo grid with name overlay | hairline dividers, radical whitespace |
| Dark Cinematic | `galleryLayout: "film-strip"` — sprocket-edged carousel | letterboxed hero + slow Ken Burns on cover (motion-safe) |
| Warm Artisan | — (config-tuned) | arched hero image mask + serif drop cap in Story |
| Gutter Punk | `heroLayout: "zine"` — rotated collage tiles, tape corners, stamped name | sticker/tape offsets on gallery tiles |
| Fine Line | — (floating nav + serif already distinct) | thin-frame photo mats, wide gutters |
| Traditional Flash | `galleryLayout: "flash-sheet"` — bordered flash-sheet tiles, ornament corners | banner ornament under hero name |

New union values: `heroLayout` +`"masthead" | "grid-overlay" | "zine"`; `galleryLayout` +`"film-strip" | "flash-sheet"`. The `frontend-design` skill is used when implementing these new UI pieces (per CLAUDE.md).

## 11. Error handling & edge cases

- **Live fetch fails** → sections fall back to empty states + one non-blocking "Couldn't load your latest content — retry" toast; preview never crashes.
- **No studio id** → fetches skip; Content panel still edits the local repo.
- **Legacy template slug** anywhere → silent remap (dev-only console note).
- **Upload failures** → per-tile error + retry; pre-flight type/size validation.
- **Concurrent dashboard↔builder edits** → single `StudioProvider` optimistic source; merge-patch last-write-wins (existing semantic).
- **Sample toggle** is a pure view swap; no writes.
- **Public page with no `theme_config`** → default template + same real empty states; demo data unreachable.
- **SSR/hydration:** live-content hook is builder-only (client); public page stays server-fetched — no hydration mismatch.

## 12. Verification

- **`scripts/check-builder.ts`** (assert-based, run via existing `tsx`; no test framework added): no-demo-leak when Sample off; setup-progress predicates across empty/partial/full fixtures; legacy slug remap; per-section has-data predicates.
- `tsc --noEmit` + `npm run lint` gates (no `npm run build`/`dev` without user request).
- **Manual browser matrix** (checklist delivered at end of implementation): {split, inline, mobile} × {empty studio, partial, full, Sample ON} + public page for the same states (parity check).
- Migration 011 verified with Supabase advisors after apply — project `cktvpfenygxhfaodihbz` only.

## 13. Out of scope

Publish/paywall flow · Google reviews import · in-builder artist invitations · working inquiry-form backend · Instagram import. (Preview-button wiring is the one deliberate inclusion.)

## 14. Affected files (implementation inventory)

**New:** `lib/hooks/use-studio-live-content.ts` · `lib/hooks/use-setup-progress.ts` · `lib/utils/image-upload.ts` · `lib/utils/legacy-template.ts` · `components/studio-site/empty-states.tsx` (empty-state primitives + prompt chip) · `components/builder/content-panel/` (panel + groups) · `components/studio-content/` (shared field groups) · `supabase/migrations/011_storage_owner_scoped.sql` · `scripts/check-builder.ts`

**Modified:** `lib/repositories/types.ts` (+id, images) · `lib/supabase/types.ts` (mappers) · `lib/types/builder.ts` (new variants, TemplateSlug narrowed) · `lib/data/templates.ts` (consolidation + signature defaults) · `components/studio-site/studio-site-data.ts` (+coverImage, has-data helpers) · `components/studio-site/demo-site-data.ts` (gated demo injection) · `components/studio-site/studio-site-context.tsx` (+onEditContent) · `components/studio-site/studio-site-renderer.tsx` (data-template attr) · all `components/builder/preview/*` sections (empty states, real data, signatures, filler removal) · `components/builder/builder-provider.tsx` (live content, panel state, progress) · `builder-top-bar.tsx` (Sample rename, chip, Preview) · `section-popover.tsx` (Style/Content tabs) · `editor-panel.tsx` (segmented switch) · `bottom-toolbar.tsx` (+Content) · `components/builder/mobile/*` (bottom-sheet panel, chip) · `lib/data/studio-page.ts` (thumb enrichment, remap) · `app/globals.css` (data-template signatures, chip/pulse animations)
