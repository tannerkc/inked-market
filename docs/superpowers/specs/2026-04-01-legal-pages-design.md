# Legal Pages Design Spec — Inked Market

**Date:** 2026-04-01
**Status:** Draft
**Disclaimer:** This is comprehensive research, not legal advice. Before publishing, all legal documents should be reviewed by a licensed business/technology attorney.

---

## Context

Inked Market needs Privacy Policy and Terms of Service pages to:
1. Comply with US federal and state privacy laws (CCPA/CPRA, CAN-SPAM, COPPA, plus 7 state comprehensive privacy statutes)
2. Protect the platform legally as a marketplace intermediary
3. Address tattoo-industry-specific concerns (copyright, health risks, portfolio consent, age restrictions)
4. Present legal content in the component-library aesthetic — dark theme, fun personality, serious substance

**Entity:** Not yet formed — use "Inked Market" with flexible language
**Jurisdiction:** US-focused
**Data collected:** User accounts, location, payments (via Stripe), portfolio images
**Third-party integrations:** Google Analytics, Vercel Analytics, Instagram OAuth, Stripe, Google Maps/Mapbox

---

## Page Architecture

### Route Structure

| Route | Purpose | Type |
|-------|---------|------|
| `/legal` | Hub landing page with cards linking to each doc | Server Component |
| `/legal/privacy` | Full Privacy Policy | Server + Client sub-components |
| `/legal/terms` | Full Terms of Service | Server + Client sub-components |

### File Structure

```
app/
  legal/
    layout.tsx              # Shared metadata (noindex, title template)
    page.tsx                # Hub landing page
    privacy/
      page.tsx              # Privacy Policy page
    terms/
      page.tsx              # Terms of Service page
components/
  legal/
    legal-hero.tsx          # Reusable hero (Server)
    legal-sidebar.tsx       # Sticky TOC + mobile accordion (Client)
    legal-section.tsx       # Numbered section wrapper (Server)
    legal-prose.tsx         # Dark-theme prose typography (Server)
    legal-doc-card.tsx      # Hub page document cards (Server)
    reading-progress.tsx    # Scroll progress bar (Client)
    back-to-top.tsx         # Scroll-to-top button (Client)
lib/
  data/
    legal-privacy.tsx       # Privacy policy content as structured data
    legal-terms.tsx         # Terms of service content as structured data
    legal-types.ts          # Shared types for legal documents
```

---

## UI Design

### Legal Hub (`/legal`)

**Hero:**
- `bg-ink-black` with `FilmGrainOverlay` at `opacity-[0.03]`
- Subtle radial glow using `ink-rust` at 8% opacity
- Badge pill: StatusDot + "LEGAL CENTER" in monospace
- Headline: **"THE FINE PRINT"** in Bebas Neue, `text-6xl sm:text-7xl lg:text-8xl`
- Flanked subtitle: "because transparency matters"
- Body text: "We keep things honest. Here's everything you need to know about how we handle your data and what you agree to when you use Inked Market."

**Document Cards:**
- `grid grid-cols-1 sm:grid-cols-2 gap-4`, max-w-2xl centered
- Each card: `rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] hover:border-ink-cream/[0.12] transition-all duration-500 p-7`
- Privacy card: IconBox (shield icon, sage accent), title "Your Ink, Your Data"
- Terms card: IconBox (scroll icon, rust accent), title "The House Rules"
- Metadata row: last updated date + version in monospace

### Document Pages (Privacy + Terms)

**Compact Hero:**
- Bebas Neue title + effective date/version badge with StatusDot
- Accent color: sage (privacy), rust (terms)

**Desktop Layout (lg+):**
- Sticky sidebar TOC: `w-48 sticky top-24`, monospace links with active section tracking via Intersection Observer
- Active state: `text-ink-cream/60` with `border-l-2 border-ink-sage` (or `border-ink-rust`)
- Content area: `flex-1 min-w-0 space-y-16`

**Mobile Layout (<lg):**
- Collapsible TOC accordion between hero and content
- Button styled as bordered container with chevron toggle
- Tapping a link scrolls to section and collapses TOC

**Section Structure (`LegalSection`):**
```
┌─ Section number (monospace, muted) ──── divider line ─┐
│ SECTION TITLE (Bebas Neue)                             │
│ Personality intro (italic, muted)                      │
│ Formal legal content (prose styling)                   │
└────────────────────────────────────────────────────────┘
```

**Prose Typography (`LegalProse`):**
- Body: `text-ink-cream/50 leading-relaxed text-[15px]`
- Subheadings: `text-ink-cream/70 font-semibold`
- Lists: `marker:text-ink-rust/40`
- Links: `text-ink-rust hover:text-ink-rust/80 underline`
- Callouts: `border-l-2 border-ink-red/30 pl-4 bg-ink-red/[0.02]`

**Reading Progress Bar:**
- `fixed top-16 left-0 right-0 z-40 h-0.5`
- Color matches document accent (sage/rust)
- Width driven by scroll percentage

**Back-to-Top Button:**
- `fixed bottom-8 right-8`, appears after scrolling past hero
- Rounded circle with arrow, matches container styling

### Tone Approach

Each section has two layers:
1. **Personality intro** — italic, muted, one sentence of tattoo-shop character
2. **Legal substance** — standard prose, thorough and legally sound

Examples:
- Privacy Section 01: *"Short version: we collect what we need to run the platform and nothing more. No selling your data to shady third parties."*
- Terms Section 04: *"Every good tattoo shop has house rules. Here are ours."*
- Terms Section 11: *"We built a marketplace, not a tattoo parlor. Here's what that means legally."*

---

## Privacy Policy Content

### Sections

**01 — What We Collect**
Three categories of data:

*Information You Provide:*
- Account data: name, email, password (hashed)
- Profile data: bio, profile image, cover image, certifications, years of experience
- Business data (shops): shop name, description, phone, hours, specialties
- Portfolio content: images (url, title, description, tags)
- Social links: Instagram, Facebook, Twitter, website URLs
- Customer preferences: preferred styles, price range, location preference
- Saved/favorites: saved shop/artist/design IDs
- Reviews: rating, title, content, images, verified status
- Messages: content, attachments, read status
- Payment info: billing info processed via Stripe (never stored on platform)

*Information Collected Automatically:*
- Device info (browser, OS, device identifiers)
- IP address
- Log data (pages visited, timestamps, referring URLs)
- Location: city/state from IP; precise GPS only with explicit opt-in
- Cookies and tracking technologies
- Analytics via Vercel Analytics and Google Analytics

*Information From Third Parties:*
- Instagram OAuth: profile name, username, photo, imported portfolio images
- Google/Apple OAuth: email, name, profile photo
- Stripe: transaction confirmation, payout status (no full card numbers)
- Google Maps/Mapbox: reverse geocoding results

*Sensitive PI disclosure (CPRA):* Precise geolocation (GPS) and login credentials qualify as sensitive PI. Right to limit use disclosed.

**02 — How We Use Your Information**
Purposes: account management, platform discovery features, location services, communications, reviews & trust, payment processing, analytics & improvement, safety & security, marketing (opt-in), legal compliance.

Platform-specific: artist profiles and portfolios are semi-public by design — names, portfolio images, styles, approximate location, ratings are publicly visible. Customer profiles are private by default.

**03 — How We Share Your Information**
Recipients: service providers (Stripe, Vercel, Google, Mapbox, Meta), publicly visible profile information (not a "sale"), business transfers, legal obligations, with consent.

CCPA/CPRA disclosure: affirmatively state whether PI is "sold" or "shared." If Google Analytics constitutes "sharing" for cross-context behavioral advertising, disclose. Include "Do Not Sell or Share" mechanism.

**04 — Cookies & Tracking Technologies**
Categories: strictly necessary (auth, session, CSRF), functional (preferences, theme), analytics (Google Analytics, Vercel), third-party (OAuth state, map tiles).

How to manage/disable, impact of disabling, browser cookie settings links.

**05 — Third-Party Services**
Individual disclosures for each:
- Stripe: data shared, link to privacy policy, no full card storage
- Google Analytics / Vercel Analytics: data collected, opt-out browser add-on
- Instagram/Meta OAuth: data imported, permissions requested, how to revoke, imported data persists after disconnect
- Google Maps / Mapbox: data shared, links to privacy policies

Instagram-specific: imported photos become platform data; disconnecting Instagram does not auto-delete imported content; EXIF metadata handling.

**06 — Your Privacy Rights**
Rights by state law:

| Right | CCPA/CPRA | VA CDPA | CO CPA | CT CTDPA | UT UCPA | TX TDPSA | OR OCPA | MT CDPA |
|-------|-----------|---------|--------|----------|---------|----------|---------|---------|
| Know/Access | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Delete | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Correct | Yes | Yes | Yes | Yes | No | Yes | Yes | Yes |
| Portability | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Opt-Out of Sale | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Opt-Out Targeted Ads | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Limit Sensitive PI | Yes | Consent | Consent | Consent | Consent | Consent | Consent | Consent |
| Non-Discrimination | Yes | — | — | — | — | — | — | — |
| Appeal | — | Yes | Yes | Yes | No | Yes | Yes | Yes |

How to exercise: email (privacy@inkedmarket.com) + web form. Response: 45 days (extendable). Verification process. Authorized agent support (CCPA).

Account deletion nuance: reviews anonymized to "Former Artist/Customer" rather than deleted to maintain platform integrity.

**07 — Data Retention**

| Data Type | Retention |
|-----------|-----------|
| Active account | Duration + 30 days post-deletion |
| Payment/transaction | 7 years (tax obligations) |
| Messages | Duration of both participants' accounts |
| Reviews | Indefinite (anonymized if author deletes) |
| Analytics | 26 months |
| Server logs | 90 days |
| Portfolio images | Until artist deletes or account deletion |

**08 — Data Security**
Encryption in transit (TLS/HTTPS), at rest for sensitive data, access controls, incident response, breach notification per state laws (30-72 hours).

**09 — Children's Privacy**
Not directed to children under 13 (COPPA). Minimum age 18 for accounts (aligns with tattoo industry age restrictions). CPRA: ages 13-15 require opt-in for sale/sharing.

**10 — International Data**
US-operated, data stored/processed in US. Non-US users consent to transfer.

**11 — Changes to This Policy**
Right to update. "Last Updated" date. Material changes via email + site notice. 30-day notice period. Annual review (CCPA).

**12 — Do Not Track / Global Privacy Control**
Honor GPC signals (required by CPRA + Colorado CPA). Disclose DNT response per CalOPPA.

**13 — California "Shine the Light"**
Cal. Civ. Code 1798.83 disclosure. One request per year. Affirmatively state if no PI shared for third-party direct marketing.

**14 — Portfolio Images & Third-Party Consent**
Artists responsible for consent from depicted individuals. Platform recommends model releases. Takedown process for non-consenting depicted individuals. EXIF metadata stripped from uploads.

**15 — Public vs. Private Information**

| Information | Visibility |
|-------------|-----------|
| Artist name, bio, portfolio, styles, city/state, ratings, social links | Public |
| Artist email, phone, precise address, GPS | Private |
| Shop name, description, location, hours, phone, ratings | Public |
| Shop email (internal), financial data | Private |
| Customer name, profile image | Visible to messaged artists/shops |
| Customer email, saved lists, preferences, messages | Private |
| Review content, author name, rating | Public |

**16 — CAN-SPAM Compliance**
All marketing emails include: physical address, ad identification, unsubscribe mechanism (honored within 10 days). Distinction between transactional and marketing emails.

**17 — Contact Information**
privacy@inkedmarket.com, general contact, mailing address (when entity formed), web form for privacy requests, "Do Not Sell or Share" link.

---

## Terms of Service Content

### Sections

**01 — Acceptance of Terms**
Browsing = acceptance. Account creation = explicit agreement (checkbox). Age requirement: 18+. Capacity to agree. Binding on behalf of organizations (shops).

**02 — Description of Service**
Inked Market is a marketplace/intermediary connecting tattoo artists and shops with customers. The platform does NOT provide tattoo services, employ artists, or guarantee any outcomes. Platform facilitates discovery, not transactions (initially).

**03 — Account Terms**
Registration requirements. Accuracy obligation. One account per person. Security responsibility. Suspension/termination rights.

**04 — User Conduct & Prohibited Activities**
Seven categories:
- Fraud: fake profiles, impersonation, misleading credentials
- Harassment: threats, hate speech, doxxing, stalking
- IP infringement: using others' portfolio images, copying designs without permission
- Platform integrity: scraping, bots, reverse engineering, circumventing security
- Review manipulation: fake reviews, incentivized reviews, review bombing
- Commercial misuse: spam, unauthorized advertising, competing services
- Legal violations: illegal content, violation of tattoo licensing laws

Consequences: warning → content removal → suspension → permanent ban.

**05 — User-Generated Content**
License grant: non-exclusive, worldwide, royalty-free license to display, promote, and distribute user content on the platform. User retains ownership. Right to remove content violating standards.

DMCA Section 512 takedown process:
- Designated agent contact info (to be registered with Copyright Office)
- Notice requirements (identification, contact, good-faith statement, perjury declaration)
- Counter-notice process
- Repeat infringer policy (three strikes)

**06 — Intellectual Property & Tattoo Copyright**
Platform IP: Inked Market name, logo, design, code are owned by the company.
Tattoo copyright: the tattoo artist is the copyright holder of original designs. Client receives implied license to display the tattoo on their body. Platform receives display/promotion license for portfolio images.

References: *Solid Oak Sketches v. 2K Games*, *Whitmill v. Warner Bros.*

**07 — Artist/Shop Specific Terms**
- Profile accuracy obligation
- Self-certification of required licensing/permits (platform does NOT verify)
- Health and safety compliance is artist/shop's responsibility
- Photo consent: must obtain consent from individuals depicted in portfolio images
- Staleness: respond to 30-day verification prompts; 6-month inactivity flagging
- No employment relationship: artists/shops are independent operators, not employees, contractors, or agents of Inked Market

**08 — Customer Specific Terms**
- Booking responsibility: customers deal directly with artists/shops
- Assumption of risk for tattoo services
- Review integrity: verified-only reviews (when booking system available), prohibition on fake/incentivized reviews
- Dispute resolution with artists/shops is between those parties; platform may mediate but is not obligated

**09 — Third-Party Services**
Disclaimer for: Instagram integration, Stripe payments, Google Maps/Mapbox, future booking partners (Porter/InkBook). Platform not responsible for third-party services. Links to third-party terms.

**10 — Payment Terms**
Current: platform is free. Future: framework for potential platform fees, commissions, subscription tiers. Stripe handles all payment processing. Refund policies between artists and customers. Platform commission structure TBD.

**11 — Disclaimers & Limitation of Liability**
**AS IS / AS AVAILABLE** — no warranty.

Health and safety disclaimer enumerating tattoo risks:
- Allergic reactions to ink
- Infections (bacterial, viral)
- MRSA
- Hepatitis (B and C)
- Scarring and keloids
- MRI complications
- Granulomas

Platform does not guarantee: artist skill, shop cleanliness, license validity, availability, or results.

Aggregate liability cap: greater of $100 or fees paid in preceding 12 months.

Exclusion of consequential, incidental, special, punitive damages.

**12 — Indemnification**
Users indemnify Inked Market against claims arising from: user content, use of services, violation of terms, violation of third-party rights, tattoo services obtained through the platform.

**13 — Dispute Resolution**
Binding arbitration via AAA (American Arbitration Association). Class action waiver. Small claims court exception. 30-day opt-out right from arbitration (strengthens enforceability). Governing law: state TBD (recommend Delaware once entity formed). Informal resolution first (30-day negotiation period before arbitration).

**14 — Modification of Terms**
Right to modify at any time. Material changes: 30 days notice via email + site notice. Continued use = acceptance. Users may terminate account if they disagree.

**15 — Termination**
Platform may suspend/terminate for violations or at discretion. User may close account at any time. Survival clauses: IP, indemnification, liability, dispute resolution survive termination.

**16 — General Provisions**
Severability, entire agreement, no waiver, assignment, force majeure, headings for convenience only.

**17 — Contact Information**
legal@inkedmarket.com, mailing address (when entity formed).

---

## Special Legal Considerations

### TAKE IT DOWN Act (effective May 19, 2026)
Inked Market qualifies as a "covered platform." Must implement 48-hour removal process for nonconsensual intimate images. Add reporting mechanism and response workflow.

### Section 230 Protections
Platform currently protected as intermediary for user-generated content. Monitor proposed legislation. ToS structured so disclaimers/indemnification provide backup if Section 230 weakened.

### Entity Formation Recommendations
- Form Delaware LLC
- Register DMCA agent with U.S. Copyright Office
- File trademark application for "Inked Market"

---

## Component Implementation Details

### Reuse from existing UI library

| Existing Component | Usage |
|-------------------|-------|
| `FilmGrainOverlay` | Page background texture |
| `Divider` (variant="dark") | Between sections, in sidebar |
| `SectionLabel` (variant="dark") | Hub page decorative labels |
| `Button` (ink-outline) | Hub page CTAs |
| `IconBox` | Hub page card icons |
| `Logo` | Hub page if needed |

### New components follow existing patterns
- `LegalDocCard` follows `FeatureCard` structure
- `LegalSection` follows component library's `ShowcaseSection`
- `LegalSidebar` follows component library sidebar (lines 166-189)
- `LegalHero` follows component library hero (lines 126-161)
- All use: `React.forwardRef`, `cn()`, `className` prop, `displayName`

### Client vs Server decisions
- Server: layout, hub page, legal-hero, legal-section, legal-prose, legal-doc-card
- Client: legal-sidebar (Intersection Observer + mobile toggle), reading-progress (scroll listener), back-to-top (scroll listener)
- Document pages are Server Components composing client sub-components

### Legal content lives in `lib/data/`
Structured data, not inline JSX:
```ts
interface LegalSection {
  id: string;
  number: string;
  title: string;
  personalityIntro: string;
  content: React.ReactNode;
}

interface LegalDocument {
  slug: "privacy" | "terms";
  title: string;
  headline: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  accentColor: "sage" | "rust";
  sections: LegalSection[];
}
```

---

## Footer Update

Update `components/layout/footer.tsx` lines 36-37:
```ts
// Before
{ label: "Privacy Policy", href: "#" },
{ label: "Terms of Service", href: "#" },

// After
{ label: "Privacy Policy", href: "/legal/privacy" },
{ label: "Terms of Service", href: "/legal/terms" },
```

---

## Verification Plan

1. **Visual:** All three pages render correctly at mobile, tablet, desktop breakpoints
2. **Navigation:** Footer links work, hub cards link to sub-pages, sidebar TOC scrolls to correct sections, back-to-top works
3. **Interactive:** Reading progress bar tracks scroll, sidebar active state updates on scroll, mobile TOC toggles
4. **Content:** All 17 privacy sections and 17 terms sections render with correct numbering, personality intros, and legal content
5. **Build:** `npm run build` passes with no errors
6. **Lint:** `npm run lint` passes
7. **Accessibility:** Keyboard navigation through TOC, proper heading hierarchy, sufficient contrast ratios on dark theme
8. **SEO:** `noindex, nofollow` on legal pages, proper metadata titles

---

## Implementation Sequence

1. Create shared types (`lib/data/legal-types.ts`)
2. Create legal layout (`app/legal/layout.tsx`)
3. Build server components: `legal-hero`, `legal-section`, `legal-prose`, `legal-doc-card`
4. Build client components: `legal-sidebar`, `reading-progress`, `back-to-top`
5. Write privacy policy content (`lib/data/legal-privacy.tsx`)
6. Write terms of service content (`lib/data/legal-terms.tsx`)
7. Build hub page (`app/legal/page.tsx`)
8. Build privacy page (`app/legal/privacy/page.tsx`)
9. Build terms page (`app/legal/terms/page.tsx`)
10. Update footer links
11. Run verification checks
