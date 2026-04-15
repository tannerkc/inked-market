# Studio Policies & Disclaimers

Studio websites need legal and policy pages -- privacy, terms, booking deposits, cancellation, aftercare, age requirements, consent waivers, and health disclosures. No website builder currently provides tattoo-industry-specific policy language. This feature auto-generates professionally written policy defaults that studio owners can customize, surfacing key info at a glance on the studio page while linking to full policy text on a dedicated sub-page.

## Standard Policies (8 built-in)

| ID | Title | Structured Fields |
|---|---|---|
| `booking-deposit` | Booking & Deposit | `depositAmount`, `depositType` (non-refundable / applies-to-total) |
| `cancellation-refund` | Cancellation & Refund | `cancellationWindow`, `noShowPolicy` |
| `aftercare` | Aftercare | `touchUpWindow`, `touchUpIncluded` (yes/no) |
| `age-id` | Age & ID Requirements | `minimumAge`, `idRequired` (yes/no), `parentalConsentAllowed` (yes/no) |
| `consent-waiver` | Consent & Waiver | _(none -- body text only)_ |
| `health-safety` | Health & Safety | _(none -- body text only)_ |
| `privacy` | Privacy Policy | _(none -- body text only)_ |
| `terms` | Terms of Service | _(none -- body text only)_ |

Each standard policy ships with pre-written, industry-specific template text. The studio name and relevant structured field values are interpolated into the template. Owners can edit the full text (Custom tier) or just fill in the structured fields (Flash tier).

### Structured field input types

| Field | Input Type | Options/Format |
|---|---|---|
| `depositAmount` | text input | dollar amount, e.g., "$100" |
| `depositType` | segmented picker | "Non-refundable" / "Applies to total" |
| `cancellationWindow` | segmented picker | "24 hours" / "48 hours" / "72 hours" |
| `noShowPolicy` | segmented picker | "Deposit forfeited" / "Full charge" / "Reschedule only" |
| `minimumAge` | segmented picker | "16+" / "18+" / "21+" |
| `idRequired` | toggle | yes/no |
| `parentalConsentAllowed` | toggle | yes/no (only shown if minimumAge < 18) |
| `touchUpWindow` | segmented picker | "14 days" / "30 days" / "60 days" / "90 days" |
| `touchUpIncluded` | toggle | yes/no |

## Custom Policies

Studio owners (Custom tier only) can create additional policy-type pages. Same shape as standard: title + body text. They can optionally "feature" a custom policy on the studio page by writing a short summary line (~50 chars max).

Custom policies do not have structured fields -- they are body-text-only with the opt-in featured summary.

## Data Model

### PolicyConfig interface

```typescript
interface PolicyConfig {
  id: string;                    // slug for standard, generated for custom
  type: "standard" | "custom";
  title: string;                 // editable for custom, preset for standard
  enabled: boolean;
  body: string;                  // full policy text
  structuredFields?: Record<string, string>;  // key-value for card generation
  featured: boolean;             // show as inline card on studio page
  featuredSummary?: string;      // manual summary for custom policies
  order: number;                 // sort position (custom policies only)
}
```

### StudioThemeConfig additions

```typescript
// Add to existing StudioThemeConfig
showPoliciesSection: boolean;                              // toggle inline section
policiesDisplayMode: "section" | "footer";                 // own section vs footer-embedded
policiesCardStyle: "grid" | "glass" | "rows";              // inline card visual style
policiesPageLayout: "tabs" | "sidebar";                    // /policies page layout
policies: PolicyConfig[];                                  // array of all policies
```

### New types

```typescript
type PoliciesDisplayMode = "section" | "footer";
type PoliciesCardStyle = "grid" | "glass" | "rows";
type PoliciesPageLayout = "tabs" | "sidebar";
```

### FooterLayout extension

Add `"columns-policies"` to the existing `FooterLayout` union type. When selected, the columns footer embeds policy chips in a single horizontal row between link columns and the copyright bar. Chips inherit the existing `tagStyle` setting (pill / square / outline).

## Three Surfaces

### 1. Builder -- New "Policies" Tab

A new top-level tab in the editor panel alongside Theme, Type, Sections, Effects, Brand.

**Flash tier:**
- Master toggle: "Show policies section on studio page"
- List of 8 standard policies as toggle rows (reuse existing `ToggleRow` pattern)
- When toggled on, expand to show structured field inputs only (deposit amount, cancellation window, etc.)
- No custom policy creation
- No card style picker (uses `glass` default)
- No page layout picker (uses `tabs` default)

**Custom tier:**
- Everything in Flash, plus:
- "Edit full text" expander on each standard policy -- opens textarea with templated default pre-filled
- "Add custom policy" button at bottom -- title input + body textarea + "Feature on studio page" toggle + summary input
- Reorder handle on custom policies (drag to sort)
- `policiesDisplayMode` segmented picker: "Own section" vs "In footer"
- `policiesCardStyle` segmented picker: "Grid" | "Glass" | "Rows"
- `policiesPageLayout` segmented picker: "Tabs" | "Sidebar"

### 2. Studio Page -- Inline Key-Info

**Default (policiesDisplayMode: "section"):**
- New section between Footer CTA and Footer
- Section heading: "Policies & Info"
- 2-column grid of key-info cards (1-col on mobile)
- Three card styles:
  - **Grid**: no card borders, clean divider lines between cells, stat-sheet feel, large values
  - **Glass**: translucent accent-tinted cards with soft borders and backdrop blur
  - **Rows**: horizontal rows with label+detail left, value right, menu/pricing-sheet aesthetic
- "View all policies" link at bottom navigating to `/studios/[id]/policies`
- Card order: standard policies with structured fields first (booking, cancellation, age, aftercare), then featured custom policies

**Variant (policiesDisplayMode: "footer"):**
- New footer layout: `columns-policies`
- Same as existing `ColumnsFooter` but adds a single horizontal row of compact policy chips between link columns and copyright bar
- Chips use the existing `tagStyle` (pill / square / outline)
- Single row, no wrapping -- horizontally scrollable on narrow screens with `flex-shrink: 0`
- "All Policies" link in the copyright bar alongside Privacy/Terms
- When this mode is active, the separate policies section is hidden (no duplication)

**Card auto-generation:**
- Standard policies with filled structured fields automatically generate inline cards (e.g., filling in `$100` for depositAmount creates the "Deposit: $100" card)
- Custom policies opt-in via the `featured` toggle with a manual `featuredSummary`

### 3. /studios/[id]/policies -- Full Text Page

New nested route under the studio dynamic route.

**Two layouts:**
- **Tabs** (default, both tiers): horizontal tab bar, one policy visible at a time, scrollable tabs on mobile with shortened labels
- **Sidebar** (Custom tier only): persistent side nav on desktop with active item accent-highlighted, collapses to tabs on mobile

**Shared behavior:**
- Back link returns to studio page (not browser back)
- Policies with structured fields show a key-info callout (glassmorphic cards) at the top of their content
- Body-text-only policies skip the callout, go straight to text
- "Last updated" date auto-set from most recent policy edit
- Full studio theme inheritance (colors, fonts, density, border shapes, etc.)
- URL hashes per tab/section for direct linking (e.g., `/policies#cancellation`)
- Page is a Server Component -- static content, no client JS needed beyond tab switching

## Template Defaults

All 9 templates start with the same policy defaults:
- `showPoliciesSection: true`
- `policiesDisplayMode: "section"`
- `policiesCardStyle: "glass"`
- `policiesPageLayout: "tabs"`
- Standard policies: all 8 enabled with empty structured fields and template body text
- No custom policies

Structured fields start empty -- the inline cards section shows a gentle prompt ("Set up your policies to show key info here") until the owner fills in at least one field.

## Files to Create/Modify

### New files
- `lib/types/policies.ts` -- PolicyConfig, PoliciesDisplayMode, PoliciesCardStyle, PoliciesPageLayout
- `lib/data/policy-templates.ts` -- default body text for all 8 standard policies, structured field definitions
- `components/builder/controls/policies-editor.tsx` -- the Policies tab content (Flash variant)
- `components/builder/controls/policies-editor-custom.tsx` -- Custom tier extensions
- `components/builder/controls/policies-card-style-picker.tsx` -- card style segmented picker
- `components/builder/controls/policies-display-mode-picker.tsx` -- section vs footer picker
- `components/builder/controls/policies-page-layout-picker.tsx` -- tabs vs sidebar picker
- `components/builder/preview/policies-section.tsx` -- inline key-info section for studio page preview
- `components/builder/preview/footer-columns-policies.tsx` -- footer variant with embedded chips
- `app/studios/[id]/policies/page.tsx` -- the full policies page
- `components/policies/policies-tabs-layout.tsx` -- tabs layout component
- `components/policies/policies-sidebar-layout.tsx` -- sidebar layout component
- `components/policies/policy-content.tsx` -- renders a single policy's content (callout + body)

### Modified files
- `lib/types/builder.ts` -- add policy fields to StudioThemeConfig, extend FooterLayout union
- `components/builder/flash-editor.tsx` -- add Policies tab
- `components/builder/custom-editor.tsx` -- add Policies tab
- `components/builder/preview/template-footer.tsx` -- add `columns-policies` footer component, wire into footerComponents map
- `components/builder/studio-page-preview.tsx` -- render PoliciesSection between FooterCTA and Footer
- `lib/data/templates.ts` -- add policy defaults to all 9 template definitions
- `lib/hooks/use-theme-editor.ts` -- handle policy config in applyChange, undo/redo

## Verification

1. Builder: toggle policies on/off in Flash tier, confirm inline section appears/hides in preview
2. Builder: fill in structured fields (deposit amount, etc.), confirm cards auto-generate in preview
3. Builder: switch between all 3 card styles, confirm visual change in preview
4. Builder: switch policiesDisplayMode to "footer", confirm section hides and chips appear in footer
5. Builder: Custom tier -- edit full policy text, add a custom policy, feature it, confirm card appears
6. Builder: Custom tier -- switch policiesPageLayout to "sidebar", confirm preview updates
7. Preview: click "View all policies" link, confirm it would navigate to /policies
8. /policies page: render with tabs layout, click between tabs, confirm content switches
9. /policies page: render with sidebar layout on desktop, confirm sidebar nav works
10. /policies page: resize to mobile, confirm sidebar collapses to tabs
11. /policies page: confirm theme inheritance (change studio theme, reload policies page)
12. /policies page: confirm URL hash linking (navigate to /policies#cancellation, correct tab opens)
13. Footer variant: confirm chips render in single row, horizontally scroll on narrow viewport
14. Footer variant: confirm chips respect tagStyle (pill/square/outline)
