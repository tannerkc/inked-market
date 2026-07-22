# Inked Market

Tattoo shop & artist discovery marketplace (like Shopify's Shop app for tattoo). Next.js 16, React 19, TypeScript 5, Tailwind CSS v4.

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

Path alias: `@/*` maps to project root. Import as `@/components/ui/button`, `@/lib/utils`, etc.

---

## Think Before You Code

**Never jump straight to implementation.** Before writing any code:

1. **Search existing code** — Check if a component, utility, or pattern already exists. Use `grep`/`glob` before creating anything new.
2. **Ask clarifying questions** — If requirements are ambiguous or there are multiple valid approaches, ask before choosing. Especially for domain logic (artist vs shop, booking, reviews).
3. **Plan the approach** — For features touching multiple files, outline the approach first. Identify which existing components to reuse.
4. **Check the domain context** (Section 8 below) — Tattoo industry has specific tensions that affect every design decision.
5. **Consider future features** — Will this component need to support booking integration? Multi-shop artists? Instagram import? Design for extension.

---

## Architecture & File Organization

```
app/                          # Next.js App Router — pages and API routes
  [entity]/[id]/              # Dynamic routes (artists, shops)
  globals.css                 # Design tokens via @theme inline (Tailwind v4)
  layout.tsx                  # Root layout: Navigation + main + Footer
components/
  ui/                         # Core reusable primitives (Button, Card, etc.)
  layout/                     # Layout shells (Navigation, Footer)
  tattoo-buttons/             # Themed decorative button variants
  [domain]/                   # Domain-specific components (booking/, portfolio/, etc.)
lib/
  types/                      # TypeScript interfaces — split by domain as it grows
  utils/                      # Pure utility functions — split by domain as it grows
  data/                       # Mock data (extract from pages) → future API layer
public/
  tattoos/                    # SVG tattoo illustrations
```

**Rules:**
- Server Components by default. Add `"use client"` only when required (event handlers, hooks, browser APIs).
- Every component directory gets a barrel export (`index.tsx`).
- Every component file exports exactly one primary component.
- All types go in `lib/types/`. All utilities go in `lib/utils/`.
- Mock data belongs in `lib/data/`, not inline in page files.
- API routes go in `app/api/` using Route Handlers when backend is added.

---

## Component Standards (DRY)

Follow the patterns established in `components/ui/button.tsx` and `components/ui/card.tsx`:

```tsx
// Pattern: forwardRef + cn() + variants + displayName
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <element ref={ref} className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props} />
  )
);
Component.displayName = "Component";
```

**Requirements for every component:**
- `React.forwardRef` for all primitives rendering DOM elements
- Accept `className` prop, merge with `cn()` from `@/lib/utils`
- Variant/size as explicit TypeScript union types (not arbitrary strings)
- Extend native HTML attributes where appropriate
- Set `displayName` on forwardRef components

**Before creating a new component:**
1. Does it exist in `components/ui/`? Reuse it.
2. Can it be composed from existing primitives? Compose it.
3. Will it be used in 2+ places? Put it in `components/ui/`.
4. Is it domain-specific but reusable within that domain? Put it in `components/[domain]/`.
5. Never duplicate markup. If you write the same JSX twice, extract it.

**Known DRY violations to fix when touching these files:**
- Inline SVG icons (star, verified badge, location pin) duplicated across 5+ files → extract to shared Icon component
- Profile header pattern nearly identical in `artists/[id]` and `shops/[id]` → extract to shared `ProfileHeader`
- Mock data hardcoded in page files → extract to `lib/data/`

---

## Design System & Tokens

All design tokens live in `app/globals.css` using Tailwind v4's `@theme inline` syntax. **No raw hex/rgb values in component files.** Use CSS variables or Tailwind utilities only.

### Brand Colors
- **Primary:** indigo-600 (`#4F46E5`) — buttons, links, active states
- **Secondary:** purple-600 — accents, gradients
- **Accent:** pink-600 — highlights, gradient endpoints
- **Neutral:** gray scale — text, borders, surfaces

### Patterns
- **Glass morphism** (nav, elevated cards): `bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-gray-200`
- **Badges/tags:** `bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium px-2.5 py-0.5`
- **Cards:** `bg-white rounded-xl border border-gray-200 shadow-sm` with hover: `shadow-md transition-shadow`
- **Gradients:** `bg-gradient-to-br from-indigo-600 to-purple-600` (primary) or `from-purple-600 to-pink-600` (accent)

### Typography
- **Display:** `Permanent_Marker` (Google Font, hero sections only)
- **Body:** System font stack via Tailwind defaults
- **Code:** Geist Mono

### Spacing & Layout
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- Card grids: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Section spacing: `py-16 sm:py-24`

### Dark Mode
- Supported via `prefers-color-scheme: dark` in globals.css
- Tokens: `--background` and `--foreground` swap in dark mode
- All components must work in both modes

---

## Frontend Design Plugin

**ALWAYS use the `frontend-design` skill when creating any new UI.** This includes:
- New pages
- New components
- Significant visual changes or redesigns
- Layout modifications

After generating with the plugin, adapt output to match Inked Market's design tokens, existing component patterns, and the component standards above.

---

## Internal UI Library

Maintain a living component showcase accessible at `/component-library` (expand from existing `/button-showcase`).

**Requirements:**
- Every new `components/ui/*` component MUST have an entry in the showcase
- Each entry shows: all variants, all sizes, interactive states, prop documentation
- Group by category: Primitives, Layout, Data Display, Feedback, Navigation, Domain-Specific
- Use this for planning, comparing approaches, and onboarding new developers
- Include a "comparison view" for evaluating component alternatives before committing to one
- Exclude from production builds via environment check (`process.env.NODE_ENV === 'development'`)

**Purpose:** This replaces Storybook. It runs in the actual Next.js app so components render exactly as they will in production. New developers can browse the full component library to understand what's available before building.

---

## Domain Context

These tensions affect every architecture and feature decision. Reference them when making choices.

### Artist vs. Shop Relationship
- Artists can be independent (`shopId` is optional) OR affiliated with a shop
- An artist's profile, following, and brand exist independently of any shop
- **Future:** Artists may work at multiple shops (guest spots) — plan for `shopIds: string[]`
- Shop pages list their artists; artist pages link back to their shop(s)
- Never design a feature that forces artists into a single-shop model

### Style Taxonomy
- 15 styles defined in `TattooStyle` type: traditional, realism, watercolor, tribal, geometric, blackwork, japanese, minimalist, portrait, fine-line, neo-traditional, dotwork, sketch, abstract, other
- Artists typically specialize in multiple styles
- Discovery and filtering must handle multi-style queries
- **Future:** One-click style tagging with AI-suggested styles based on portfolio images

### Geographic Density
- Many areas will have few/no listings during early growth
- Plan for: auto-populating from Google Business data, graceful empty states, expandable search radius ("nearest artists within X miles")
- Location type supports `coordinates` for future map features

### Portfolio Quality
- Platform value depends on photo quality — plan for AI-assisted quality filtering on upload
- Instagram OAuth import as primary portfolio population method
- Portfolio images have `tags` for style-based discovery

### Booking Model
- First-party booking engine (built 2026-07; spec: `docs/superpowers/specs/2026-07-14-booking-system-design.md`)
- Four flows: custom requests (artist-gated with quote + deposit), consultations, flash slot booking, multi-session projects
- Slots are derived, never stored (`lib/booking/availability.ts`); double-booking is impossible at the DB layer (gist exclusion constraint on active artist appointments)
- Deposits run on the artist/studio's OWN Stripe/Square account (`lib/booking/deposits/`) — the platform never holds funds; manual mark-received fallback when no provider is linked
- All transitions are status-guarded UPDATEs; `confirmDepositPaid` is the single idempotent paid-transition (webhook, verify-on-return, cron sweep, and manual confirmation converge on it)
- Studio side: front-desk quick-add gated by the artist-granted `affiliations.manage_bookings`; walk-ins are studio-level rows with no overlap constraint (multi-chair)
- Fast-follows deliberately deferred: Google Calendar sync, API-executed refunds, email/SMS reminders (`notifications` table is the outbox)

### Review Integrity
- `Review.verified` boolean — only allow reviews from verified bookings (like Airbnb)
- Never allow open-submission reviews. Fake reviews destroy platform trust.
- Reviews link to `targetId` with `targetType` discriminator (shop or artist)

### Churn Prevention
- Automated "is this still accurate?" prompts to shop owners on a schedule
- Stale data detection: flag listings with no updates in X months
- When artists leave shops or shops close, update immediately to maintain trust

---

## Performance, Security & Cost

### Performance
- Server Components by default — minimize client JS bundle
- `next/image` for all images with appropriate `sizes` prop (already established)
- `next/font` for custom fonts (Permanent Marker loaded this way)
- Lazy load below-fold content
- Metadata exports on every page for SEO
- Target: Lighthouse 90+ on all metrics

### Security (for backend integration)
- Never expose API keys or secrets in client components
- Validate all user input server-side with Zod
- Use Next.js Server Actions for mutations (not client-side fetch to API routes)
- Rate limit all public API endpoints
- Sanitize user-generated content (bios, reviews) before rendering
- Verified-booking-only reviews to prevent spam

### Cost Efficiency
- Prefer ISR (Incremental Static Regeneration) over SSR — shop/artist profiles change infrequently
- Edge functions for lightweight operations (redirects, simple auth checks)
- Optimize images at build time, not runtime where possible
- Cache aggressively: profiles, portfolio images, style taxonomy
- Minimize serverless function invocations — batch where possible
- Use Vercel's free/hobby tier efficiently during early growth

---

## Mobile-First & UX

- **All layouts are mobile-first.** Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) to scale UP, never down.
- Touch targets: minimum 44x44px for all interactive elements
- Shop owner onboarding target: fully claim and customize listing from phone in under 5 minutes
- Grid patterns: `grid-cols-1` base → `sm:grid-cols-2` → `lg:grid-cols-3` or `lg:grid-cols-4`
- Navigation uses fixed glass-morphism header (established pattern)
- **Intuitive UX is non-negotiable** — both customers and shop owners must find the platform obvious to use. If it needs explanation, redesign it.

### Tactical UX Features (planned)
- Instagram OAuth import — one-click portfolio from existing IG feed
- One-click style tagging — tag picker, not free-text bio writing
- Google Calendar sync — automatic availability from existing calendar
- Web scraping — pull existing bio/about from shop's current website
- Embeddable widgets — `<iframe>` or button for shops' Squarespace/Wix sites
