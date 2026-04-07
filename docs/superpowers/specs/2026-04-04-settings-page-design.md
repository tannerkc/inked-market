# Settings Page Design

A unified `/settings` route serving all three account types (artist, studio, customer) with role-aware section visibility. Settings handles account-level concerns only — profile editing stays on the dashboard.

---

## Layout

**Desktop:** Sidebar navigation (left, ~200px) + content area (right, fluid). Sidebar lists all sections with the active one highlighted. Danger Zone is visually separated at the bottom with a divider.

**Mobile:** Horizontal scrollable tabs at the top replace the sidebar. Tap to switch sections. Active tab has a bottom border accent (`ink-rust`).

**Shared wrapper:** `DashboardLayout` for consistent background/spacing. `PageHeader` with eyebrow "Account" and headline "Your Settings".

---

## Sections by Role

| Section | Customer | Artist | Studio |
|---|:---:|:---:|:---:|
| Account | Yes | Yes | Yes |
| Appearance | Yes | Yes | Yes |
| Notifications | Yes | Yes | Yes |
| Connected Accounts | — | Yes | Yes |
| Plan & Billing | — | Yes | Yes |
| Privacy | Yes | Yes | Yes |
| Danger Zone | Yes | Yes | Yes |

Sections not applicable to a role are hidden from the sidebar/tabs entirely.

---

## Section 1: Account

**Available to:** All roles

**Fields:**
- **Email Address** — Display current email. "Change" button expands inline form: new email + confirm password. Saves on submit.
- **Password** — Masked display (`••••••••••`). "Change" button expands inline form: current password + new password + confirm new password. Shows "Last changed: Never" or relative date.
- **Two-Factor Authentication** — Coming Soon placeholder. Dashed border card, disabled state. Text: "Not enabled — Add an extra layer of security."

**Edge cases:**
- Email change requires password confirmation to prevent unauthorized changes
- Password must meet minimum length (8 chars)
- Social-login-only users (future): hide password section, show "Set a password" CTA instead
- "Change" buttons use accordion-style expansion: the current value display stays visible, form fields appear below it. Collapse on cancel or successful save with brief success toast/feedback.
- Only one field (email or password) can be expanded at a time — expanding one collapses the other

---

## Section 2: Appearance

**Available to:** All roles

**Content:**
- **Theme toggle** — Reuse existing `ThemeToggle` component. Light/Dark switch with preview description.
- Description: "Choose how Inked Market looks to you"

**Edge cases:**
- Theme persists via localStorage (`inked-theme` key) — already implemented in `ThemeProvider`
- Toggle change applies immediately (no save button needed)

---

## Section 3: Notifications

**Available to:** All roles (content varies by role)

**Shared toggles:**
- Marketing emails — New features, promotions, and announcements
- Platform updates — Maintenance, policy changes, and security alerts

**Artist-specific toggles:**
- Booking requests — When a client requests a booking
- Studio invitations — When a studio invites you to join
- Review alerts — When you receive a new review

**Studio-specific toggles:**
- Artist applications — When an artist requests affiliation
- Booking alerts — When a booking is made at your studio
- Review alerts — When your studio receives a new review

**Customer-specific toggles:**
- Saved artist updates — When a saved artist posts new work
- Booking confirmations — Status updates on your bookings

**Edge cases:**
- All toggles default to ON for new accounts
- Toggling off marketing requires no confirmation
- Toggling off booking-critical notifications (booking requests/alerts) shows inline warning: "You may miss booking requests if this is turned off"
- Each toggle saves immediately on change (no save button) with subtle feedback
- Group toggles under labeled subsections: "Activity" (role-specific) and "Communications" (shared)

---

## Section 4: Connected Accounts

**Available to:** Artist, Studio only (hidden for Customer)

**Social login providers:**
- Instagram — Connect/Disconnect. For artists: shows "Import Portfolio" button when connected.
- Google — Connect/Disconnect
- Apple — Connect/Disconnect

**Display per provider:**
- Connected state: Provider icon + name + connected email/handle + "Disconnect" button
- Disconnected state: Provider icon + name + "Connect" button

**Edge cases:**
- All "Connect" buttons show as "Coming Soon" initially (social login not yet implemented in backend)
- If only one auth method is connected and user tries to disconnect: block with message "You need at least one login method. Set a password or connect another account first."
- Instagram connection for artists doubles as portfolio import — show additional CTA: "Import Portfolio from Instagram"
- Connected account indicator should show the linked email/username for clarity

---

## Section 5: Plan & Billing

**Available to:** Artist, Studio only (hidden for Customer)

### Tier Names

Based on tattoo needle types:
- **Liner** — Entry tier (Artist: free, Studio: $19.85/mo or $15.85/mo annual)
- **Shader** — Mid tier (Artist: $14.85/mo or $11.85/mo annual, Studio: $59.85/mo or $47.85/mo annual)
- **Magnum** — Top tier (Studio only: $79.85/mo or $63.85/mo annual)

### Layout

1. **Current Plan Card** — Displays tier name, price, billing cycle (monthly/annual), next billing date. Badge showing tier name.
2. **Plan Comparison Table** — Side-by-side feature comparison of all tiers for the user's role. Current plan highlighted. Upgrade/downgrade buttons on each column.
3. **Billing Cycle Toggle** — Monthly ↔ Annual with savings percentage badge (e.g., "Save 20%")
4. **Cancel Plan** — Link at bottom of section. Opens confirmation dialog.

### State Variations

**Artist on Liner (free):**
- Current plan card shows "Liner — Free" with no billing info
- Plan comparison shows Liner vs Shader with "Upgrade to Shader" CTA
- No cancel option (nothing to cancel)

**Artist on Shader (paid):**
- Current plan card shows "Shader — $14.85/mo" with billing cycle and next date
- Plan comparison shows both tiers, Shader highlighted as current
- "Downgrade to Liner" option available
- "Cancel Subscription" link at bottom

**Studio with no plan (freemium builder, unpublished):**
- Shows special state: "Your studio is in draft mode"
- Description: "You have full access to the page builder. Choose a plan when you're ready to publish."
- CTA: "Choose a Plan" which shows the plan comparison inline
- No billing info, no cancel option

**Studio on Liner/Shader/Magnum (published):**
- Current plan card with full billing details
- Plan comparison with all 3 tiers, current highlighted
- Upgrade/downgrade buttons context-aware
- Cancel option available

### Edge Cases

- **Downgrade mid-cycle:** "Changes take effect at the end of your current billing period ([exact date]). You'll keep [current tier] features until then."
- **Upgrade mid-cycle:** Takes effect immediately. Prorated charge for remainder of billing period.
- **Cancel subscription:**
  - Confirmation dialog: "Are you sure? Your plan stays active until [date]. After that:"
  - Artist: "Your profile will be removed from Discover. Your portfolio remains accessible via direct link."
  - Studio: "Your public listing will be unpublished. Your [X] affiliated artists will be notified."
- **Annual billing cancel:** "Your plan remains active for the [X] remaining months of your annual subscription. No partial refund."
- **Re-subscribe after cancel:** Show "Resume" option if still within current billing period. Otherwise show normal plan selection.

---

## Section 6: Privacy

**Available to:** All roles (content varies by role)

**Shared toggles:**
- Show profile in search results — Controls Discover visibility
- Allow messages from non-connections — Controls who can DM you

**Artist-specific toggles:**
- Show availability status publicly — Whether booking status is visible
- Show studio affiliation publicly — Whether your studio link appears on profile
- Portfolio visibility — Public / Followers only (radio, not toggle)

**Studio-specific toggles:**
- Show business hours publicly — Whether hours appear on listing
- Show artist roster publicly — Whether artist list is visible
- Allow walk-in inquiries — Whether walk-in contact form is active

**Customer-specific toggles:**
- Show saved artists/studios on profile — Whether favorites are visible
- Show review history publicly — Whether past reviews are visible on profile

**Edge cases:**
- Toggling "Show profile in search results" OFF shows warning: "Your profile will no longer appear on Discover. Existing direct links and bookmarks will still work."
- For artists on Liner (free) tier: "Show profile in search results" is disabled with note: "Upgrade to Shader to appear on Discover"
- All toggles save immediately on change
- Group under labeled subsections: "Visibility" and "Communications"

---

## Section 7: Danger Zone

**Available to:** All roles

Visually separated: red-tinted border, preceded by a divider in the sidebar. Section background uses dashed border with subtle red tint.

### Deactivate Account
- **What it does:** Hides profile from all public views, pauses subscription billing, preserves all data
- **Reversible:** Yes — logging back in reactivates the account
- **Button:** `ink-outline` variant, not red. Text: "Deactivate Account"
- **Confirmation:** Dialog explaining what happens. Single "Deactivate" button to confirm.

### Delete Account
- **What it does:** Permanently removes profile, portfolio, and all associated data. Reviews are anonymized (per legal/privacy policy — text/rating remain, name/profile removed). Messages are deleted.
- **Irreversible:** Yes
- **Button:** `ink-red` variant. Text: "Delete Account"
- **Confirmation:** Multi-step:
  1. Dialog explaining consequences specific to role
  2. Must type "DELETE" in a text field to enable the confirm button
  3. Final "Permanently Delete" button (red)

### Role-Specific Warnings

**Studio with affiliated artists:**
- "You have [X] affiliated artists. They will be notified and their studio affiliation will be removed."
- Must acknowledge this before proceeding

**Artist with studio affiliation:**
- "Your studio ([Studio Name]) will be notified that you've left."

**User on paid plan:**
- "Your [Shader/Magnum] subscription will be cancelled immediately. No refund will be issued for the remaining billing period."

**Reviews:**
- "Your reviews will remain visible on artist and studio profiles but will no longer display your name or link to your profile."

---

## File Structure

```
app/settings/
  page.tsx                          # "use client", AuthGuard, renders SettingsPage
  layout.tsx                        # Metadata only (title, description)

components/settings/
  settings-shell.tsx                # DashboardLayout + PageHeader + sidebar/tabs + content area
  settings-sidebar.tsx              # Desktop sidebar nav component
  settings-tabs.tsx                 # Mobile horizontal scrollable tabs
  settings-section.tsx              # Shared section wrapper (title + description + children)

  # Section components:
  account-section.tsx               # Email, password, 2FA
  appearance-section.tsx            # Theme toggle
  notifications-section.tsx         # Role-specific notification toggles
  connected-accounts-section.tsx    # Social providers (artist/studio)
  plan-billing-section.tsx          # Full plan management
  privacy-section.tsx               # Role-specific privacy toggles
  danger-zone-section.tsx           # Deactivate + delete

  # Plan & Billing sub-components:
  plan-card.tsx                     # Current plan display card
  plan-comparison.tsx               # Side-by-side tier comparison table
  billing-cycle-toggle.tsx          # Monthly/Annual toggle with savings badge

  # Shared:
  confirmation-dialog.tsx           # Centered modal overlay with backdrop blur (not SlideOverPanel). Used for destructive actions: delete account, deactivate, cancel plan. Supports custom content slot for role-specific warnings and "type DELETE" input.

  # Hooks:
  use-settings-nav.ts              # Active section state, section list filtered by role
  use-account-section.ts           # Email/password change form state
  use-notifications.ts             # Notification preference toggles
  use-plan-billing.ts              # Plan state, upgrade/downgrade/cancel logic
  use-privacy.ts                   # Privacy toggle state

  index.tsx                         # Barrel export
```

---

## Reused Components

| Component | From | Usage |
|---|---|---|
| `DashboardLayout` | `components/dashboard/dashboard-layout.tsx` | Page wrapper with background/spacing |
| `PageHeader` | `components/ui/page-header.tsx` | "Your Settings" header |
| `Input` | `components/ui/input.tsx` | Email, password fields |
| `Button` | `components/ui/button.tsx` | Save, cancel, change, upgrade, delete actions |
| `ToggleSwitch` | `components/ui/toggle-switch.tsx` | All notification and privacy toggles |
| `ThemeToggle` | `components/ui/theme-toggle.tsx` | Appearance section |
| `SlideOverPanel` | `components/ui/slide-over-panel.tsx` | Potentially for plan comparison on mobile |

---

## Data & State

**Auth integration:** All settings read from and write to `useAuth().user` via `updateUser()`. No new storage mechanism needed — the auth provider already persists to localStorage.

**New fields on AuthUser** (to be added to auth-provider):
```typescript
// Notification preferences
notifications?: {
  marketing: boolean;
  platformUpdates: boolean;
  bookingRequests?: boolean;      // artist
  studioInvitations?: boolean;    // artist
  artistApplications?: boolean;   // studio
  bookingAlerts?: boolean;        // artist/studio
  reviewAlerts?: boolean;         // artist/studio
  savedArtistUpdates?: boolean;   // customer
  bookingConfirmations?: boolean; // customer
};

// Privacy preferences
privacy?: {
  showInSearch: boolean;
  allowMessages: boolean;
  showAvailability?: boolean;       // artist
  showAffiliation?: boolean;        // artist
  portfolioVisibility?: 'public' | 'followers'; // artist
  showBusinessHours?: boolean;      // studio
  showArtistRoster?: boolean;       // studio
  allowWalkIns?: boolean;           // studio
  showSavedItems?: boolean;         // customer
  showReviewHistory?: boolean;      // customer
};

// Billing (expand existing plan field)
billing?: {
  plan: 'liner' | 'shader' | 'magnum' | null;
  cycle: 'monthly' | 'annual';
  nextBillingDate?: string;         // ISO date
  cancelledAt?: string;             // ISO date if cancelled
  status: 'active' | 'cancelled' | 'draft'; // draft = studio freemium
};

// Connected accounts
connectedAccounts?: {
  instagram?: { handle: string; connectedAt: string };
  google?: { email: string; connectedAt: string };
  apple?: { email: string; connectedAt: string };
};
```

---

## Tier Data

Update `lib/data/signup-tiers.ts` with new naming:

**Artist Tiers:**
| | Liner | Shader |
|---|---|---|
| Price (monthly) | Free | $14.85/mo |
| Price (annual) | Free | $11.85/mo |
| Profile & gallery | Yes | Yes |
| Gallery on studio page | Yes | Yes |
| Public Discover listing | — | Yes |
| Independent artist profile | — | Yes |
| No studio required | — | Yes |

**Studio Tiers:**
| | Liner | Shader | Magnum |
|---|---|---|---|
| Price (monthly) | $19.85/mo | $59.85/mo | $79.85/mo |
| Price (annual) | $15.85/mo | $47.85/mo | $63.85/mo |
| Profile listing | Yes | Yes | Yes |
| Discover presence | Yes | Yes | Yes |
| Custom web page | — | Yes | Yes |
| Custom colors/fonts | — | Yes | Yes |
| Rearrange sections | — | — | Yes |
| Premium templates | — | — | Yes |
| Priority search | — | — | Yes |

---

## Verification

1. **Route:** Visit `/settings` — should show settings page with sidebar (desktop) or tabs (mobile)
2. **Auth guard:** Visit `/settings` while logged out — redirects to `/login`
3. **Role filtering:** Log in as customer — sidebar shows 5 sections (no Connected Accounts, no Plan & Billing). Log in as artist — shows all 7. Log in as studio — shows all 7.
4. **Account section:** Change email and password — persists to localStorage via `updateUser()`
5. **Appearance:** Toggle theme — applies immediately, persists
6. **Notifications:** Toggle each preference — saves immediately
7. **Plan & Billing (artist):** Shows current tier, plan comparison, upgrade/downgrade CTAs
8. **Plan & Billing (studio, no plan):** Shows draft state with "Choose a Plan" CTA
9. **Privacy:** Toggle each preference — saves immediately with warnings where specified
10. **Danger Zone:** Deactivate shows reversible dialog. Delete requires typing "DELETE" and shows role-specific warnings.
11. **Mobile:** All sections accessible via horizontal tabs, content renders correctly
12. **Navigation:** `/settings` link in nav dropdown works for all roles
13. **Build:** `npm run build` passes with no errors
