# Studio Third-Party Integrations Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Integration Hub in the studio dashboard where studios can link or connect third-party services (Google Business, Yelp, booking platforms, POS), with integration data displayed on the public studio profile.

**Architecture:** New `integrations` field on `StudioData` (merge-patch compatible), a static platform registry in `lib/data/`, dashboard UI as a SlideOverPanel with integration cards, and public profile enhancements for review badges and booking CTAs. All data flows through the existing `StudioProvider` optimistic-update pipeline.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4. No new dependencies. No test framework in the project.

**Spec:** `docs/superpowers/specs/2026-04-11-studio-third-party-integrations-design.md`

---

## File Structure

### New Files

```
lib/
  types/
    integrations.ts                           # Integration type definitions
  data/
    integration-platforms.ts                  # Platform registry + category metadata
  utils/
    integration-helpers.ts                    # URL validation, status helpers, merge helpers

components/
  dashboard/
    studio/
      studio-integrations-card.tsx            # Entry card on dashboard rightColumn
      studio-integrations-panel.tsx           # Hub panel (SlideOverPanel) with category groups
      studio-integration-row.tsx              # Individual integration row component
      studio-link-flow-panel.tsx              # Link URL input sub-panel
  detail/
    integration-badges.tsx                    # Google/Yelp rating badges for public profile
```

### Modified Files

```
lib/
  repositories/types.ts                       # Add integrations?: StudioIntegrations to StudioData
  types/index.ts                              # Add integrations? to Studio interface
  data/shops.ts                               # Add mock integrations to studio "1"

components/
  dashboard/
    studio/
      use-studio-dashboard.ts                 # Add integration state + handlers
      studio-dashboard.tsx                    # Wire in IntegrationsCard + panels
  detail/
    social-links.tsx                          # Accept optional integrations prop
    footer-cta.tsx                            # Accept optional bookingUrl prop
    index.tsx                                 # Barrel export new components

app/
  studios/[id]/page.tsx                       # Wire integration badges, booking CTA, social links
```

---

## Task 1: Integration Type Definitions

**Files:**
- Create: `lib/types/integrations.ts`

- [ ] **Step 1: Create the integration types file**

```typescript
// lib/types/integrations.ts

import type { TierSlug } from "@/lib/types";

// ─── Integration categories ─────────────────────────────────────────────────

export type IntegrationCategory = "business-profile" | "reviews" | "booking" | "pos";

// ─── Platform identifiers ───────────────────────────────────────────────────

export type BusinessProfilePlatform = "google-business" | "yelp" | "facebook";
export type ReviewPlatform = "google-reviews" | "yelp-reviews";
export type BookingPlatform =
  | "square"
  | "acuity"
  | "calendly"
  | "booksy"
  | "fresha"
  | "daysmart"
  | "vagaro"
  | "other-booking";
export type PosPlatform = "square-pos" | "clover" | "shopify-pos" | "sumup";

export type IntegrationPlatform =
  | BusinessProfilePlatform
  | ReviewPlatform
  | BookingPlatform
  | PosPlatform;

// ─── Connection states ──────────────────────────────────────────────────────

export type IntegrationStatus =
  | "not-connected"
  | "linked"      // URL pasted (all tiers)
  | "connected"   // OAuth complete (tier-gated, future)
  | "syncing"     // Data import in progress (future)
  | "error";      // Last sync or connection failed (future)

// ─── Per-integration record ─────────────────────────────────────────────────

export interface IntegrationRecord {
  status: IntegrationStatus;

  // Link mode
  linkUrl?: string;
  linkedAt?: string;

  // Connect mode (future OAuth)
  accountName?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;

  // Display data (rating badge, sync summary)
  displayRating?: number;
  displayReviewCount?: number;
  displayValue?: string;
}

// ─── Integrations map ───────────────────────────────────────────────────────

export type StudioIntegrations = Partial<Record<IntegrationPlatform, IntegrationRecord>>;

// ─── Platform metadata (static registry) ────────────────────────────────────

export interface IntegrationPlatformMeta {
  id: IntegrationPlatform;
  category: IntegrationCategory;
  name: string;
  description: string;
  urlPlaceholder: string;
  urlPattern: RegExp;
  /** Whether OAuth connect mode is supported (future). Link mode always works. */
  supportsConnect: boolean;
  /** Minimum tier for connect mode. null = link-only. */
  connectMinTier: TierSlug | null;
}

// ─── Category display metadata ──────────────────────────────────────────────

export interface IntegrationCategoryMeta {
  id: IntegrationCategory;
  label: string;
  description: string;
}

// ─── Tier gating ────────────────────────────────────────────────────────────

export type IntegrationFeature =
  | "link"
  | "google-autofill"
  | "review-badges"
  | "booking-connect"
  | "client-import"
  | "pos-connect";
```

- [ ] **Step 2: Commit**

```bash
git add lib/types/integrations.ts
git commit -m "feat: add integration type definitions"
```

---

## Task 2: Extend StudioData and Studio

**Files:**
- Modify: `lib/repositories/types.ts:28-59`
- Modify: `lib/types/index.ts:28-47`

- [ ] **Step 1: Add integrations field to StudioData**

In `lib/repositories/types.ts`, add the import at the top and the field at the end of the interface:

```typescript
// Add import at top of file (after line 1)
import type { StudioIntegrations } from "@/lib/types/integrations";
```

Add to the `StudioData` interface before the closing brace (after line 58, before `}`):

```typescript
  // Integrations
  integrations?: StudioIntegrations;
```

- [ ] **Step 2: Add integrations field to Studio type**

In `lib/types/index.ts`, add at the end of the `Studio` interface (after line 46, before `}`):

```typescript
  integrations?: {
    googleBusiness?: { profileUrl: string; rating: number; reviewCount: number };
    yelp?: { profileUrl: string; rating: number; reviewCount: number };
    booking?: { platform: string; bookingUrl: string; label?: string };
  };
```

Note: The `Studio` type in `index.ts` represents the public-facing entity (used by the detail page with mock data from `shops.ts`). The `StudioData` in `repositories/types.ts` is the dashboard persistence layer. They are separate types that will converge when the API launches.

- [ ] **Step 3: Commit**

```bash
git add lib/repositories/types.ts lib/types/index.ts
git commit -m "feat: extend StudioData and Studio with integrations field"
```

---

## Task 3: Platform Registry

**Files:**
- Create: `lib/data/integration-platforms.ts`

- [ ] **Step 1: Create the platform registry and category metadata**

```typescript
// lib/data/integration-platforms.ts

import type {
  IntegrationPlatformMeta,
  IntegrationCategoryMeta,
  IntegrationCategory,
  IntegrationPlatform,
} from "@/lib/types/integrations";

export const INTEGRATION_CATEGORIES: IntegrationCategoryMeta[] = [
  { id: "business-profile", label: "Business Profile", description: "Claim and link your business listings" },
  { id: "reviews", label: "Reviews", description: "Display ratings and reviews from external platforms" },
  { id: "booking", label: "Booking", description: "Connect your scheduling platform" },
  { id: "pos", label: "Point of Sale", description: "Sync your POS for client and transaction data" },
];

export const INTEGRATION_PLATFORMS: IntegrationPlatformMeta[] = [
  // ── Business Profile ────────────────────────────────────────────────
  {
    id: "google-business",
    category: "business-profile",
    name: "Google Business",
    description: "Auto-fill studio info from your Google listing",
    urlPlaceholder: "https://g.co/maps/your-studio",
    urlPattern: /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|g\.co|goo\.gl|maps\.app\.goo\.gl)\/.+/i,
    supportsConnect: true,
    connectMinTier: "liner",
  },
  {
    id: "yelp",
    category: "business-profile",
    name: "Yelp",
    description: "Link your Yelp listing to show rating",
    urlPlaceholder: "https://www.yelp.com/biz/your-studio",
    urlPattern: /^https?:\/\/(www\.)?yelp\.com\/biz\/.+/i,
    supportsConnect: false,
    connectMinTier: null,
  },
  {
    id: "facebook",
    category: "business-profile",
    name: "Facebook",
    description: "Link your Facebook business page",
    urlPlaceholder: "https://www.facebook.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/i,
    supportsConnect: false,
    connectMinTier: null,
  },
  // ── Reviews ─────────────────────────────────────────────────────────
  {
    id: "google-reviews",
    category: "reviews",
    name: "Google Reviews",
    description: "Display your Google rating and review count",
    urlPlaceholder: "https://g.co/maps/your-studio",
    urlPattern: /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|g\.co|goo\.gl|maps\.app\.goo\.gl)\/.+/i,
    supportsConnect: true,
    connectMinTier: "liner",
  },
  {
    id: "yelp-reviews",
    category: "reviews",
    name: "Yelp Reviews",
    description: "Display your Yelp rating badge",
    urlPlaceholder: "https://www.yelp.com/biz/your-studio",
    urlPattern: /^https?:\/\/(www\.)?yelp\.com\/biz\/.+/i,
    supportsConnect: false,
    connectMinTier: null,
  },
  // ── Booking ─────────────────────────────────────────────────────────
  {
    id: "square",
    category: "booking",
    name: "Square Appointments",
    description: "Sync your Square booking calendar",
    urlPlaceholder: "https://squareup.com/appointments/your-studio",
    urlPattern: /^https?:\/\/(www\.)?(squareup\.com|square\.site)\/.+/i,
    supportsConnect: true,
    connectMinTier: "shader",
  },
  {
    id: "acuity",
    category: "booking",
    name: "Acuity Scheduling",
    description: "Link your Acuity booking page",
    urlPlaceholder: "https://your-studio.acuityscheduling.com",
    urlPattern: /^https?:\/\/[\w-]+\.acuityscheduling\.com/i,
    supportsConnect: true,
    connectMinTier: "shader",
  },
  {
    id: "calendly",
    category: "booking",
    name: "Calendly",
    description: "Link your Calendly booking page",
    urlPlaceholder: "https://calendly.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?calendly\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "shader",
  },
  {
    id: "booksy",
    category: "booking",
    name: "Booksy",
    description: "Link your Booksy profile",
    urlPlaceholder: "https://booksy.com/en-us/your-studio",
    urlPattern: /^https?:\/\/(www\.)?booksy\.com\/.+/i,
    supportsConnect: false,
    connectMinTier: null,
  },
  {
    id: "fresha",
    category: "booking",
    name: "Fresha",
    description: "Link your Fresha booking page",
    urlPlaceholder: "https://www.fresha.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?fresha\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "shader",
  },
  {
    id: "daysmart",
    category: "booking",
    name: "DaySmart",
    description: "Link your DaySmart booking",
    urlPlaceholder: "https://www.daysmart.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?daysmart(salon|body)?\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "shader",
  },
  {
    id: "vagaro",
    category: "booking",
    name: "Vagaro",
    description: "Link your Vagaro booking page",
    urlPlaceholder: "https://www.vagaro.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?vagaro\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "shader",
  },
  {
    id: "other-booking",
    category: "booking",
    name: "Other Booking",
    description: "Paste any booking URL",
    urlPlaceholder: "https://your-booking-page.com",
    urlPattern: /^https?:\/\/.+/i,
    supportsConnect: false,
    connectMinTier: null,
  },
  // ── POS ─────────────────────────────────────────────────────────────
  {
    id: "square-pos",
    category: "pos",
    name: "Square POS",
    description: "Connect your Square point-of-sale",
    urlPlaceholder: "https://squareup.com/dashboard",
    urlPattern: /^https?:\/\/(www\.)?squareup\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "magnum",
  },
  {
    id: "clover",
    category: "pos",
    name: "Clover",
    description: "Connect your Clover POS system",
    urlPlaceholder: "https://www.clover.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?clover\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "magnum",
  },
  {
    id: "shopify-pos",
    category: "pos",
    name: "Shopify POS",
    description: "Connect your Shopify point-of-sale",
    urlPlaceholder: "https://your-studio.myshopify.com",
    urlPattern: /^https?:\/\/[\w-]+\.myshopify\.com/i,
    supportsConnect: true,
    connectMinTier: "magnum",
  },
  {
    id: "sumup",
    category: "pos",
    name: "SumUp",
    description: "Connect your SumUp POS",
    urlPlaceholder: "https://www.sumup.com/your-studio",
    urlPattern: /^https?:\/\/(www\.)?sumup\.com\/.+/i,
    supportsConnect: true,
    connectMinTier: "magnum",
  },
];

export function getPlatformMeta(id: IntegrationPlatform): IntegrationPlatformMeta | undefined {
  return INTEGRATION_PLATFORMS.find((p) => p.id === id);
}

export function getPlatformsByCategory(category: IntegrationCategory): IntegrationPlatformMeta[] {
  return INTEGRATION_PLATFORMS.filter((p) => p.category === category);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/data/integration-platforms.ts
git commit -m "feat: add integration platform registry and category metadata"
```

---

## Task 4: Integration Utility Helpers

**Files:**
- Create: `lib/utils/integration-helpers.ts`

- [ ] **Step 1: Create utility functions for URL validation, status checks, and merge helpers**

```typescript
// lib/utils/integration-helpers.ts

import type {
  IntegrationPlatform,
  IntegrationRecord,
  IntegrationStatus,
  StudioIntegrations,
  IntegrationFeature,
} from "@/lib/types/integrations";
import type { TierSlug } from "@/lib/types";
import { getPlatformMeta } from "@/lib/data/integration-platforms";

// ─── Tier gating ────────────────────────────────────────────────────────────

const TIER_ORDER: Record<TierSlug, number> = { liner: 0, shader: 1, magnum: 2 };

const FEATURE_MIN_TIER: Record<IntegrationFeature, TierSlug> = {
  "link": "liner",
  "google-autofill": "liner",
  "review-badges": "liner",
  "booking-connect": "shader",
  "client-import": "magnum",
  "pos-connect": "magnum",
};

export function tierMeetsRequirement(userTier: TierSlug | null, required: TierSlug): boolean {
  if (!userTier) return false;
  return TIER_ORDER[userTier] >= TIER_ORDER[required];
}

export function isFeatureAvailable(userTier: TierSlug | null, feature: IntegrationFeature): boolean {
  return tierMeetsRequirement(userTier, FEATURE_MIN_TIER[feature]);
}

// ─── URL validation ─────────────────────────────────────────────────────────

export function isValidIntegrationUrl(platform: IntegrationPlatform, url: string): boolean {
  const meta = getPlatformMeta(platform);
  if (!meta) return false;
  try {
    new URL(url);
    return meta.urlPattern.test(url);
  } catch {
    return false;
  }
}

// ─── Status helpers ─────────────────────────────────────────────────────────

export function getIntegrationRecord(
  integrations: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
): IntegrationRecord {
  return integrations?.[platform] ?? { status: "not-connected" };
}

export function isIntegrationActive(record: IntegrationRecord): boolean {
  return record.status === "linked" || record.status === "connected" || record.status === "syncing";
}

export function countActiveIntegrations(integrations: StudioIntegrations | undefined): number {
  if (!integrations) return 0;
  return Object.values(integrations).filter((r) => r && isIntegrationActive(r)).length;
}

// ─── Merge helpers for optimistic updates ───────────────────────────────────

export function makeIntegrationUpdate(
  current: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
  record: IntegrationRecord,
): { integrations: StudioIntegrations } {
  return {
    integrations: { ...(current ?? {}), [platform]: record },
  };
}

export function createLinkRecord(url: string): IntegrationRecord {
  return {
    status: "linked",
    linkUrl: url,
    linkedAt: new Date().toISOString(),
  };
}

export function removeIntegration(
  current: StudioIntegrations | undefined,
  platform: IntegrationPlatform,
): { integrations: StudioIntegrations } {
  const next = { ...(current ?? {}) };
  delete next[platform];
  return { integrations: next };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils/integration-helpers.ts
git commit -m "feat: add integration utility helpers"
```

---

## Task 5: Integration Row Component

**Files:**
- Create: `components/dashboard/studio/studio-integration-row.tsx`

- [ ] **Step 1: Create the reusable integration row component**

This follows the `ProviderCard` pattern from `connected-accounts-section.tsx` and `ServiceRow` from `studio-services-card.tsx`.

```typescript
// components/dashboard/studio/studio-integration-row.tsx

"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { IntegrationPlatformMeta, IntegrationRecord } from "@/lib/types/integrations";

interface StudioIntegrationRowProps {
  platform: IntegrationPlatformMeta;
  record: IntegrationRecord;
  locked: boolean;
  lockedTierLabel?: string;
  onLink: () => void;
  onUnlink: () => void;
}

export function StudioIntegrationRow({
  platform,
  record,
  locked,
  lockedTierLabel,
  onLink,
  onUnlink,
}: StudioIntegrationRowProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        locked && "opacity-40 pointer-events-none"
      )}
    >
      {/* Left: name + description */}
      <div className="flex-1 min-w-0 mr-3">
        <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
          {platform.name}
        </p>
        <p className={cn("text-[10px]", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
          {platform.description}
        </p>
        {record.status === "linked" && record.linkUrl && (
          <p className={cn("text-[9px] truncate max-w-[220px] mt-0.5", isDark ? "text-ink-sage/50" : "text-ink-sage/70")}>
            {record.linkUrl}
          </p>
        )}
      </div>

      {/* Right: action / status */}
      <div className="flex items-center gap-2 shrink-0">
        {locked && lockedTierLabel && (
          <StatusBadge label={lockedTierLabel} color={BADGE_COLORS.muted} />
        )}

        {!locked && record.status === "not-connected" && (
          <Button
            variant={isDark ? "ink-light-outline" : "ink-outline"}
            size="sm"
            onClick={onLink}
            className="text-[10px] h-7 px-3"
          >
            Link
          </Button>
        )}

        {!locked && record.status === "linked" && (
          <>
            <StatusBadge label="Linked" color={BADGE_COLORS.sage} />
            <button
              type="button"
              onClick={onUnlink}
              className={cn(
                "font-mono text-[8px] tracking-[0.1em] uppercase transition-colors cursor-pointer",
                isDark ? "text-ink-cream/20 hover:text-ink-red" : "text-ink-black/20 hover:text-ink-rust"
              )}
            >
              Unlink
            </button>
          </>
        )}

        {!locked && record.status === "connected" && (
          <StatusBadge label="Connected" color={BADGE_COLORS.sage} />
        )}

        {!locked && record.status === "syncing" && (
          <StatusBadge label="Syncing" color={BADGE_COLORS.rust} />
        )}

        {!locked && record.status === "error" && (
          <StatusBadge label="Error" color={BADGE_COLORS.red} />
        )}

        {!locked && record.status === "not-connected" && platform.supportsConnect && (
          <span className={cn(
            "font-mono text-[8px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md",
            isDark ? "bg-ink-cream/[0.04] text-ink-cream/20" : "bg-ink-black/[0.04] text-ink-black/20"
          )}>
            Connect Soon
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/studio/studio-integration-row.tsx
git commit -m "feat: add StudioIntegrationRow component"
```

---

## Task 6: Link Flow Panel

**Files:**
- Create: `components/dashboard/studio/studio-link-flow-panel.tsx`

- [ ] **Step 1: Create the link URL input sub-panel**

```typescript
// components/dashboard/studio/studio-link-flow-panel.tsx

"use client";

import { useState, useEffect } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { isValidIntegrationUrl } from "@/lib/utils/integration-helpers";
import type { IntegrationPlatformMeta } from "@/lib/types/integrations";

interface StudioLinkFlowPanelProps {
  open: boolean;
  onClose: () => void;
  platform: IntegrationPlatformMeta | null;
  onSave: (url: string) => void;
}

export function StudioLinkFlowPanel({ open, onClose, platform, onSave }: StudioLinkFlowPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  // Reset form when platform changes or panel opens
  useEffect(() => {
    if (open) {
      setUrl("");
      setError("");
    }
  }, [open, platform?.id]);

  function handleSave() {
    if (!platform) return;
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (!isValidIntegrationUrl(platform.id, url.trim())) {
      setError(`Please enter a valid ${platform.name} URL`);
      return;
    }
    setError("");
    onSave(url.trim());
  }

  return (
    <SlideOverPanel open={open} onClose={onClose} title={platform ? `Link ${platform.name}` : "Link Service"}>
      {platform && (
        <div className="space-y-6">
          {/* Platform info */}
          <div>
            <p className={cn("text-[15px] font-semibold mb-1", isDark ? "text-ink-cream" : "text-ink-black")}>
              {platform.name}
            </p>
            <p className={cn("text-[12px]", isDark ? "text-ink-cream/40" : "text-ink-black/40")}>
              {platform.description}
            </p>
          </div>

          {/* URL input */}
          <div>
            <Input
              label="URL"
              variant={isDark ? "dark" : "light"}
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder={platform.urlPlaceholder}
            />
            {error ? (
              <p className="text-[10px] text-ink-red mt-1.5 px-1">{error}</p>
            ) : (
              <p className={cn("text-[10px] mt-1.5 px-1", isDark ? "text-ink-cream/20" : "text-ink-black/20")}>
                Paste your {platform.name} page URL
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Button variant="ink" size="lg" className="w-full" onClick={handleSave}>
              Save Link
            </Button>
            <Button variant={isDark ? "ink-light-outline" : "ink-outline"} size="lg" className="w-full" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </SlideOverPanel>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/studio/studio-link-flow-panel.tsx
git commit -m "feat: add StudioLinkFlowPanel component"
```

---

## Task 7: Integrations Hub Panel

**Files:**
- Create: `components/dashboard/studio/studio-integrations-panel.tsx`

- [ ] **Step 1: Create the main integrations hub panel**

```typescript
// components/dashboard/studio/studio-integrations-panel.tsx

"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { SectionLabel } from "@/components/ui/section-label";
import { StudioIntegrationRow } from "./studio-integration-row";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import {
  getIntegrationRecord,
  tierMeetsRequirement,
} from "@/lib/utils/integration-helpers";
import {
  INTEGRATION_CATEGORIES,
  getPlatformsByCategory,
} from "@/lib/data/integration-platforms";
import type { StudioIntegrations, IntegrationPlatform } from "@/lib/types/integrations";
import type { TierSlug } from "@/lib/types";

interface StudioIntegrationsPanelProps {
  open: boolean;
  onClose: () => void;
  integrations: StudioIntegrations | undefined;
  currentTier: TierSlug | null;
  onLink: (platformId: IntegrationPlatform) => void;
  onUnlink: (platformId: IntegrationPlatform) => void;
}

export function StudioIntegrationsPanel({
  open,
  onClose,
  integrations,
  currentTier,
  onLink,
  onUnlink,
}: StudioIntegrationsPanelProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Integrations">
      <div className="space-y-8">
        {INTEGRATION_CATEGORIES.map((category) => {
          const platforms = getPlatformsByCategory(category.id);
          if (platforms.length === 0) return null;

          return (
            <div key={category.id}>
              <SectionLabel
                label={category.label}
                variant={isDark ? "dark-muted" : "parchment"}
                stretch
                className="mb-1"
              />
              <p className={cn(
                "text-[10px] mb-3",
                isDark ? "text-ink-cream/20" : "text-ink-black/20"
              )}>
                {category.description}
              </p>
              <div className={cn(
                "rounded-[16px] border divide-y overflow-hidden",
                isDark
                  ? "border-ink-cream/[0.06] bg-ink-cream/[0.02] divide-ink-cream/[0.04]"
                  : "border-ink-black/[0.06] bg-ink-black/[0.02] divide-ink-black/[0.04]"
              )}>
                {platforms.map((platform) => {
                  const record = getIntegrationRecord(integrations, platform.id);
                  const connectTier = platform.connectMinTier;
                  // Link mode is always available (all tiers). Lock only if
                  // the platform has NO link mode and connect requires higher tier.
                  // For now, all platforms support link mode, so locked = false for link.
                  // The "Connect Soon" badge handles gating for OAuth features.
                  const locked = false;

                  return (
                    <div key={platform.id} className="px-4">
                      <StudioIntegrationRow
                        platform={platform}
                        record={record}
                        locked={locked}
                        onLink={() => onLink(platform.id)}
                        onUnlink={() => onUnlink(platform.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SlideOverPanel>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/studio/studio-integrations-panel.tsx
git commit -m "feat: add StudioIntegrationsPanel hub component"
```

---

## Task 8: Integrations Dashboard Card

**Files:**
- Create: `components/dashboard/studio/studio-integrations-card.tsx`

- [ ] **Step 1: Create the entry card for the dashboard rightColumn**

```typescript
// components/dashboard/studio/studio-integrations-card.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { INTEGRATION_PLATFORMS } from "@/lib/data/integration-platforms";

interface StudioIntegrationsCardProps {
  connectedCount: number;
  onOpen: () => void;
}

export function StudioIntegrationsCard({ connectedCount, onOpen }: StudioIntegrationsCardProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const totalCount = INTEGRATION_PLATFORMS.length;

  return (
    <div className="mb-6">
      <h3 className={cn(
        "font-mono text-[9px] tracking-[0.2em] uppercase mb-2.5",
        isDark ? "text-ink-cream/35" : "text-ink-black/35"
      )}>
        Integrations
      </h3>

      <div className={cn(
        "rounded-[20px] border p-5",
        isDark ? "bg-ink-cream/[0.02] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]"
      )}>
        {/* Icon */}
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center mb-3 border",
          isDark ? "bg-ink-sage/[0.06] border-ink-sage/[0.1]" : "bg-ink-sage/[0.06] border-ink-sage/[0.1]"
        )}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-ink-sage">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>

        {/* Count */}
        <p className={cn("text-[13px] font-medium mb-0.5", isDark ? "text-ink-cream/70" : "text-ink-black/70")}>
          {connectedCount > 0 ? `${connectedCount} linked` : "No services linked"}
        </p>
        <p className={cn("text-[10px] mb-4", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
          {connectedCount > 0
            ? `${connectedCount} of ${totalCount} available integrations`
            : "Connect Google, Yelp, booking tools, and more"
          }
        </p>

        {/* Progress bar */}
        <div className={cn("w-full h-1 rounded-full mb-4", isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]")}>
          <div
            className="h-full rounded-full bg-ink-sage/60 transition-all duration-500"
            style={{ width: `${Math.min((connectedCount / totalCount) * 100, 100)}%` }}
          />
        </div>

        <Button
          variant={isDark ? "ink-light-outline" : "ink-outline"}
          size="sm"
          className="w-full"
          onClick={onOpen}
        >
          Manage Integrations
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/studio/studio-integrations-card.tsx
git commit -m "feat: add StudioIntegrationsCard dashboard entry point"
```

---

## Task 9: Wire Integration State Into Dashboard Hook

**Files:**
- Modify: `components/dashboard/studio/use-studio-dashboard.ts`

- [ ] **Step 1: Add integration state and handlers to useStudioDashboard**

At the top of `use-studio-dashboard.ts`, add imports:

```typescript
import { useMemo } from "react";
import {
  countActiveIntegrations,
  makeIntegrationUpdate,
  createLinkRecord,
  removeIntegration,
} from "@/lib/utils/integration-helpers";
import { getPlatformMeta } from "@/lib/data/integration-platforms";
import type { IntegrationPlatform, IntegrationPlatformMeta } from "@/lib/types/integrations";
```

Update the existing `useState`/`useEffect`/`useRef` import line to include `useMemo`.

After the existing artist management state (after line 78), add:

```typescript
  // ── Integration state ──────────────────────────────────────────────
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [linkFlowOpen, setLinkFlowOpen] = useState(false);
  const [linkFlowPlatform, setLinkFlowPlatform] = useState<IntegrationPlatformMeta | null>(null);

  const connectedCount = countActiveIntegrations(studio?.integrations);

  const handleOpenLinkFlow = (platformId: IntegrationPlatform) => {
    const meta = getPlatformMeta(platformId);
    if (!meta) return;
    setLinkFlowPlatform(meta);
    setLinkFlowOpen(true);
  };

  const handleSaveLink = (url: string) => {
    if (!linkFlowPlatform) return;
    update(makeIntegrationUpdate(studio?.integrations, linkFlowPlatform.id, createLinkRecord(url)));
    setLinkFlowOpen(false);
    setLinkFlowPlatform(null);
  };

  const handleUnlink = (platformId: IntegrationPlatform) => {
    update(removeIntegration(studio?.integrations, platformId));
  };
```

Add to the return object (after the existing artist management returns):

```typescript
    // Integrations
    integrationsOpen,
    setIntegrationsOpen,
    linkFlowOpen,
    setLinkFlowOpen,
    linkFlowPlatform,
    connectedCount,
    handleOpenLinkFlow,
    handleSaveLink,
    handleUnlink,
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/studio/use-studio-dashboard.ts
git commit -m "feat: add integration state and handlers to useStudioDashboard"
```

---

## Task 10: Wire Components Into Studio Dashboard

**Files:**
- Modify: `components/dashboard/studio/studio-dashboard.tsx`

- [ ] **Step 1: Add imports for the new components**

After the existing imports (after line 16), add:

```typescript
import { StudioIntegrationsCard } from "./studio-integrations-card";
import { StudioIntegrationsPanel } from "./studio-integrations-panel";
import { StudioLinkFlowPanel } from "./studio-link-flow-panel";
```

- [ ] **Step 2: Add IntegrationsCard to the rightColumn**

In the `rightColumn` prop of `DashboardShell`, insert `StudioIntegrationsCard` between `StudioArtistsSection` and `QuickActionsGrid` (between lines 94 and 95):

```tsx
            <StudioIntegrationsCard
              connectedCount={dashboard.connectedCount}
              onOpen={() => dashboard.setIntegrationsOpen(true)}
            />
```

- [ ] **Step 3: Add integration panels to the panels slot**

In the `panels` prop, after the existing `StudioBusinessHoursPanel` (after line 133), add:

```tsx
            <StudioIntegrationsPanel
              open={dashboard.integrationsOpen}
              onClose={() => dashboard.setIntegrationsOpen(false)}
              integrations={dashboard.studio?.integrations}
              currentTier={(dashboard.user?.billing?.plan as TierSlug) ?? null}
              onLink={dashboard.handleOpenLinkFlow}
              onUnlink={dashboard.handleUnlink}
            />
            <StudioLinkFlowPanel
              open={dashboard.linkFlowOpen}
              onClose={() => { dashboard.setLinkFlowOpen(false); }}
              platform={dashboard.linkFlowPlatform}
              onSave={dashboard.handleSaveLink}
            />
```

Add the necessary type import at the top:

```typescript
import type { TierSlug } from "@/lib/types";
```

Also, expose `studio` from the dashboard hook. In `use-studio-dashboard.ts`, add `studio` to the return object (after `user,` on line 198):

```typescript
    studio,
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/studio/studio-dashboard.tsx components/dashboard/studio/use-studio-dashboard.ts
git commit -m "feat: wire integration hub into studio dashboard"
```

---

## Task 11: Integration Badges for Public Profile

**Files:**
- Create: `components/detail/integration-badges.tsx`

- [ ] **Step 1: Create the Google/Yelp review badges component**

```typescript
// components/detail/integration-badges.tsx

import React from "react";
import { cn } from "@/lib/utils";

interface IntegrationBadgesProps {
  googleBusiness?: { profileUrl: string; rating: number; reviewCount: number };
  yelp?: { profileUrl: string; rating: number; reviewCount: number };
  className?: string;
}

const IntegrationBadges = React.forwardRef<HTMLDivElement, IntegrationBadgesProps>(
  ({ googleBusiness, yelp, className }, ref) => {
    if (!googleBusiness && !yelp) return null;

    const badgeClass = "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] hover:bg-ink-cream/[0.06] hover:border-ink-cream/10 transition-all duration-300 group";

    return (
      <div ref={ref} className={cn("mt-4", className)}>
        <div className="flex flex-wrap gap-2">
          {googleBusiness && (
            <a href={googleBusiness.profileUrl} target="_blank" rel="noopener noreferrer" className={badgeClass}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] tracking-[0.05em] text-ink-cream/70 group-hover:text-ink-cream/90 transition-colors">
                  {googleBusiness.rating.toFixed(1)}/5
                </span>
                <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-ink-cream/30">
                  {googleBusiness.reviewCount} reviews
                </span>
              </div>
            </a>
          )}
          {yelp && (
            <a href={yelp.profileUrl} target="_blank" rel="noopener noreferrer" className={badgeClass}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#FF1A1A">
                <path d="M20.16 12.73c-.16-.24-.46-.3-.46-.3l-3.1-1.23c-.37-.14-.62.04-.68.12-.06.08-.16.26.02.6l1.47 2.93s.1.2.34.24c.26.06.54-.08.7-.26.53-.56.82-1.16.82-1.16.16-.3-.02-.7-.11-.94zM14.5 15.8s-.06-.3-.28-.42c-.22-.12-.5-.02-.5-.02l-2.96 1.42c-.36.18-.38.52-.34.64.04.12.12.34.34.46.72.38 1.42.5 1.42.5.34.06.7-.16.82-.38l.6-1.38s.06-.3-.1-.82zM12.76 13.4c.16-.14.14-.48.14-.48l-.38-3.3c-.04-.4-.34-.5-.46-.52-.12-.02-.38-.06-.58.1-.66.52-1.06 1.12-1.06 1.12-.18.28-.04.66.08.82l2.04 2.48s.06.06.22-.22zM13.08 10.56c.26.06.44-.16.44-.16l2.18-2.44c.24-.28.08-.56 0-.66-.08-.1-.24-.28-.48-.34-.82-.2-1.54-.08-1.54-.08-.36.04-.56.4-.58.58l-.28 2.82s-.02.24.26.28zM10.16 13.08s.22.14.46.06c.24-.08.3-.34.3-.34l.58-3.28c.06-.4-.2-.58-.3-.62-.1-.06-.32-.14-.56-.04-.78.32-1.3.82-1.3.82-.28.22-.2.62-.1.8l1.28 2.66s-.22-.36-.36-.06z" />
              </svg>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] tracking-[0.05em] text-ink-cream/70 group-hover:text-ink-cream/90 transition-colors">
                  {yelp.rating.toFixed(1)}/5
                </span>
                <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-ink-cream/30">
                  {yelp.reviewCount} reviews
                </span>
              </div>
            </a>
          )}
        </div>
        {/* Attribution (Google TOS + Yelp TOS) */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {googleBusiness && (
            <span className="font-mono text-[7px] tracking-[0.15em] uppercase text-ink-cream/15">
              Powered by Google
            </span>
          )}
          {yelp && (
            <a href={yelp.profileUrl} target="_blank" rel="noopener noreferrer"
               className="font-mono text-[7px] tracking-[0.15em] uppercase text-ink-cream/15 hover:text-ink-cream/30 transition-colors">
              View on Yelp
            </a>
          )}
        </div>
      </div>
    );
  }
);
IntegrationBadges.displayName = "IntegrationBadges";

export { IntegrationBadges };
```

- [ ] **Step 2: Add barrel export**

In `components/detail/index.tsx`, add:

```typescript
export { IntegrationBadges } from "./integration-badges";
```

- [ ] **Step 3: Commit**

```bash
git add components/detail/integration-badges.tsx components/detail/index.tsx
git commit -m "feat: add IntegrationBadges component for public studio profile"
```

---

## Task 12: Extend SocialLinks for Integration Links

**Files:**
- Modify: `components/detail/social-links.tsx`

- [ ] **Step 1: Add optional integrations prop and render additional links**

Update the interface to accept integrations:

```typescript
import type { SocialLinks as SocialLinksType } from "@/lib/types";

interface SocialLinksProps {
  links: SocialLinksType;
  integrations?: {
    googleBusiness?: { profileUrl: string };
    yelp?: { profileUrl: string };
    booking?: { bookingUrl: string; label?: string };
  };
}
```

Update the forwardRef to accept the new prop:

```typescript
const SocialLinks = React.forwardRef<HTMLDivElement, SocialLinksProps>(
  ({ links, integrations }, ref) => (
```

After the existing `links.website` block (after line 39, before `</div>`), add:

```tsx
      {integrations?.googleBusiness && (
        <a
          href={integrations.googleBusiness.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◉ Google
        </a>
      )}
      {integrations?.yelp && (
        <a
          href={integrations.yelp.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◉ Yelp
        </a>
      )}
      {integrations?.booking && (
        <a
          href={integrations.booking.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◎ {integrations.booking.label ?? "Book Online"}
        </a>
      )}
```

- [ ] **Step 2: Commit**

```bash
git add components/detail/social-links.tsx
git commit -m "feat: extend SocialLinks to display integration links"
```

---

## Task 13: Extend FooterCta With Booking URL

**Files:**
- Modify: `components/detail/footer-cta.tsx`

- [ ] **Step 1: Add optional bookingUrl prop**

Update the `FooterCtaProps` interface (add after line 10):

```typescript
  bookingUrl?: string;
```

Update the forwardRef destructuring to include `bookingUrl`:

```typescript
  ({ heading, subtitle, buttonLabel, headingFont, bookingUrl, className }, ref) => (
```

Replace the Button on line 34 with a conditional:

```tsx
      {bookingUrl ? (
        <Button as="a" href={bookingUrl} target="_blank" rel="noopener noreferrer"
          variant="ink-red" size="md" statusDot="bg-ink-cream shadow-ink-cream-glow" className="relative z-10 mx-auto">
          {buttonLabel}
        </Button>
      ) : (
        <Button variant="ink-red" size="md" statusDot="bg-ink-cream shadow-ink-cream-glow" className="relative z-10 mx-auto">
          {buttonLabel}
        </Button>
      )}
```

- [ ] **Step 2: Commit**

```bash
git add components/detail/footer-cta.tsx
git commit -m "feat: extend FooterCta with optional bookingUrl"
```

---

## Task 14: Add Mock Integration Data

**Files:**
- Modify: `lib/types/index.ts`
- Modify: `lib/data/shops.ts`

- [ ] **Step 1: Add mock integrations to studio "1" in shops.ts**

After the `socialLinks` property of studio `"1"` (after line 71), add:

```typescript
    integrations: {
      googleBusiness: {
        profileUrl: "https://maps.google.com/?cid=12345",
        rating: 4.8,
        reviewCount: 312,
      },
      yelp: {
        profileUrl: "https://www.yelp.com/biz/ink-paradise-studio-los-angeles",
        rating: 4.5,
        reviewCount: 87,
      },
      booking: {
        platform: "Porter",
        bookingUrl: "https://porter.ink/inkparadise/book",
        label: "Book on Porter",
      },
    },
```

Leave studio `"2"` without integrations to test the graceful fallback (no integration UI renders).

- [ ] **Step 2: Commit**

```bash
git add lib/data/shops.ts
git commit -m "feat: add mock integration data to studio 1"
```

---

## Task 15: Wire Integration UI Into Public Studio Page

**Files:**
- Modify: `app/studios/[id]/page.tsx`

- [ ] **Step 1: Add IntegrationBadges import**

Update the barrel import from `@/components/detail` (line 8-24) to include `IntegrationBadges`:

```typescript
import {
  DetailHero,
  ReviewPanel,
  SocialLinks,
  FooterCta,
  ImageGallery,
  VerifiedBadge,
  WidgetPanel,
  WidgetLabel,
  WidgetHeading,
  IssueLabel,
  SplitName,
  BioQuote,
  MetaRow,
  MetaItem,
  MetaHighlight,
  IntegrationBadges,
} from "@/components/detail";
```

- [ ] **Step 2: Update the hero "Book Appointment" button (lines 97-99)**

Replace the static Book button with a conditional that links out when booking integration exists:

```tsx
          {studio.integrations?.booking ? (
            <Button as="a" href={studio.integrations.booking.bookingUrl}
              target="_blank" rel="noopener noreferrer"
              variant="ink-red" size="sm" statusDot="bg-ink-cream shadow-ink-cream-glow">
              {studio.integrations.booking.label ?? "Book Appointment"}
            </Button>
          ) : (
            <Button variant="ink-red" size="sm" statusDot="bg-ink-cream shadow-ink-cream-glow">
              Book Appointment
            </Button>
          )}
```

- [ ] **Step 3: Add IntegrationBadges below ReviewPanel (around line 130-134)**

Wrap the ReviewPanel in a div and add badges below:

```tsx
          <div>
            <ReviewPanel
              reviews={reviews}
              rating={studio.rating}
              headingFont={bebasNeue.className}
            />
            {studio.integrations && (
              <IntegrationBadges
                googleBusiness={studio.integrations.googleBusiness}
                yelp={studio.integrations.yelp}
              />
            )}
          </div>
```

- [ ] **Step 4: Pass integrations to SocialLinks (line 217)**

Replace:
```tsx
              <SocialLinks links={studio.socialLinks} />
```
With:
```tsx
              <SocialLinks links={studio.socialLinks} integrations={studio.integrations} />
```

- [ ] **Step 5: Pass bookingUrl to FooterCta (lines 224-229)**

Replace the FooterCta call with:

```tsx
      <FooterCta
        heading={`Visit ${studio.name.split(" ")[0]}?`}
        subtitle={`${studio.location.address}, ${studio.location.city} · Walk-ins welcome`}
        buttonLabel={studio.integrations?.booking?.label ?? "Book an Appointment"}
        bookingUrl={studio.integrations?.booking?.bookingUrl}
        headingFont={bebasNeue.className}
      />
```

- [ ] **Step 6: Commit**

```bash
git add app/studios/[id]/page.tsx
git commit -m "feat: wire integration badges and booking CTA into studio page"
```

---

## Task 16: Verification

- [ ] **Step 1: Run the linter to catch type errors**

```bash
npm run lint
```

Expected: No errors. Fix any TypeScript or import issues.

- [ ] **Step 2: Run the build to verify everything compiles**

```bash
npm run build
```

Expected: Successful build with no type errors.

- [ ] **Step 3: Visual QA checklist (manual, in browser)**

Start dev server and verify:

1. **Dashboard** (`/dashboard` as studio user):
   - [ ] Integrations card appears in right column between Artists section and Quick Actions
   - [ ] Card shows "No services linked" with empty state
   - [ ] Clicking "Manage Integrations" opens the SlideOverPanel
   - [ ] Panel shows all 4 categories with section headers
   - [ ] Each integration shows name, description, and "Link" button
   - [ ] OAuth-only integrations show "Connect Soon" badge
   - [ ] Clicking "Link" on any integration opens the link flow sub-panel
   - [ ] Entering a valid URL and clicking Save updates the row to "Linked" with green badge
   - [ ] Clicking "Unlink" removes the link and resets to "not-connected"
   - [ ] The integrations card count updates when links are added/removed
   - [ ] Both panels work in dark and light themes
   - [ ] Mobile: panels render as bottom sheets

2. **Public studio page** (`/studios/1`):
   - [ ] Google and Yelp review badges appear below the ReviewPanel
   - [ ] Badges show correct ratings (4.8/5, 4.5/5) and review counts
   - [ ] Badges link to external URLs (open in new tab)
   - [ ] "Powered by Google" and "View on Yelp" attribution text appears
   - [ ] "Book Appointment" button in hero says "Book on Porter" and links externally
   - [ ] Social links section shows Google, Yelp, and "Book Online" pills
   - [ ] FooterCta button links to Porter booking URL

3. **Fallback** (`/studios/2`):
   - [ ] No integration badges, no modified booking CTA, no extra social links
   - [ ] Page renders identically to before this feature was built

- [ ] **Step 4: Final commit if any QA fixes were needed**

```bash
git add -A
git commit -m "fix: QA polish for integration hub"
```
