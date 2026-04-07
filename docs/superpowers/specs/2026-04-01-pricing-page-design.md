# Pricing Page Design Spec

## Context

The footer "Pricing" link currently points to `#`. Studios and artists need a clear, psychology-optimized pricing page that communicates the platform's value and drives conversions — particularly toward the Studio premium tier for shops and the Pro tier for artists.

This is a marketing page, not a billing/checkout flow. It presents tiers, answers objections, and funnels visitors to sign-up.

## Route

`/pricing` — top-level route, not nested under `/help`. Accessible via the footer "Platform > Pricing" link.

## Pricing Model

### Pricing Psychology Applied

- **Charm pricing with .85 endings** — signals premium quality without the bargain feel of .99. Positioned between discount (.99) and luxury (round numbers).
- **Starbucks decoy effect** — Pro tier priced closer to Studio ($20 gap) than to Basic ($40 gap), making Studio feel like obvious best value.
- **Anchoring** — Studio tier at $79.85 makes Pro at $59.85 feel reasonable.
- **Annual discount** — 20% off annual billing displayed as toggle. Creates urgency and commitment.

### Artist Tiers (2 tiers + add-on)

| Feature | Free | Pro |
|---------|------|-----|
| Price | $0 | $14.85/mo |
| Profile & gallery management | Yes | Yes |
| Gallery displayed on studio page | Yes | Yes |
| Must be linked to a studio | Yes | No |
| Public listing on Discover | No | Yes |
| Independent artist profile | No | Yes |

**Add-on: Search Boost** — $4.85/week. Temporarily prioritizes the artist in search results for 7 days. Available to Pro artists only. Displayed as a callout below the artist tier cards, not as a third tier.

### Studio Tiers (3 tiers)

| Feature | Basic | Pro | Studio |
|---------|-------|-----|--------|
| Price | $19.85/mo | $59.85/mo | $79.85/mo |
| Profile-style listing | Yes | Yes | Yes |
| Discover marketplace presence | Yes | Yes | Yes |
| Custom web page (template-based) | No | Yes | Yes |
| Customize content, colors, fonts | No | Yes | Yes |
| Rearrange template layout sections | No | No | Yes |
| Exclusive premium templates | No | No | Yes |
| Priority placement in search | No | No | Yes |

**Recommended badge** on Pro tier — it's the target tier via compromise effect, and the $20 gap to Studio pushes analytical buyers to upgrade.

### Tier Enforcement: Preventing Studios from Using Artist Pro

Artist and studio accounts are fundamentally different product types, enforced at onboarding ("Are you an artist or a studio?"). Studio-exclusive features that make artist profiles unsuitable for a business:

- **Multi-artist roster** — manage and display team members under the studio
- **Business metadata** — hours, walk-in policy, multiple chairs/stations, detailed location
- **Studio gallery** — shop photos, tour images, ambiance shots (distinct from portfolio)
- **Multi-artist booking** — book across multiple artists/chairs (artist profiles book for one person only)
- **Business verification badge** — verified via Google Business or business license

The $5 gap between Artist Pro ($14.85) and Studio Basic ($19.85) is intentionally small enough that gaming it isn't worth the feature loss. A studio using an artist profile would look incomplete and unprofessional to browsing clients — the differentiation is self-correcting.

### Annual Pricing

Annual billing = monthly price x 12 x 0.80 (20% discount).

| Tier | Monthly | Annual (per month) | Annual (billed) |
|------|---------|-------------------|-----------------|
| Artist Pro | $14.85 | $11.85 | $142.20/yr |
| Studio Basic | $19.85 | $15.85 | $190.20/yr |
| Studio Pro | $59.85 | $47.85 | $574.20/yr |
| Studio (Studio tier) | $79.85 | $63.85 | $766.20/yr |

## Page Structure

### Layout (top to bottom)

1. **PageHero** — `headline="PRICING"`, `accentColor="rust"`, short value-prop subtitle
2. **Audience toggle** — pill-style: "For Artists" | "For Studios" (centered, below hero)
3. **Billing toggle** — "Monthly" | "Annual (Save 20%)" small toggle near tier cards
4. **Pricing tier cards** — 2 cards (artists) or 3 cards (studios) in responsive grid
5. **Search Boost callout** — only in Artists view, below cards
6. **FAQ accordion** — 6 common questions
7. **CTA banner** — audience-aware call to action
8. **BackToTop**

### Audience Toggle

Two-option pill toggle, centered below hero. Same visual style as `AudiencePills` from the help center but reduced to two options. Client-side state only — no URL change. Default: "For Studios" (primary revenue audience).

When toggled, tier cards transition with a subtle opacity crossfade.

### Pricing Tier Cards — `PricingTierCard`

New component: `components/pricing/pricing-tier-card.tsx`

Props:
- `name: string` — tier name (e.g., "Basic", "Pro", "Studio")
- `price: number` — monthly price (0 for free)
- `annualPrice?: number` — annual monthly-equivalent price
- `description: string` — one-line tier summary
- `features: Array<{ text: string; included: boolean }>` — feature checklist
- `recommended?: boolean` — shows badge + accent border
- `ctaLabel?: string` — button text (default: "Get Started")
- `variant?: "light" | "dark"`

Card design:
- Matches project card pattern: `rounded-2xl border` with light/dark variants
- Recommended card gets accent border (`border-ink-rust`) and "Best Value" badge
- Price displayed large with `/mo` suffix in smaller text
- Annual price shown as strikethrough on monthly + annual price below (when annual toggle active)
- Feature list with checkmark icons (included) or dash (not included)
- CTA button at bottom: `Button variant="ink-fill"` for recommended, `variant="ink-outline"` for others

Layout:
- Artists: 2 cards centered, `max-w-2xl`, `grid-cols-1 sm:grid-cols-2`
- Studios: 3 cards, `max-w-5xl`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Search Boost Callout

Simple card below artist tier cards (only visible in Artists view):
- Icon + "Search Boost" label
- "$4.85/week — Get priority placement in search results for 7 days"
- Small "Available for Pro artists" note
- Styled as a secondary callout, not a full tier card

### FAQ Section

Reuses existing `FaqAccordion` component from `components/help/faq-accordion.tsx`.

Questions and answers:
1. **Can I switch plans at any time?** — Yes, upgrade or downgrade anytime. Changes take effect on your next billing cycle.
2. **Is there a contract or commitment?** — No contracts. All plans are month-to-month (or annual with a discount). Cancel anytime.
3. **What happens if I cancel?** — Your listing stays active until the end of your billing period. After that, artist profiles revert to Free tier, studio listings are unlisted.
4. **Do you offer annual billing?** — Yes. Save 20% by paying annually. Toggle the billing switch above to see annual pricing.
5. **Can artists work at multiple studios?** — Yes. Pro artists can associate with any number of studios while maintaining their independent profile.
6. **What payment methods do you accept?** — All major credit cards, debit cards, and Apple Pay. Invoicing available for annual Studio plans.

### CTA Banner

Reuses the card pattern from `ContactBanner`. Content changes based on active audience toggle:
- **Studios:** "Ready to grow your studio?" / "Join Inked Market and get discovered by clients in your area." / Button: "Get Started"
- **Artists:** "Ready to showcase your work?" / "Build your portfolio and get discovered by clients looking for your style." / Button: "Get Started"

## Theme Support

Full light/dark support using established pattern:
- Server `page.tsx` with `generateMetadata`
- Client `pricing-page-content.tsx` wrapper with `useTheme()` → passes `variant={mode}` to all children
- Page background: `isDark ? "bg-ink-black" : "bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark"`

## Components

### New

| Component | Path | Purpose |
|-----------|------|---------|
| `PricingTierCard` | `components/pricing/pricing-tier-card.tsx` | Tier card with price, features, CTA |
| `PricingToggle` | `components/pricing/pricing-toggle.tsx` | Audience + billing toggle controls |
| `SearchBoostCallout` | `components/pricing/search-boost-callout.tsx` | Artist add-on callout card |
| `PricingFaq` | `components/pricing/pricing-faq.tsx` | FAQ data + FaqAccordion wrapper |
| `PricingCta` | `components/pricing/pricing-cta.tsx` | Audience-aware CTA banner |
| Barrel export | `components/pricing/index.tsx` | Re-exports all pricing components |

### Reused

| Component | Path | Usage |
|-----------|------|-------|
| `PageHero` | `components/content/page-hero.tsx` | Page header |
| `FaqAccordion` | `components/help/faq-accordion.tsx` | FAQ section |
| `BackToTop` | `components/content/back-to-top.tsx` | Scroll-to-top button |
| `Button` | `components/ui/button.tsx` | CTA buttons in cards and banner |
| `Divider` | `components/ui/divider.tsx` | Section separators |

## Files to Create/Modify

| File | Action |
|------|--------|
| `app/pricing/page.tsx` | Create — server page with metadata |
| `app/pricing/pricing-page-content.tsx` | Create — client wrapper with theme |
| `components/pricing/pricing-tier-card.tsx` | Create — tier card component |
| `components/pricing/pricing-toggle.tsx` | Create — audience + billing toggles |
| `components/pricing/search-boost-callout.tsx` | Create — artist boost add-on callout |
| `components/pricing/pricing-faq.tsx` | Create — FAQ data + accordion |
| `components/pricing/pricing-cta.tsx` | Create — CTA banner |
| `components/pricing/index.tsx` | Create — barrel export |
| `components/layout/footer.tsx` | Modify — update Pricing href to `/pricing` |
| `app/component-library/page.tsx` | Modify — add PricingTierCard showcase |

**8 new files, 2 modified files**

## Verification

1. `npm run dev` → navigate to `/pricing` — page renders in both themes
2. Toggle "For Artists" / "For Studios" — cards swap correctly
3. Toggle "Monthly" / "Annual" — prices update with 20% discount
4. Search Boost callout visible only in Artists view
5. FAQ accordion expands/collapses
6. CTA banner text changes with audience toggle
7. Footer "Pricing" link navigates to `/pricing`
8. Mobile responsive: cards stack to single column
9. `npm run lint` — no new errors
10. Component library: PricingTierCard section visible with all variants
