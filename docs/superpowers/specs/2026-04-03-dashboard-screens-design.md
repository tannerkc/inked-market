# Dashboard Screens Design Spec

**Date:** 2026-04-03
**Status:** Draft
**Scope:** Edit Profile, Set Availability, Edit Studio Info, Invite Artists / Request to Join

---

## Overview

Four new interactive screens for the artist and studio dashboards, all using a shared slide-over panel pattern. These screens wire up the existing noop buttons and quick actions, making the dashboards functional with local state and mock data.

### Goals
- Make existing dashboard CTAs functional (Edit Profile, Set Availability, Edit Studio Info, Invite Artists)
- Introduce two-way studio-artist affiliation (studios invite, artists request)
- Stay strictly within the ink design system — reuse existing components, no new design patterns
- Keep everything DRY — shared SlideOverPanel, shared AffiliationRow, shared form primitives

### Non-Goals
- No backend/API integration — all state is local `useState` with mock data
- No real file uploads, email sending, or search indexing
- No new routes — all screens are slide-over panels on existing dashboard pages

---

## Interaction Pattern: Slide-Over Panel

All four screens use a shared `SlideOverPanel` component.

### Desktop (lg breakpoint and above)
- 420px-wide panel slides in from the right edge
- Dimmed backdrop overlay (`bg-ink-black/60 backdrop-blur-sm`) behind it
- Dashboard remains visible but non-interactive behind the overlay

### Mobile (below lg breakpoint)
- Full-screen sheet slides up from the bottom
- Rounded top corners (`rounded-t-2xl`)
- Full viewport width and height

### Shared Behavior
- Closes on: backdrop click, Escape key, close button (X)
- Body scroll locked when panel is open
- CSS transform transition (300ms cubic-bezier)
- Header is sticky within the panel scroll area

### Styling
- Panel background: `bg-ink-black` (dark) / `bg-ink-cream` (light)
- Backdrop: `bg-ink-black/60 backdrop-blur-sm`
- Header: sticky, border-bottom `border-ink-cream/[0.06]` (dark) / `border-ink-black/[0.06]` (light)
- Title: `font-mono text-[9px] tracking-[0.2em] uppercase` in `text-ink-cream/50` (dark) / `text-ink-black/50` (light)
- Close button: `rounded-lg border border-ink-cream/[0.08] bg-ink-cream/[0.04]` (dark), inverted for light
- Body: `padding: 24px`, overflow-y auto

### Props
```tsx
interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}
```

**File:** `components/ui/slide-over-panel.tsx`

---

## Screen 1: Edit Profile (Artist Dashboard)

**Trigger:** "Edit Profile" button on profile card, artist dashboard left column.

### Form Fields (top to bottom)

1. **Avatar upload** — Circular dashed border placeholder matching existing dashboard avatar pattern. Click triggers hidden file input. Shows image preview when a file is selected. Circle shape (`rounded-full`), 64px.

2. **First Name / Last Name** — Side-by-side row (`grid grid-cols-2 gap-3`). Uses existing `Input` component. Pass `variant="dark"` when `isDark`, `variant="light"` otherwise — all form inputs in all panels follow this pattern.

3. **Location** — Single `Input`, placeholder "City, State".

4. **Bio** — Existing `Textarea` component, 4 rows, placeholder "Tell clients about your work, style, and experience..."

5. **Styles** — Existing `StylePicker` component with `accentColor="red"`. Options: all 15 `TattooStyle` values from `lib/types/index.ts`. Pre-populated with current profile tags.

6. **Social links** — `SectionLabel` divider ("social"), followed by:
   - Instagram `Input`, placeholder "@username"
   - Website `Input`, placeholder "https://..."
   - TikTok `Input`, placeholder "@username"

### Actions
- Primary: `Button variant="ink"` full-width — "Save Changes"
- Secondary: `Button variant="ink-outline"` full-width — "Cancel" (closes panel)

### State Management
- Form state via `useState` in `app/artist-dashboard/page.tsx`
- On save: updates local dashboard data object, closes panel
- Pre-populated from current `getArtistDashboardData()` values

### Components Used (all existing)
`SlideOverPanel` (new), `Input`, `Textarea`, `StylePicker`, `SectionLabel`, `Button`

---

## Screen 2: Set Availability (Artist Dashboard)

**Trigger:** "Set Availability" quick action card, artist dashboard right column.

### Layout (top to bottom)

1. **Master toggle** — "Taking bookings" label with `ToggleSwitch`. When off, all day blocks dim (reduced opacity) and a message appears: "Your profile will show as unavailable." Styled: label in `font-mono text-[12px]` strong text, subtitle in `text-[10px]` muted. Container has dashed border matching existing dashboard patterns.

2. **Day blocks** — 7 sections (Monday through Sunday), each a `TimeSlotBlock` component:
   - **Header row:** `ToggleSwitch` (day on/off) + day name (`font-mono text-[10px] tracking-[0.1em] uppercase`) + "+ Add Block" button (`text-ink-rust font-mono text-[8px] uppercase`)
   - **When on:** Renders time slots. Each slot: two `Select` components (start, end) with time options (8:00 AM to 10:00 PM, 30-min increments) + remove button (X icon, `border-ink-cream/[0.06]` on hover turns `border-ink-red/[0.2]`)
   - **When off:** Slots hidden, header row at reduced opacity
   - Container: `rounded-[14px] border border-ink-cream/[0.06] bg-ink-cream/[0.02]` (dark), inverted for light

3. **Actions:** "Save Availability" ink button, "Cancel" below.

### New Components

**ToggleSwitch** (`components/ui/toggle-switch.tsx`):
```tsx
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}
```
- Track: `w-[36px] h-[20px] rounded-full` for md, `w-[32px] h-[18px]` for sm
- Off: `bg-ink-cream/[0.08]` (dark) / `bg-ink-black/[0.08]` (light)
- On: `bg-ink-rust`
- Thumb: circle, translates left/right on toggle, `bg-ink-cream/[0.4]` off, `bg-ink-cream` on

**TimeSlotBlock** (`components/dashboard/time-slot-block.tsx`):
```tsx
interface TimeSlotBlockProps {
  dayName: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  slots: TimeSlot[];
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onUpdateSlot: (index: number, field: "start" | "end", value: string) => void;
  className?: string;
}
```
Composes: `ToggleSwitch`, `Select`, remove button. Self-contained rendering of one day.

### State Management
```tsx
const [takingBookings, setTakingBookings] = useState(true);
const [availability, setAvailability] = useState<WeeklyAvailability>(getDefaultAvailability());
```
Managed in `app/artist-dashboard/page.tsx`. On save: updates local state, closes panel.

### Types (added to `lib/types/index.ts`)
```tsx
interface TimeSlot { start: string; end: string }
interface DayAvailability { enabled: boolean; slots: TimeSlot[] }
interface WeeklyAvailability { [day: string]: DayAvailability }
```

---

## Screen 3: Edit Studio Info (Studio Dashboard)

**Trigger:** "Edit Studio Info" button on studio card, studio dashboard left column.

### Form Fields (top to bottom)

1. **Studio avatar upload** — Same pattern as Edit Profile but `rounded-2xl` (square with rounded corners) instead of `rounded-full`. Matches existing studio card avatar shape. 64px.

2. **Studio Name** — `Input`, full width.

3. **City / State** — Side-by-side row (`grid grid-cols-2 gap-3`), two `Input` components.

4. **Phone** — `Input` with `type="tel"`, placeholder "(555) 555-0142".

5. **Email** — `Input` with `type="email"`, placeholder "studio@email.com".

6. **Specialties** — `StylePicker` component reused. Options from existing studio specialty list (Traditional, Japanese, Neo-Traditional, Blackwork, Realism, Fine Line, Watercolor, Geometric, Portrait, Minimalist). `accentColor="rust"`.

7. **Social links** — `SectionLabel` divider ("social"), then Instagram, Website, TikTok inputs — identical to Edit Profile.

### Actions
Same as Edit Profile: "Save Changes" ink button, "Cancel" ink-outline button.

### State Management
Same pattern as Edit Profile. `useState` in `app/shop-dashboard/page.tsx`.

### Components Used (all existing)
`SlideOverPanel` (new), `Input`, `StylePicker`, `SectionLabel`, `Button`

---

## Screen 4: Invite Artists & Request to Join (Two-Way Affiliation)

### Studio Side: "Invite Artists" Panel

**Trigger:** "+ Invite" action on "Your Artists" section header, or "Invite Artists" quick action card.

**Layout with two tabs:**

#### Tab 1: "Invite" (default)

1. **Email invite row** — `Input` placeholder "artist@email.com" + `Button variant="ink" size="sm"` "Send Invite". Horizontal row on desktop (`flex gap-3`), stacked on mobile.

2. `SectionLabel` divider ("or search artists")

3. **Search existing artists** — `Input` as search field, placeholder "Search by name or style..." Filters mock artist data on input change. Results render below as `AffiliationRow` components in a vertical list. Each row: avatar circle + name + style tags + "Invite" action button.

4. **Empty state:** "No artists found" when search has no matches.

#### Tab 2: "Roster"

Vertical list of `AffiliationRow` components showing all affiliations:
- **Pending Invite** (sent by studio): Name + "Pending" badge. No action — waiting on artist.
- **Pending Request** (sent by artist): Name + "Wants to join" badge + Accept / Decline buttons.
- **Active**: Name + "Active" badge + "Remove" action (muted).
- **Empty state:** `EmptyState` component — "No artists on your roster yet"

#### Tab Styling
Two pill buttons at panel top: `font-mono text-[9px] uppercase tracking-[0.15em]`. Active: `bg-ink-cream/[0.06] border-ink-cream/[0.12]` (dark). Inactive: `border-ink-cream/[0.08] text-ink-cream/[0.35]` (dark). Same pattern as existing tab/pill styling on the site.

### Artist Side: "Studio" Section + Search Panel

**Dashboard addition:** New `DashboardSection` on artist dashboard, placed between Portfolio and Quick Actions divider.

- `DashboardSection title="Studio" action={{ label: "+ Find a studio", onClick }}`
- Default state: `EmptyState` — "Not affiliated with a studio" / "Search for studios to request to join"
- When affiliated: Shows `AffiliationRow` with studio name and status

**"+ Find a studio" opens a SlideOverPanel:**

1. **Search** — `Input` placeholder "Search studios by name or location..." Filters mock studio data.
2. **Results** — `AffiliationRow` components: square avatar + studio name + location + "Request to Join" button (`text-ink-rust`).
3. **Pending requests** — Below search results, section showing any pending outbound requests with status.

### New Component: AffiliationRow

**File:** `components/dashboard/affiliation-row.tsx`

```tsx
interface AffiliationRowProps {
  name: string;
  avatarUrl?: string;
  avatarShape?: "circle" | "rounded"; // circle for artists, rounded for studios
  subtitle?: string; // styles for artists, location for studios
  status: AffiliationStatus;
  onAccept?: () => void;
  onDecline?: () => void;
  onAction?: () => void; // "Invite", "Request to Join", "Remove"
  actionLabel?: string;
  className?: string;
}
```

**Styling:**
- Container: `flex items-center gap-3 py-3` with bottom border `border-ink-cream/[0.04]` (dark)
- Avatar: 36px, `rounded-full` or `rounded-lg` based on `avatarShape`
- Name: `text-[13px] font-medium`
- Subtitle: `text-[10px]` muted
- Status badges (pill): `font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full border`
  - `pending-invite`: `border-ink-rust/20 text-ink-rust/60`
  - `pending-request`: `border-ink-red/20 text-ink-red/60`
  - `active`: `border-ink-sage/20 text-ink-sage/60`
- Action buttons: `text-ink-rust font-mono text-[9px] uppercase` for primary, `text-ink-cream/30` for decline/remove

### Types (added to `lib/types/index.ts`)
```tsx
type AffiliationStatus = "pending-invite" | "pending-request" | "active";

interface Affiliation {
  id: string;
  name: string;
  avatarUrl?: string;
  status: AffiliationStatus;
  role: "artist" | "studio";
}
```

### Mock Data (added to `lib/data/dashboard.ts`)
```tsx
getArtistSearchResults(): Array<{ id, name, avatarUrl?, styles }> // 3-4 mock artists
getStudioSearchResults(): Array<{ id, name, avatarUrl?, location }> // 2-3 mock studios
getStudioRoster(): Affiliation[] // Mix of pending-invite, pending-request, active
getDefaultAvailability(): WeeklyAvailability // Mon-Sat on, Sun off, default 10-6 blocks
```

---

## File Map

### New Files (4)

| File | Type | Purpose |
|------|------|---------|
| `components/ui/slide-over-panel.tsx` | UI Primitive | Responsive slide-over drawer |
| `components/ui/toggle-switch.tsx` | UI Primitive | On/off toggle with ink tokens |
| `components/dashboard/time-slot-block.tsx` | Domain Component | Single day's availability with toggle + time slots |
| `components/dashboard/affiliation-row.tsx` | Domain Component | Avatar + name + status badge + action row |

### Note on Input Variants
All `Input`, `Textarea`, and `Select` components inside slide-over panels must pass `variant={isDark ? "dark" : "light"}` to match the panel background. This applies to every form across all 4 screens.

### Modified Files (4)

| File | Changes |
|------|---------|
| `lib/types/index.ts` | Add `TimeSlot`, `DayAvailability`, `WeeklyAvailability`, `AffiliationStatus`, `Affiliation` |
| `lib/data/dashboard.ts` | Add `getArtistSearchResults()`, `getStudioSearchResults()`, `getStudioRoster()`, `getDefaultAvailability()` |
| `app/artist-dashboard/page.tsx` | Wire Edit Profile panel, Set Availability panel, add Studio affiliation section with search panel |
| `app/shop-dashboard/page.tsx` | Wire Edit Studio Info panel, Invite Artists panel with tabs |

### Component Library Update (1)

| File | Changes |
|------|---------|
| `app/component-library/page.tsx` | Add showcase entries for SlideOverPanel, ToggleSwitch, TimeSlotBlock, AffiliationRow |

### Existing Components Reused (no modifications)

- `Input` — Form text fields (with `variant` for dark/light)
- `Textarea` — Bio field
- `Select` — Time slot dropdowns
- `Button` — `ink` primary, `ink-outline` secondary
- `StylePicker` — Tag selection for styles/specialties
- `SectionLabel` — Dividers between form sections
- `DashboardSection` — Section wrapper
- `EmptyState` — Empty roster/affiliation states
- `useTheme()` — Dark/light mode throughout
- `cn()` — Conditional class merging

---

## Verification

1. `npm run build` — Zero new errors (exclude pre-existing button.tsx ref typing issue)
2. `npx eslint components/ui/slide-over-panel.tsx components/ui/toggle-switch.tsx components/dashboard/affiliation-row.tsx app/artist-dashboard/page.tsx app/shop-dashboard/page.tsx` — Zero errors/warnings
3. Visual verification at `localhost:3001/artist-dashboard` and `localhost:3001/shop-dashboard`:
   - All 4 slide-over panels open/close correctly
   - Dark and light mode renders correctly for all panels
   - Mobile responsive: panels become full-screen bottom sheets below lg breakpoint
   - Form inputs accept text, style tags toggle, time selects work
   - Affiliation search filters mock data, invite/request actions update local lists
4. Component library at `localhost:3001/component-library` shows new components
5. Theme toggle switches all panel elements correctly
