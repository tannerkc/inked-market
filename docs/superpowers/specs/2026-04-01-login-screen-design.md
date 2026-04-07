# Login Screen Design Spec

## Context

Inked Market needs a login screen that matches the landing page hero's visual language — open, typography-driven, with tattoo art as texture. The screen serves all user types (customers, artists, shop owners) through a unified experience supporting social login (Instagram/Google/Apple), email/password, and magic link authentication.

## Design

### Layout
- Full-page, full-viewport (`min-h-screen`) centered layout — no card or container
- Parchment gradient background matching hero: `from-ink-parchment-light via-ink-cream to-ink-parchment-dark`
- FilmGrainOverlay for analog texture
- DrawingCanvas on desktop (matching hero interaction)
- 4 tattoo SVGs from `/public/tattoos/` — larger, intentional editorial placement at low opacity with `filter: brightness(0)`
  - `rose-illustration-4-svgrepo-com.svg` — top-left, ~130px, rotated -15deg, opacity 0.05
  - `bird-of-paradise-svgrepo-com.svg` — top-right, ~100px, rotated 8deg, opacity 0.04
  - `ghost-svgrepo-com.svg` — bottom-left, ~70px, rotated -12deg, opacity 0.045
  - `sailor-tattoo-svgrepo-com.svg` — bottom-right, ~120px, rotated 10deg, opacity 0.05

### Content (top to bottom)
1. **Badge pill** — "Welcome Back" with StatusDot, matching hero's "Coming Soon" pill pattern
2. **Mixed-font headline** — "Sign In To The Scene"
   - "Sign" → Pirata One, muted (`text-ink-black/40`)
   - "In" → Rye, muted
   - "To" → Limelight, muted
   - "The" → Permanent Marker, red (`text-ink-red`)
   - "Scene" → UnifrakturCook 700, full black
3. **Subtitle** — "Pick up where you left off. Your saved artists and shops are waiting."
4. **Auth form** (max-width 380px):
   - Instagram pill button (primary, ink-black bg, StatusDot)
   - Google + Apple side-by-side outline pills with brand SVG icons
   - "OR" divider (matching hero section label pattern)
   - Email floating-label input
   - Password floating-label input
   - Sign In pill button (ink-black bg, StatusDot)
   - "Send magic link instead →" text link
5. **Footer** — "Don't have an account? Sign Up" anchored to bottom

### Components Needed
- **New:** `components/ui/input.tsx` — floating-label input matching design system (forwardRef, cn(), variants)
- **New:** `app/login/page.tsx` — the login page (Server Component shell, client interactive parts)
- **Reuse:** `Button` (ink variant + ink-outline variant), `StatusDot`, `FilmGrainOverlay`, `Logo`, `SectionLabel` pattern, `Divider`
- **Reuse:** Font imports from `lib/fonts.ts` (Pirata One, Limelight, Rye, Permanent Marker, UnifrakturCook)
- **Reuse:** `DrawingCanvas` from `components/hero/drawing-canvas.tsx`
- **Reuse:** Tattoo decoration pattern from `app/page.tsx` hero section

### Mobile Responsive
- Social buttons stack full-width on mobile
- Google/Apple remain side-by-side (they're compact enough)
- Headline scales down: `text-4xl sm:text-5xl lg:text-6xl`
- Tattoo SVGs hide or reduce on mobile (`hidden sm:block` for some)
- DrawingCanvas desktop-only (already handled internally)
- Form max-width constrains on larger screens

### Dark Mode
- Background swaps to ink-black with cream text
- Inputs swap to dark glass-morphism style
- Tattoo SVGs use `filter: brightness(1) invert(1)` or cream opacity
- Buttons invert appropriately

## Verification
1. `npm run build` passes without errors
2. Navigate to `/login` — page renders with correct layout
3. Mixed fonts load and display correctly
4. Tattoo SVGs visible at low opacity in corners
5. Film grain overlay visible
6. Mobile responsive: check at 375px, 768px, 1024px, 1440px
7. Dark mode: toggle and verify all elements adapt
8. DrawingCanvas appears on desktop hover
9. All buttons and links are keyboard-accessible with visible focus states
10. No raw hex values — all colors use design tokens
