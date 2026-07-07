# Builder Overhaul — Manual Browser Matrix

Run with `npm run dev` (user-invoked). Test studio states: **EMPTY** (fresh signup,
no data beyond name), **PARTIAL** (bio + phone only), **FULL** (photos, hours, socials,
booking link, roster artist with portfolio), plus **Sample Data ON**.

## Per mode: inline · split · mobile (≤767px)

- [ ] Sample OFF: zero demo names (Jake/Sarah/Marcus), zero fake reviews, no "4.9", no fake calendar
- [ ] Sample ON: full demo everywhere, calendar demo visible, gold toggle state
- [ ] EMPTY: every section shows its designed empty state + prompt chip
- [ ] Chip click opens Content panel at the right group (inline overlay / split dock / mobile full-width drawer)
- [ ] Field blur → preview updates instantly + "Saved" tick; reload persists (Supabase row updated)
- [ ] Cover + gallery upload: compressed file lands in storage under `{studioId}/`, renders in hero/gallery
- [ ] Photo reorder (arrows) + delete work; deleted photo gone after reload
- [ ] Booking link connect → hero/nav/details CTAs become real links (new tab); remove → contact-to-book card
- [ ] Setup chip counts match reality; item click scrolls + opens group; all required done → "Ready to publish"
- [ ] Section popover: Style tab = existing controls; Content tab hands off to the panel
- [ ] Preview button: full-screen chrome-free site; Escape/Exit returns
- [ ] Keyboard: panel focus-trap, Esc closes, focus returns to invoker; chips reachable by Tab

## Templates (cycle all 7, EMPTY and FULL)

- [ ] Masthead / grid-overlay / zine heroes render; film-strip / flash-sheet galleries render
- [ ] CSS signatures visible (letterbox + Ken Burns, arch + drop cap, hairline mats, tile rotation, numbered plates)
- [ ] Empty states inherit template styling; OS reduced-motion kills Ken Burns/rotations
- [ ] Old draft with `immersive-dark`/`clean-minimal` in localStorage loads as the mapped survivor

## Public parity (`/studios/[id]`)

- [ ] FULL studio: page pixel-matches builder preview (roster thumbs, reviews, rating, cover)
- [ ] EMPTY studio: same designed empty states, NO prompt chips anywhere in the DOM
- [ ] No `theme_config` studio: default template + real empty states
- [ ] Reviews: real reviews render; zero reviews → "No reviews yet" state

## Automated gate (already run 2026-07-07)

- `npx tsx scripts/check-builder.ts` — 17/17 passed
- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 introduced findings (repo errors 20 → 18: two pre-existing errors fixed, none added)
- Migration 011 applied + confirmed (`supabase migration list`: local 011 = remote 011)
- Supabase advisors: **not run** — the MCP token lacks permission (read + write blocked); run from the dashboard or a full-scope token if desired
