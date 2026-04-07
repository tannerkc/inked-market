# Dashboard with Integrated Onboarding — Design Spec

## Context

The signup flow is complete for all 3 user types (customer, artist, studio). Currently, "Activate Account" redirects to the homepage — a dead end. The next step is building the post-signup destination: **artist and studio dashboards with integrated onboarding.**

The dashboards serve dual purpose: they're the **permanent home** for managing profiles/listings AND the **onboarding experience** for new users. Empty states guide users to fill in their data. A dismissible progress banner provides momentum without blocking.

**Key product decision:** Studios get free access to the template customizer/page builder. The paywall lives at publish time, not signup. The plan selection step in studio signup is hidden (not removed) — it moves to the publish gate later.

**Customers skip onboarding entirely** — they redirect to `/discover` after signup with a welcome toast.

---

## Scope

### In Scope
- Artist dashboard page (`/artist-dashboard`)
- Studio dashboard page (`/shop-dashboard`)
- Shared dashboard components (DRY across both)
- Onboarding banner (dismissible, with progress)
- Empty states for all dashboard sections
- Mock data for populated previews
- Customer redirect to `/discover` (trivial change)
- Hide plan selection step from studio signup flow

### Out of Scope
- Backend/API integration
- Real authentication or session management
- Template customizer/page builder (referenced as CTA, not built)
- Portfolio editor (referenced as CTA, not built)
- Booking/calendar functionality
- Messaging system
- Settings page
- Sidebar navigation (premature — most items would be "coming soon")

---

## Architecture

### Routing
- `/artist-dashboard` — Artist dashboard (replaces current ComingSoon)
- `/shop-dashboard` — Studio dashboard (replaces current ComingSoon)
- Both are client components (interactive forms, state management)

### Layout Strategy
**No sidebar.** Both dashboards use a single-column responsive layout within the existing root layout (Navigation + Footer). The dashboard content area uses max-width container with responsive grid for widget sections on desktop.

This avoids building a sidebar full of "coming soon" stubs. When more dashboard features exist, a sidebar layout can be introduced.

### Shared vs Type-Specific

**Shared components** (in `components/dashboard/`):
- `DashboardLayout` — Container wrapper with consistent spacing
- `OnboardingBanner` — Dismissible progress tracker
- `DashboardSection` — Section with heading + optional action button
- `StatCard` — Simple metric display (number + label)
- `EmptyState` — Reusable empty state pattern (icon + message + CTA)
- `ProfileHeader` — Profile summary with avatar, name, metadata, edit link
- `DashboardProgressBar` — Visual progress fill (reuses styling from signup ProgressBar)

**Artist-specific sections:**
- Bio (empty state → inline textarea)
- Portfolio grid (empty state → upload slots via PhotoUploadGrid)
- Weekly stats (views, saves, messages)
- Upcoming bookings (empty state)

**Studio-specific sections:**
- Studio page preview (draft badge + customizer CTA — the freemium hook)
- Team roster (empty state → invite CTA)
- Weekly stats (page views, inquiries, bookings)
- Business hours (empty state → set hours CTA)

---

## Component Design

### DashboardLayout
```tsx
// components/dashboard/dashboard-layout.tsx
// Wraps dashboard content with consistent container + spacing
Props: { children, className }
```
Uses: `mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12`

### OnboardingBanner
```tsx
// components/dashboard/onboarding-banner.tsx
Props: {
  title: string              // "Finish setting up your profile"
  subtitle: string           // "4 of 7 complete — artists with full profiles get 3× more views"
  progress: number           // 0-1 (e.g., 4/7 = 0.57)
  completedCount: number
  totalCount: number
  accentColor: "indigo" | "amber"  // Artist = indigo, Studio = amber
  onDismiss: () => void
  className?: string
}
```
- Gradient background matching accent color
- Dismiss X button (top right)
- Progress bar with gradient fill
- Uses localStorage to persist dismissed state

### DashboardSection
```tsx
// components/dashboard/dashboard-section.tsx
Props: {
  title: string              // "Portfolio"
  action?: { label: string; onClick: () => void }  // "+ Add work"
  children: React.ReactNode
  className?: string
}
```
- Title rendered as font-mono uppercase (matches SectionLabel pattern)
- Optional action button aligned right
- Consistent bottom margin

### StatCard
```tsx
// components/dashboard/stat-card.tsx
Props: {
  label: string              // "Profile views"
  value: string | number     // "0" or 142
  empty?: boolean            // true = muted styling
  className?: string
}
```
- Centered layout: large number + small label below
- `empty` state: muted text color (ink-black/30 or ink-cream/30)
- Uses Card component as base

### EmptyState
```tsx
// components/dashboard/empty-state.tsx
Props: {
  message: string            // "No bio yet"
  description?: string       // "Tell clients about your work"
  action?: { label: string; onClick: () => void }  // "+ Add a bio"
  variant?: "dashed" | "subtle"  // dashed = dashed border, subtle = solid muted
  className?: string
}
```
- Dashed border variant for "fill me in" items (headshot, bio, portfolio)
- Subtle variant for informational empty states (bookings, messages)
- Centered text + optional CTA link

### ProfileHeader
```tsx
// components/dashboard/profile-header.tsx
Props: {
  name: string
  subtitle?: string          // "Pro Plan" or "Portland, OR"
  avatarUrl?: string         // If no URL, show dashed circle with +
  avatarShape?: "circle" | "rounded"  // circle = artist, rounded = studio
  tags?: string[]            // Styles or specialties
  accentColor: "indigo" | "amber"
  onEdit?: () => void
  className?: string
}
```
- Avatar with dashed border when empty (upload prompt)
- Name + subtitle + tag pills
- Edit link aligned right
- Reuses tag pill pattern from signup StylePicker

---

## Per-Type Dashboard Content

### Artist Dashboard

**Page header:** Eyebrow "Your Profile" + Headline "Dashboard"

**Sections (in order):**
1. **OnboardingBanner** — "Finish setting up your profile" / "4 of 7 complete — artists with full profiles get 3× more views" / indigo accent
2. **ProfileHeader** — Name, styles as tags, avatar (dashed if empty), "Edit →" link
3. **Bio** — EmptyState (dashed) "No bio yet" → when clicked, inline Textarea appears
4. **Portfolio** — DashboardSection "Portfolio" with "+ Add work" action. Empty state: 3-slot PhotoUploadGrid with first slot as upload CTA, remaining as faded placeholders
5. **This Week** — 3x StatCard grid: Profile views (0), Saves (0), Messages (0)
6. **Upcoming** — EmptyState (subtle) "No upcoming bookings — Bookings will appear here once clients find you"

**Checklist items tracked in banner (4/7 pre-completed from signup):**
- ✓ Create account
- ✓ Choose your styles
- ✓ Connect Instagram (or "Skipped" if skipped)
- ✓ Select your plan
- ○ Add a bio
- ○ Upload a headshot
- ○ Add first portfolio piece

### Studio Dashboard

**Page header:** Eyebrow "Your Studio" + Headline "Dashboard"

**Sections (in order):**
1. **OnboardingBanner** — "Finish setting up your studio" / "3 of 6 complete — customize your page for free, publish when you're ready" / amber accent
2. **ProfileHeader** — Studio name, location + phone as subtitle, avatar (rounded, dashed if empty), specialties as tags, "Edit →" link
3. **Your Studio Page** — Featured card with "Draft" badge. Preview area + "Customize Your Studio Page →" CTA + "Free to build · Publish when you're ready" subtext. Amber accent border. This is the freemium conversion hook.
4. **Your Artists** — DashboardSection "Your Artists" with "+ Invite" action. EmptyState "No artists yet — Invite artists to join your studio roster"
5. **This Week** — 3x StatCard grid: Page views (0), Inquiries (0), Bookings (0)
6. **Business Hours** — DashboardSection "Business Hours" with "+ Set hours" action. EmptyState "No hours set — Help clients know when to visit"

**Checklist items tracked in banner (3/6 pre-completed from signup):**
- ✓ Create account
- ✓ Add studio details
- ✓ Set specialties
- ○ Add studio photos
- ○ Set business hours
- ○ Customize your page

---

## Visual Design

### Color System
- **Artist accent:** Indigo (`bg-indigo-50`, `text-indigo-600`, `border-indigo-200` for light contexts; gradient `from-indigo-600 to-purple-600` for progress bars)
- **Studio accent:** Amber (`bg-amber-50`, `text-amber-700`, `border-amber-200` for light contexts; gradient `from-amber-600 to-yellow-600` for progress bars)
- **Empty states:** `border-dashed border-gray-300` with `text-gray-400` content
- **Stat cards empty:** `text-gray-300` for zero values

### Pattern: Dashed = Incomplete
Dashed borders signal "this needs filling in":
- Avatar placeholder: dashed circle/rounded-square with `+` icon
- Bio area: dashed border card
- Portfolio slots: dashed border squares
Once populated → solid borders, real content

### Typography
- Dashboard headers: Eyebrow + Headline (existing PageHeader component)
- Section titles: `font-mono text-xs tracking-widest uppercase` (matches SectionLabel)
- Stat values: `text-2xl font-bold`
- Stat labels: `text-xs text-gray-500`
- Empty state messages: `text-sm text-gray-400`
- Empty state CTAs: `text-sm font-semibold text-{accent}-600`

### Responsive Behavior
- Mobile: Single column, all sections stacked
- Tablet (sm): Stat cards in 3-column grid, portfolio in 2-column
- Desktop (lg): Max-width container, stat cards in 3-column, portfolio in 3-column

---

## Signup Flow Changes

### Studio: Hide Plan Selection
In `/app/signup/studio/setup/page.tsx`, the "Continue" button currently links to `/signup/studio/plan`. Change it to redirect to `/shop-dashboard` instead.

The plan page (`/app/signup/studio/plan/page.tsx`) remains in the codebase but becomes unreachable from the studio signup flow. It will be used later as the publish gate.

### Customer: Redirect to Discover
In `/app/signup/customer/page.tsx`, the form submission currently goes to `/`. Change to redirect to `/discover`.

### Artist: Redirect to Dashboard
In `/app/signup/artist/plan/page.tsx`, the "Activate Account" button currently goes to `/`. Change to redirect to `/artist-dashboard`.

---

## Mock Data

Create `lib/data/dashboard.ts` with:
- `getArtistDashboardData()` — Returns mock artist dashboard state (new user with signup data pre-filled)
- `getStudioDashboardData()` — Returns mock studio dashboard state (new user with signup data pre-filled)
- Checklist items with completion status
- Mock "populated" variants for component library showcase

---

## Existing Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| Card, CardHeader, CardContent | `components/ui/card.tsx` | All dashboard section containers |
| Button | `components/ui/button.tsx` | CTAs, edit links, action buttons |
| Input | `components/ui/input.tsx` | Inline edit forms |
| Textarea | `components/ui/textarea.tsx` | Bio editing |
| PageHeader (Eyebrow + Headline + Subtitle) | `components/ui/page-header.tsx` | Dashboard page title |
| SectionLabel | `components/ui/section-label.tsx` | Section dividers |
| Divider | `components/ui/divider.tsx` | Visual separators |
| PhotoUploadGrid | `components/signup/photo-upload-grid.tsx` | Portfolio empty state |
| IconBox | `components/ui/icon-box.tsx` | Section icons |
| WidgetPanel | `components/detail/widget-panel.tsx` | Dark accent panels |

---

## Component Library

Both dashboards should have entries in `/component-library`:
- OnboardingBanner (all variants: artist/studio, different progress levels, dismissed)
- StatCard (empty + populated)
- EmptyState (dashed + subtle variants)
- ProfileHeader (artist + studio, empty + populated)
- Full dashboard page in "new user" and "established user" states

---

## Verification

1. Navigate signup flows end-to-end:
   - Customer signup → lands on `/discover`
   - Artist signup → lands on `/artist-dashboard` with onboarding banner
   - Studio signup → lands on `/shop-dashboard` with onboarding banner (no plan step)
2. Dashboard renders correctly on mobile (375px), tablet (768px), desktop (1280px)
3. Onboarding banner dismiss button works (hides banner, persists in localStorage)
4. Empty states show dashed borders, CTAs are clickable
5. All components follow existing patterns (forwardRef, cn(), displayName)
6. No raw hex values — all colors from design tokens or Tailwind utilities
7. Both dashboards appear in component library
8. `npm run build` passes with no errors
9. `npm run lint` passes
