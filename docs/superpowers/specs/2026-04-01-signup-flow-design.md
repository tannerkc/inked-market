# Signup Flow Design

Multi-step wizard for onboarding all three user types: Customers, Artists, and Studio Owners. Deferred signup model — customers browse freely, signup only triggered when they want to take action.

---

## Route Structure

```
/signup                      → Step 1: Type Selector (all users)
/signup/customer             → Step 2: Auth → Done → /discover
/signup/artist               → Step 2: Auth + Artist Name
/signup/artist/profile       → Step 3: Styles + IG Import + Photo Upload
/signup/artist/plan          → Step 4: Choose Free or Pro → Done → Dashboard
/signup/studio               → Step 2: Auth + Owner Name
/signup/studio/setup         → Step 3: Studio Name + Location + Specialties
/signup/studio/plan          → Step 4: Choose Basic/Pro/Studio → Done → Dashboard
```

**Shared layout** (`/signup/layout.tsx`): Parchment gradient background, film grain overlay, scattered tattoo SVG decorations (hidden mobile), drawing canvas (desktop only). Matches existing `/login` page treatment.

**Step counts by type:**
- Customer: 2 steps (type → auth)
- Artist: 4 steps (type → auth → profile → pricing)
- Studio: 4 steps (type → auth → studio info → pricing)

---

## Step 1: Type Selector (`/signup/page.tsx`)

**All users start here.** One question: "How will you use Inked?"

### Visual Design
- **Eyebrow:** "Get Inked" — Permanent Marker font, 12px, uppercase, tracking-[0.25em], -2deg rotation, ink-red color. Matches PageHero eyebrow pattern.
- **Headline:** "Join The Scene" — mixed-font: Pirata One ("Join") → Permanent Marker/ink-red ("The") → UnifrakturCook ("Scene")
- **Subtitle:** "Choose your path. You can always change this later."
- **Progress bar:** Shows only the first active segment. Total segment count is unknown at this point (depends on type selected). After the user clicks a type card, the next page renders with the correct total (2 for customer, 4 for artist/studio). Active segment: ink-red. Mono label: not shown on Step 1 (no total yet).

### Type Cards
Three cards, vertically stacked:

| Card | Icon | Color | Title | Description | Features | Route |
|------|------|-------|-------|-------------|----------|-------|
| 1 | Search SVG | sage bg | Tattoo Collector | Find artists, save inspo, book sessions | Browse, Save, Book | /signup/customer |
| 2 | Pen SVG | red bg | Tattoo Artist | Showcase your portfolio, get discovered, grow your client base | Portfolio, Discover, Bookings | /signup/artist |
| 3 | House SVG | rust bg | Studio Owner | List your shop, manage artists, attract new clients | Listing, Team, Analytics | /signup/studio |

**Card styling:**
- White background, 16px border-radius, 1px border rgba(10,10,10,0.05)
- Icon box: 48x48, 14px border-radius, tinted background per type color
- Feature pills: mono 8.5px uppercase, subtle border/background
- Hover: border darkens to rgba(10,10,10,0.15). No shadows. No color changes. Consistent across all cards.
- Arrow chevron: opacity 0.15 → 0.35 on hover

**Footer:** "Already have an account? Sign In" linking to `/login`

---

## Step 2: Auth Screens

Three type-specific variants sharing the same layout structure. Each uses its type's accent color.

### Common Elements
- Auth methods (same order for all types):
  1. "Continue with Instagram" — Button variant="ink" size="lg" with statusDot, full width
  2. "Google" + "Apple" — side-by-side, variant="ink-outline" size="md"
  3. Divider with "or"
  4. Email input (placeholder varies by type)
  5. Password input
- Magic link option: "Send magic link instead →"
- Back link: "← Back"

### Customer Auth (`/signup/customer`)
- Eyebrow: "Almost There" (sage)
- Headline: "Create Your Account" — Pirata One / Rye / sage-colored Permanent Marker
- Subtitle: "Sign up to save artists, get recommendations, and book sessions."
- Progress: "2 / 2" (final step for customers)
- Fields: Email + Password only (no name field)
- CTA: "Create Account" → redirect to /discover (or return URL if deferred gate)
- No name field — customers can add display name from settings later

### Artist Auth (`/signup/artist`)
- Eyebrow: "Artist Account" (red)
- Headline: "Create Your Account" — Pirata One / Permanent Marker red / UnifrakturCook
- Subtitle: "Set up your artist profile and start getting discovered."
- Progress: "2 / 4"
- Fields: Email + Password + Artist Name
- CTA: "Continue" → /signup/artist/profile
- Instagram auth note: When artist uses "Continue with Instagram", request media access scope. This enables IG import on Step 3 without re-auth.

### Studio Auth (`/signup/studio`)
- Eyebrow: "Studio Account" (rust)
- Headline: "Create Your Account" — Pirata One / rust-colored Permanent Marker / UnifrakturCook
- Subtitle: "Set up your studio's presence on Inked Market."
- Progress: "2 / 4"
- Fields: Email + Password + Your Name (owner's personal name, not studio name)
- CTA: "Continue" → /signup/studio/setup
- Owner vs studio separation: A person can own multiple studios. The account is the person; the studio is a business entity managed later.

---

## Step 3: Profile Setup

### Artist Profile (`/signup/artist/profile`)

**Purpose:** Capture the two things that matter most for artist discovery — styles and portfolio work.

- Eyebrow: "Almost There" (red)
- Headline: "Show Your Work" — Limelight ("Show") / Permanent Marker red ("Your") / UnifrakturCook ("Work")
- Subtitle: "Pick your styles and add some portfolio work. You can always add more later from your dashboard."
- Progress: "3 / 4"

**Styles section:**
- Label: "Your Styles" (mono uppercase)
- All 14 TattooStyle values as selectable pills: Fine Line, Minimalist, Traditional, Neo-Trad, Japanese, Blackwork, Realism, Watercolor, Geometric, Portrait, Dotwork, Tribal, Sketch, Abstract
- Multi-select, minimum 1 required
- Selected state: ink-red border, rgba(255,51,51,0.05) background, ink-red text
- Maps to `Artist.styles: TattooStyle[]`

**Instagram Import card:**
- Centered card with Instagram gradient icon (48x48, rounded-14)
- Title: "Import from Instagram"
- Description: "Connect your IG to instantly populate your portfolio with your best work. We'll pull your recent posts."
- "Connect Instagram" button (variant="ink" with statusDot)
- "Skip for now →" link below
- If user already authenticated with IG on Step 2, the button changes to "Import X Photos" (no re-auth needed)
- IG import creates `PortfolioImage` entries from recent media (filters for images, skips reels/stories)

**Manual upload fallback:**
- Label: "Or Upload Photos"
- 3-slot grid with dashed borders, "+" icon
- First slot more prominent (higher opacity)
- Minimum 0 photos required (IG import OR manual, or skip both)
- Tap to upload or drag-and-drop

**CTA:** "Complete Setup" → /signup/artist/plan

### Studio Setup (`/signup/studio/setup`)

**Purpose:** Capture minimum viable listing info — name, location, phone, specialties.

- Eyebrow: "Almost There" (rust)
- Headline: "Set Up Your Studio" — Pirata One / Rye / rust Permanent Marker / UnifrakturCook
- Subtitle: "Create your studio's listing or claim an existing one. Takes under 5 minutes."
- Progress: "3 / 4"

**Claim/Create toggle:**
- Two side-by-side cards:
  1. "New Listing" (✨ icon) — "Create from scratch" — active by default
  2. "Claim Existing" (🔍 icon) — "Find your shop" — with "Coming Soon" badge
- Claim option is visible but non-functional (rust-colored "Coming Soon" pill badge)
- When claim becomes active (future): shows search field querying Google Business / scraped data

**Form fields (New Listing path):**
- Studio Name (full width)
- City + State (side-by-side, city flex:2, state flex:1)
- Phone (full width)
- Studio Specialties (multi-select pills, minimum 1)

**Studio specialty pills:**
- Different from artist TattooStyle — includes service types
- Options: Traditional, Realism, Fine Line, Japanese, Blackwork, Color Work, Custom Design, Cover-Ups, Walk-Ins, Piercing
- Maps to `Shop.specialties: string[]` (free-form, not the TattooStyle enum)
- Selected state: ink-rust border, rgba(193,68,14,0.05) background, ink-rust text

**CTA:** "Complete Setup" → /signup/studio/plan

**What's deferred to dashboard:** Full street address, business hours, email (business), gallery photos, bio/description, artist roster invitations, web page design.

---

## Step 4: Pricing Tier Selection

### Artist Pricing (`/signup/artist/plan`)

- Eyebrow: "Last Step" (red)
- Headline: "Choose Your Plan" — Pirata One / Permanent Marker red / UnifrakturCook
- Subtitle: "Start free or go Pro for independent visibility. Upgrade anytime."
- Progress: "4 / 4"

**Billing toggle:** Monthly | Annual with "Save 20%" sage badge. Toggle track turns sage when annual is active.

**Two tiers:**

| Tier | Price (Monthly) | Price (Annual) | Pre-selected? | Badge |
|------|----------------|----------------|---------------|-------|
| Free | $0 (forever) | — | Yes (default) | "No Card Required" sage pill |
| Pro | $14.85/mo | $11.85/mo | No | "Popular" red pill |

**Free tier features:** ✓ Profile & gallery management, ✓ Gallery on studio page, — Independent listing on Discover, — Own artist profile page

**Pro tier features:** ✓ Profile & gallery management, ✓ Gallery on studio page, ✓ Public listing on Discover, ✓ Independent artist profile, ✓ No studio required

**CTA:** "Activate Account" for both tiers.
- Free → Artist dashboard (prompted to link to a studio)
- Pro → Stripe checkout → Artist dashboard (profile live on Discover)

### Studio Pricing (`/signup/studio/plan`)

- Eyebrow: "Last Step" (rust)
- Headline: "Choose Your Plan" — Pirata One / rust Permanent Marker / UnifrakturCook
- Subtitle: "All plans include a marketplace presence. Upgrade for full customization."
- Progress: "4 / 4"

**Billing toggle:** Same as artist (Monthly | Annual, "Save 20%").

**Three tiers:**

| Tier | Price (Monthly) | Price (Annual) | Pre-selected? | Badge |
|------|----------------|----------------|---------------|-------|
| Basic | $19.85/mo | $15.85/mo | Yes (default) | — |
| Pro | $59.85/mo | $47.85/mo | No | "Popular" rust pill |
| Studio | $79.85/mo | $63.85/mo | No | — |

**Basic features:** ✓ Profile-style listing, ✓ Discover marketplace presence, — Custom web page, — Premium templates

**Pro features:** ✓ Profile-style listing, ✓ Discover marketplace presence, ✓ Custom web page, ✓ Customize colors, fonts & content, — Premium templates

**Studio features:** ✓ Everything in Pro, ✓ Rearrange layout sections, ✓ Exclusive premium templates, ✓ Priority search placement

**CTA:** "Activate Studio" → Stripe checkout → Studio dashboard.

No free tier for studios — running a business listing requires commitment. $19.85/mo Basic is the entry point.

---

## Deferred Signup (Customers)

Customers browse freely without an account. Signup is triggered when they attempt a gated action:

| Action | Gate Behavior |
|--------|--------------|
| Save artist/shop | Redirect to /signup with return URL |
| Send message | Redirect to /signup with return URL |
| Book appointment | Redirect to /signup with return URL |
| Write review | Redirect to /signup with return URL |
| Follow artist | Redirect to /signup with return URL |

**Return flow:** After completing signup (Step 2 for customers), redirect to the original page with the gated action auto-completed (e.g., artist is saved, message composer opens).

**"Get Started" button in nav** → /signup (same flow, no return URL).

---

## Shared Layout & Components

### Signup Layout (`/signup/layout.tsx`)
- Parchment gradient: `from-ink-parchment-light via-ink-cream to-ink-parchment-dark`
- FilmGrainOverlay (opacity 0.025)
- Scattered tattoo SVGs: rose, bird, ghost, anchor — opacity 0.04, rotated, hidden on mobile (`hidden md:block`)
- DrawingCanvas (desktop only, like login page)
- Centered content container: `max-w-[420px] mx-auto`

### Progress Bar Component
- Accepts `currentStep` and `totalSteps` props
- Renders `totalSteps` segment bars + mono label "X / Y"
- Active segment: ink-red, done segments: ink-black/25, pending: ink-black/06
- Reusable across all signup routes

### Step Eyebrow Component
- Permanent Marker font, 12px, uppercase, tracking-[0.25em], -2deg rotation
- Accepts `color` prop (red/rust/sage) and `text` string
- Reuses the pattern from PageHero component

### Auth Form Component
- Shared across all three type auth screens
- Props: `onSubmit`, `showNameField`, `nameLabel`, `namePlaceholder`, `emailPlaceholder`
- Renders: social auth buttons, divider, email/password inputs, optional name field, magic link, back link
- Handles form validation (email format, password strength, name required if shown)

### Style Picker Component
- Accepts `styles: string[]`, `selected: string[]`, `onChange`, `accentColor`
- Renders selectable pills with the appropriate accent color
- Reusable for both artist styles (TattooStyle) and studio specialties

### Pricing Tier Card Component
- Accepts tier data, selected state, accent color
- Renders name, price, description, feature list with checks/dashes
- Optional badges ("Popular", "No Card Required")
- Reuse/adapt from existing PricingTierCard in components/pricing/

---

## Data Flow & State Management

**No shared state between steps.** Each step is a standalone page that:
1. Reads type from URL params (the route determines the type)
2. Submits its own form data independently
3. Navigates to the next route on success

**Account creation happens on Step 2** (auth screen). Steps 3-4 are profile updates to the already-created account.

**Form submission strategy:**
- Step 1: Client-side navigation (no form, just route change on card click)
- Step 2: Server Action — creates user account, sets session cookie, returns next route
- Step 3: Server Action — updates user profile with styles/portfolio or studio info
- Step 4: Client-side for free tier (just marks account active), Stripe redirect for paid tiers

**Return URL handling:** Stored in URL search params (`?returnTo=/artists/1`) and passed through each step. After final step, redirect to returnTo or default destination.

---

## Post-Signup: Dashboard Onboarding Checklist

After signup, artists and studios see a profile completeness checklist in their dashboard. This replaces adding more signup steps.

### Artist Dashboard Checklist
- [ ] Add a profile photo
- [ ] Write your bio
- [ ] Add your location (city, state)
- [ ] Upload portfolio work (minimum 3 photos recommended)
- [ ] Connect Instagram (if not done during signup)
- [ ] Add certifications
- [ ] Link to a studio (free tier) / Set availability (pro tier)

### Studio Dashboard Checklist
- [ ] Add gallery photos (minimum 3 recommended)
- [ ] Set business hours
- [ ] Add full street address
- [ ] Write studio bio/description
- [ ] Add business email
- [ ] Invite your artists
- [ ] Customize web page (Pro/Studio tier)

---

## Mobile Considerations

- All steps fit in a single viewport on mobile (no scrolling needed for most steps)
- Artist Step 3 (styles + IG + upload) may scroll slightly — acceptable
- Touch targets: all buttons and pills meet 44x44 minimum
- Progress bar is compact (3px height segments + mono label)
- Form inputs use standard mobile keyboard triggers (email type, tel type)
- Back navigation always available

---

## Verification

To test the complete signup flow:

1. **Route navigation:** Click through all paths — customer (2 steps), artist (4 steps), studio (4 steps)
2. **Progress bar:** Verify correct step counts and active states per type
3. **Form validation:** Email format, password strength, required fields (name, styles, studio name, location)
4. **Auth methods:** Instagram, Google, Apple buttons present and styled correctly
5. **Return URL:** Test deferred signup from an artist profile page — verify return after completion
6. **Responsive:** Test all steps on mobile viewport (375px width)
7. **Theme:** Verify parchment gradient, film grain, tattoo SVGs render correctly
8. **Pricing:** Verify monthly/annual toggle updates prices, tier selection works
9. **Navigation:** Back button works on all steps, Sign In link goes to /login
10. **Accessibility:** Keyboard navigation through type cards, form fields, pills, tier cards
