# Builder Live-Data Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the studio website builder render only real studio data (demo content strictly behind the Sample toggle), with designed public-parity empty states, in-builder content editing via a side panel, real photo uploads, a setup-progress guidance layer, and 7 structurally distinct templates.

**Architecture:** One truth model — `buildBuilderSiteData` gates all demo content behind `useMockData`; a builder-only `useStudioLiveContent` hook fetches the studio's real roster/reviews; every section renders a designed empty state (identical in builder and on the public site) with a builder-only `PromptChip` overlay that deep-links into a new `BuilderContentPanel` (SlideOver on inline, docked in split, BottomSheet on mobile). Content saves flow through the existing `useStudio().update()` merge-patch. Template consolidation (9→7) + new structural hero/gallery variants + `data-template` CSS signatures.

**Tech Stack:** Next.js 16 App Router, React 19, TS 5, Tailwind v4, Supabase (`@supabase/ssr`, storage), zod (existing), `tsx` for the check script. **No new dependencies.**

**Spec:** `docs/superpowers/specs/2026-07-07-builder-live-data-overhaul-design.md`

## Global Constraints

- **No new npm dependencies.** Native DnD/canvas/IntersectionObserver only.
- **No emoji in code** — inline SVG or text glyphs only.
- **Supabase project `cktvpfenygxhfaodihbz` ONLY.** Never touch project `sqibczeyflarfgtnexne` (Velora). Verify before any migration/MCP call.
- **Never run `npm run build` or `npm run dev`.** Gates are `npx tsc --noEmit`, `npm run lint`, and `npx tsx scripts/check-builder.ts`.
- **Commits:** conventional messages, **no Co-Authored-By / no AI attribution**. Commit only the files named in the task (working tree contains unrelated changes — never `git add -A` or `git add .`).
- Template-surface styling uses **CSS variables** (`var(--accent)` etc.), never raw hex, per existing section components. Editor chrome uses `chrome-*` Tailwind tokens.
- Copy rules (exact strings): toggle label **"Sample Data"**; tooltip **"Preview with example content — never shown on your live site."**; empty-state lines as given per task.
- Free-tier safety: client-side compression before upload (WebP q0.8, max edge 1600px gallery / 2400px cover), no server-side transforms.
- All new interactive elements: real `<button>`/`<a>`, keyboard operable, visible focus ring, `prefers-reduced-motion` respected for new animations.
- `"use client"` only where hooks/events require it (all builder chrome already is).

---

## Phase 1 — Truth Foundation

### Task 1: Template consolidation + legacy slug remap

**Files:**
- Create: `lib/utils/legacy-template.ts`
- Create: `scripts/check-builder.ts` (scaffold with first asserts)
- Modify: `lib/types/builder.ts:32-41` (TemplateSlug union)
- Modify: `lib/data/templates.ts` (delete 2 entries, absorb best defaults)
- Modify: `lib/hooks/use-theme-editor.ts` (remap on draft reads)
- Modify: `app/dashboard/builder/page.tsx` (remap on hydrate)
- Modify: `lib/data/studio-page.ts` (remap DB theme_config)

**Interfaces:**
- Produces: `remapLegacyTemplate(config: StudioThemeConfig): StudioThemeConfig` and `LEGACY_TEMPLATE_MAP: Record<string, TemplateSlug>` from `@/lib/utils/legacy-template`. All later tasks assume `TemplateSlug` has exactly 7 values: `"bold-editorial" | "studio-minimal" | "dark-cinematic" | "warm-artisan" | "gutter-punk" | "fine-line" | "traditional-flash"`.

- [ ] **Step 1: Write the failing check**

Create `scripts/check-builder.ts`:

```ts
/**
 * Assert-based self-checks for the builder truth model.
 * Run: npx tsx scripts/check-builder.ts
 * No test framework by design — tsx is already a devDependency.
 */
import assert from "node:assert/strict";
import { remapLegacyTemplate, LEGACY_TEMPLATE_MAP } from "../lib/utils/legacy-template";
import { templates, templateList } from "../lib/data/templates";
import type { StudioThemeConfig } from "../lib/types/builder";
import { defaultThemeConfig } from "../lib/data/theme-presets";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

// ─── Legacy template remap ───────────────────────────────────────────────
check("7 templates remain after consolidation", () => {
  assert.equal(templateList.length, 7);
  assert.ok(!("immersive-dark" in templates));
  assert.ok(!("clean-minimal" in templates));
});

check("legacy slugs remap to survivors", () => {
  assert.equal(LEGACY_TEMPLATE_MAP["immersive-dark"], "dark-cinematic");
  assert.equal(LEGACY_TEMPLATE_MAP["clean-minimal"], "studio-minimal");
});

check("remapLegacyTemplate rewrites retired slug, passes through current", () => {
  const legacy = { ...defaultThemeConfig, template: "immersive-dark" } as unknown as StudioThemeConfig;
  assert.equal(remapLegacyTemplate(legacy).template, "dark-cinematic");
  const current: StudioThemeConfig = { ...defaultThemeConfig, template: "fine-line" };
  assert.equal(remapLegacyTemplate(current).template, "fine-line");
  assert.equal(remapLegacyTemplate(current), current); // no clone when unchanged
});

console.log(`\n${passed} checks passed`);
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx tsx scripts/check-builder.ts`
Expected: FAIL — `Cannot find module '../lib/utils/legacy-template'`

- [ ] **Step 3: Create `lib/utils/legacy-template.ts`**

```ts
import type { StudioThemeConfig, TemplateSlug } from "@/lib/types/builder";

/**
 * Retired template slugs → surviving templates (9 → 7 consolidation).
 * Applied at every config-read boundary so saved theme_config jsonb,
 * localStorage drafts, and per-template draft caches keep working.
 */
export const LEGACY_TEMPLATE_MAP: Record<string, TemplateSlug> = {
  "immersive-dark": "dark-cinematic",
  "clean-minimal": "studio-minimal",
};

/** Rewrite a config whose template slug was retired. Returns input unchanged when current. */
export function remapLegacyTemplate(config: StudioThemeConfig): StudioThemeConfig {
  const mapped = LEGACY_TEMPLATE_MAP[config.template as string];
  if (!mapped) return config;
  if (process.env.NODE_ENV === "development") {
    console.info(`[builder] remapped legacy template "${config.template}" → "${mapped}"`);
  }
  return { ...config, template: mapped };
}
```

- [ ] **Step 4: Narrow the union in `lib/types/builder.ts`**

Replace lines 32–41:

```ts
export type TemplateSlug =
  | "bold-editorial"
  | "studio-minimal"
  | "dark-cinematic"
  | "warm-artisan"
  | "gutter-punk"
  | "fine-line"
  | "traditional-flash";
```

- [ ] **Step 5: Consolidate `lib/data/templates.ts`**

Delete the entire `"clean-minimal"` and `"immersive-dark"` entries. The survivors absorb their strongest traits — update these two survivor entries (all other survivors unchanged for now; signature defaults come in Phase 6):

`"studio-minimal"` entry: change `description` to `"Contemporary gallery aesthetic — radical whitespace, clean geometry, the work up front."` and inside `defaults` change `headingFont: "Space Grotesk"` / `bodyFont: "Space Grotesk"` (kept), and add `badge: "Minimal"` on the definition (after `description`).

`"dark-cinematic"` entry: change `description` to `"Photography-forward and atmospheric — full-bleed imagery, elegant type, reveal-on-scroll nav."` and add `badge: "Cinematic"`.

- [ ] **Step 6: Remap at draft-read boundaries in `lib/hooks/use-theme-editor.ts`**

Add import at top: `import { remapLegacyTemplate, LEGACY_TEMPLATE_MAP } from "@/lib/utils/legacy-template";`

In `readTemplateDrafts()` remap keys and values before returning:

```ts
function readTemplateDrafts(): Partial<Record<TemplateSlug, StudioThemeConfig>> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StudioThemeConfig>;
    const out: Partial<Record<TemplateSlug, StudioThemeConfig>> = {};
    for (const [slug, cfg] of Object.entries(parsed)) {
      const target = (LEGACY_TEMPLATE_MAP[slug] ?? slug) as TemplateSlug;
      out[target] = remapLegacyTemplate(cfg);
    }
    return out;
  } catch {
    return {};
  }
}
```

In `loadDraft` (returns parsed draft), wrap: `const parsed = remapLegacyTemplate(JSON.parse(stored) as StudioThemeConfig);`

- [ ] **Step 7: Remap on hydrate in `app/dashboard/builder/page.tsx`**

Add import: `import { remapLegacyTemplate } from "@/lib/utils/legacy-template";`

In `getExistingDraft()`: `return remapLegacyTemplate(JSON.parse(stored) as StudioThemeConfig);`

In the hydrate effect, where `dbConfig` is read: `const dbConfig = studio?.themeConfig ? remapLegacyTemplate(studio.themeConfig) : undefined;`

- [ ] **Step 8: Remap in `lib/data/studio-page.ts`**

Add import: `import { remapLegacyTemplate } from "@/lib/utils/legacy-template";`
Change the DB return: `config: studio.themeConfig ? remapLegacyTemplate(studio.themeConfig) : defaultThemeConfig,`

- [ ] **Step 9: Verify**

Run: `npx tsx scripts/check-builder.ts` → Expected: `3 checks passed` lines, exit 0.
Run: `npx tsc --noEmit` → Expected: PASS (any survivor-slug reference errors mean a missed boundary — fix before proceeding).
Run: `npm run lint` → Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add lib/utils/legacy-template.ts scripts/check-builder.ts lib/types/builder.ts lib/data/templates.ts lib/hooks/use-theme-editor.ts app/dashboard/builder/page.tsx lib/data/studio-page.ts
git commit -m "feat(builder): consolidate templates 9->7 with legacy slug remap"
```

---

### Task 2: StudioData carries `id` + `images`; mappers round-trip them

**Files:**
- Modify: `lib/repositories/types.ts` (StudioData)
- Modify: `lib/supabase/types.ts` (`mapDbStudioToStudioData`, `mapStudioDataToDbStudio`)
- Modify: `scripts/check-builder.ts` (new asserts)

**Interfaces:**
- Produces: `StudioData.id?: string` (studio row uuid, read-only — never written back) and `StudioData.images?: string[]` (gallery URLs, writable). Later tasks (`useStudioLiveContent`, uploads) consume `studio.id` and `studio.images`.

- [ ] **Step 1: Add failing asserts to `scripts/check-builder.ts`**

Append before the final `console.log`:

```ts
// ─── StudioData mappers ──────────────────────────────────────────────────
import {
  mapDbStudioToStudioData,
  mapStudioDataToDbStudio,
  type DbStudio,
} from "../lib/supabase/types";

const DB_ROW: DbStudio = {
  id: "row-uuid-1", name: "Iron & Ink", slug: "iron-ink", source: "organic",
  google_place_id: null, claimed_by: "owner-1", claimed_at: null,
  address: "1 Main St", city: "Portland", state: "OR", zip_code: "97214",
  latitude: null, longitude: null, phone: "555", email: "a@b.c", website: null,
  bio: "story", description: null, instagram: null, tiktok: null, facebook: null,
  hours: null, specialties: [], services: [], auto_specialties: false,
  integrations: null, theme_config: null, rating: 4.5, review_count: 3,
  profile_image: null, cover_image: "https://x/cover.webp",
  images: ["https://x/1.webp", "https://x/2.webp"],
  is_visible: true, created_at: "2026-01-01", updated_at: "2026-01-02",
};

check("mapDbStudioToStudioData carries id, images, coverImage", () => {
  const d = mapDbStudioToStudioData(DB_ROW);
  assert.equal(d.id, "row-uuid-1");
  assert.deepEqual(d.images, ["https://x/1.webp", "https://x/2.webp"]);
  assert.equal(d.coverImage, "https://x/cover.webp");
});

check("mapStudioDataToDbStudio writes images, never id", () => {
  const mapped = mapStudioDataToDbStudio({ id: "should-not-write", images: ["u1"] });
  assert.deepEqual(mapped.images, ["u1"]);
  assert.ok(!("id" in mapped));
});
```

- [ ] **Step 2: Run** `npx tsx scripts/check-builder.ts` → Expected: FAIL (`d.id` undefined / TS error on `images` not in `Partial<StudioData>`).

- [ ] **Step 3: Extend `StudioData` in `lib/repositories/types.ts`**

Inside the `StudioData` interface, after the `// Identity` comment block's `name: string;` add:

```ts
  /** Studio row uuid (studios.id). Read-only — populated by the Supabase repo, never written back. */
  id?: string;
```

After `coverImage?: string;` add:

```ts
  /** Gallery photo URLs (studios.images), display order = array order. */
  images?: string[];
```

- [ ] **Step 4: Update mappers in `lib/supabase/types.ts`**

In `mapDbStudioToStudioData`, add as the first two properties of the returned object:

```ts
    id: row.id,
    images: row.images ?? [],
```

In `mapStudioDataToDbStudio`, after the `coverImage` line add:

```ts
  if (data.images !== undefined) mapped.images = data.images;
```

(`id` is intentionally NOT mapped — row identity is immutable.)

- [ ] **Step 5: Verify** — `npx tsx scripts/check-builder.ts` → all checks pass. `npx tsc --noEmit` → PASS. `npm run lint` → PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/repositories/types.ts lib/supabase/types.ts scripts/check-builder.ts
git commit -m "feat(builder): StudioData carries row id and gallery images"
```

---

### Task 3: Site-data contract — `coverImage`, content predicates, booking link

**Files:**
- Create: `lib/utils/studio-content.ts`
- Modify: `components/studio-site/studio-site-data.ts`
- Modify: `scripts/check-builder.ts`

**Interfaces:**
- Produces (from `@/lib/utils/studio-content`):
  - `getBookingLink(integrations: StudioIntegrations | undefined): { url: string; platformName: string } | null`
  - `hasBio(d: StudioSiteData): boolean` · `hasHours(d): boolean` · `hasAnySocial(d): boolean` · `hasContact(d): boolean` · `hasPhotos(d): boolean` — used by sections (empty states) AND `useSetupProgress` (Task 18) so they can never disagree.
- Produces: `StudioSiteData.coverImage?: string` and `StudioSiteData.bookingLink?: { url: string; platformName: string } | null` (resolved upstream so sections stay data-source agnostic).

- [ ] **Step 1: Failing asserts in `scripts/check-builder.ts`**

Append:

```ts
// ─── Content predicates + booking link ───────────────────────────────────
import { getBookingLink, hasBio, hasHours, hasAnySocial, hasContact, hasPhotos } from "../lib/utils/studio-content";
import { studioSiteDataFromStudioData, type StudioSiteData } from "../components/studio-site/studio-site-data";
import type { StudioIntegrations } from "../lib/types/integrations";

const EMPTY_SITE: StudioSiteData = studioSiteDataFromStudioData(null);

check("empty site data fails every predicate", () => {
  assert.equal(hasBio(EMPTY_SITE), false);
  assert.equal(hasHours(EMPTY_SITE), false);
  assert.equal(hasAnySocial(EMPTY_SITE), false);
  assert.equal(hasContact(EMPTY_SITE), false);
  assert.equal(hasPhotos(EMPTY_SITE), false);
});

check("getBookingLink picks first connected booking platform", () => {
  const integrations: StudioIntegrations = {
    google: { status: "connected", linkUrl: "https://g.co/maps/x" }, // reviews category — ignored
    booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" },
  };
  const link = getBookingLink(integrations);
  assert.equal(link?.url, "https://booksy.com/en-us/x");
  assert.equal(link?.platformName, "Booksy");
  assert.equal(getBookingLink(undefined), null);
  assert.equal(getBookingLink({ booksy: { status: "error", linkUrl: "https://x" } }), null);
});

check("studioSiteDataFromStudioData maps coverImage, images, bookingLink", () => {
  const d = studioSiteDataFromStudioData({
    name: "T", specialties: [], services: [], hours: {}, autoSpecialties: false,
    coverImage: "https://x/c.webp", images: ["https://x/1.webp"],
    integrations: { booksy: { status: "connected", linkUrl: "https://booksy.com/en-us/x" } },
  });
  assert.equal(d.coverImage, "https://x/c.webp");
  assert.deepEqual(d.images, ["https://x/1.webp"]);
  assert.equal(d.bookingLink?.platformName, "Booksy");
  assert.equal(hasPhotos(d), true);
});
```

- [ ] **Step 2: Run** `npx tsx scripts/check-builder.ts` → Expected: FAIL (module not found).

- [ ] **Step 3: Create `lib/utils/studio-content.ts`**

```ts
import type { StudioIntegrations } from "@/lib/types/integrations";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import { getPlatformsByCategory } from "@/lib/data/integration-platforms";
import { isIntegrationActive } from "@/lib/utils/integration-helpers";

/**
 * Single source of truth for "does this studio have X content?".
 * Consumed by the site sections (empty states) AND useSetupProgress —
 * keeping the checklist and the preview incapable of disagreeing.
 */

export function getBookingLink(
  integrations: StudioIntegrations | undefined,
): { url: string; platformName: string } | null {
  if (!integrations) return null;
  for (const platform of getPlatformsByCategory("booking")) {
    const record = integrations[platform.id];
    if (record && isIntegrationActive(record) && record.linkUrl) {
      return { url: record.linkUrl, platformName: platform.name };
    }
  }
  return null;
}

export function hasBio(d: StudioSiteData): boolean {
  return Boolean(d.bio && d.bio.trim().length > 0);
}

export function hasHours(d: StudioSiteData): boolean {
  return Object.keys(d.hours ?? {}).length > 0;
}

export function hasAnySocial(d: StudioSiteData): boolean {
  return Boolean(d.instagram || d.tiktok || d.facebook || d.website);
}

export function hasContact(d: StudioSiteData): boolean {
  return Boolean(d.phone || d.email);
}

export function hasPhotos(d: StudioSiteData): boolean {
  return Boolean(d.coverImage) || (d.images?.length ?? 0) > 0;
}
```

- [ ] **Step 4: Extend `components/studio-site/studio-site-data.ts`**

Add import at top: `import { getBookingLink } from "@/lib/utils/studio-content";` and `import type { StudioIntegrations } from "@/lib/types/integrations";`

In the `StudioSiteData` interface, after `images: string[];` add:

```ts
  /** Hero cover photo URL. Unset → hero renders its designed placeholder texture. */
  coverImage?: string;
  /** Resolved booking destination (first connected booking-category integration). */
  bookingLink?: { url: string; platformName: string } | null;
```

In `studioSiteDataFromStudio` add to the returned object (after `images: ...`):

```ts
    coverImage: studio.coverImage || undefined,
    bookingLink: getBookingLink(studio.integrations as StudioIntegrations | undefined),
```

In `studioSiteDataFromStudioData` replace `images: [], // StudioData carries no gallery → builder shows placeholder tiles` with:

```ts
    images: data?.images ?? [],
    coverImage: data?.coverImage,
    bookingLink: getBookingLink(data?.integrations),
```

- [ ] **Step 5: Verify** — `npx tsx scripts/check-builder.ts` all pass; `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/utils/studio-content.ts components/studio-site/studio-site-data.ts scripts/check-builder.ts
git commit -m "feat(builder): site-data content predicates, coverImage, booking link resolution"
```

---

### Task 4: Gate ALL demo content behind the Sample toggle

**Files:**
- Modify: `components/studio-site/demo-site-data.ts`
- Modify: `scripts/check-builder.ts`

**Interfaces:**
- Produces: `buildBuilderSiteData(studio: StudioData | null, useMockData: boolean, live?: LiveExtras): StudioSiteData` where `LiveExtras = { artists: StudioSiteArtist[]; reviews: StudioSiteReview[]; ratingAverage?: string; reviewCount?: number }`. Consumed by `BuilderProvider` (Task 5). Demo constants (`DEMO_SITE_ARTISTS`, `DEMO_SITE_REVIEWS`, `DEMO_SITE_RATING_AVERAGE`) become unreachable when `useMockData === false`.

- [ ] **Step 1: Failing asserts**

Append to `scripts/check-builder.ts`:

```ts
// ─── Demo gating (the core truth-model guarantee) ────────────────────────
import { buildBuilderSiteData, DEMO_SITE_ARTISTS } from "../components/studio-site/demo-site-data";

check("Sample OFF leaks zero demo content", () => {
  const d = buildBuilderSiteData(null, false);
  assert.deepEqual(d.artists, []);
  assert.deepEqual(d.reviews, []);
  assert.equal(d.ratingAverage, undefined);
  assert.equal(d.reviewCount ?? 0, 0);
});

check("Sample OFF passes real live extras through", () => {
  const d = buildBuilderSiteData(null, false, {
    artists: [{ id: "a1", name: "Real Artist", initials: "RA", styles: [], photoCount: 0, photos: [] }],
    reviews: [{ author: "Real", stars: 5, text: "Great" }],
    ratingAverage: "5.0",
    reviewCount: 1,
  });
  assert.equal(d.artists[0]?.name, "Real Artist");
  assert.equal(d.reviews.length, 1);
  assert.equal(d.ratingAverage, "5.0");
});

check("Sample ON injects the full demo", () => {
  const d = buildBuilderSiteData(null, true);
  assert.equal(d.artists.length, DEMO_SITE_ARTISTS.length);
  assert.equal(d.reviews.length, 8);
  assert.equal(d.ratingAverage, "4.9");
  assert.equal(d.name, "Iron & Ink");
});
```

- [ ] **Step 2: Run** → Expected: FAIL (`Sample OFF leaks zero demo content` — artists = 3 demo entries today).

- [ ] **Step 3: Rewrite `buildBuilderSiteData` in `components/studio-site/demo-site-data.ts`**

Replace the existing `buildBuilderSiteData` function (keep `DEMO_SITE_ARTISTS`, `DEMO_SITE_RATING_AVERAGE`, `DEMO_SITE_REVIEWS` as-is, and update the doc comment):

```ts
/** Real earned content fetched by the builder (roster, reviews) in live mode. */
export interface LiveExtras {
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  ratingAverage?: string;
  reviewCount?: number;
}

/**
 * The builder's site data. THE truth-model gate:
 *   Sample ON  → mock studio + full demo roster/reviews/rating (never on live sites)
 *   Sample OFF → the studio's real data + real fetched extras; empties stay empty
 */
export function buildBuilderSiteData(
  studio: StudioData | null,
  useMockData: boolean,
  live?: LiveExtras,
): StudioSiteData {
  if (useMockData) {
    return {
      ...studioSiteDataFromStudioData(MOCK_STUDIO_DATA, {
        artists: DEMO_SITE_ARTISTS,
        reviews: DEMO_SITE_REVIEWS,
      }),
      ratingAverage: DEMO_SITE_RATING_AVERAGE,
      reviewCount: DEMO_SITE_REVIEWS.length,
    };
  }
  return {
    ...studioSiteDataFromStudioData(studio, {
      artists: live?.artists ?? [],
      reviews: live?.reviews ?? [],
    }),
    ratingAverage: live?.ratingAverage,
    reviewCount: live?.reviewCount ?? 0,
  };
}
```

- [ ] **Step 4: Verify** — `npx tsx scripts/check-builder.ts` all pass; `npx tsc --noEmit` PASS (callers pass — `live` is optional); `npm run lint` PASS.

- [ ] **Step 5: Commit**

```bash
git add components/studio-site/demo-site-data.ts scripts/check-builder.ts
git commit -m "feat(builder): demo content strictly gated behind Sample toggle"
```

---

### Task 5: Live content fetch + provider truth wiring + content-panel state

**Files:**
- Create: `lib/hooks/use-studio-live-content.ts`
- Modify: `components/studio-site/studio-site-context.tsx` (ContentGroup + onEditContent)
- Modify: `components/builder/builder-provider.tsx`
- Modify: `components/builder/studio-page-preview.tsx` (consume provider siteData — kills duplicate assembly)

**Interfaces:**
- Produces (from `@/lib/hooks/use-studio-live-content`):
  ```ts
  interface LiveStudioContent {
    artists: StudioSiteArtist[];
    reviews: StudioSiteReview[];
    ratingAverage?: string;
    reviewCount: number;
    status: "idle" | "loading" | "ready" | "error";
    refresh: () => void;
  }
  function useStudioLiveContent(studioId: string | undefined): LiveStudioContent
  ```
- Produces (from `@/components/studio-site/studio-site-context`): `export type ContentGroup = "story" | "contact-hours" | "photos" | "socials" | "booking" | "artists";` and `StudioSiteContextValue.onEditContent?: (group: ContentGroup) => void`.
- Produces (on `BuilderContextValue`): `siteData: StudioSiteData`, `liveContent: LiveStudioContent`, `contentPanel: { open: boolean; group: ContentGroup }`, `openContentPanel: (group?: ContentGroup) => void`, `closeContentPanel: () => void`, `isPreviewing: boolean`, `setIsPreviewing: (v: boolean) => void`.

- [ ] **Step 1: Create `lib/hooks/use-studio-live-content.ts`**

```ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getReviewsForTarget } from "@/lib/data/supabase-reviews";
import {
  ARTIST_CARD_COLUMNS,
  type DbArtist,
  type DbPortfolioImage,
} from "@/lib/supabase/types";
import type {
  StudioSiteArtist,
  StudioSiteReview,
} from "@/components/studio-site/studio-site-data";

export interface LiveStudioContent {
  artists: StudioSiteArtist[];
  reviews: StudioSiteReview[];
  ratingAverage?: string;
  reviewCount: number;
  status: "idle" | "loading" | "ready" | "error";
  refresh: () => void;
}

const EMPTY: Omit<LiveStudioContent, "status" | "refresh"> = {
  artists: [],
  reviews: [],
  ratingAverage: undefined,
  reviewCount: 0,
};

const THUMBS_PER_ARTIST = 12; // covers the max strip (8) + overflow sheet grid

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

/**
 * Builder-only: fetch the studio's REAL roster (+ portfolio thumbnails, one
 * batched query) and reviews so the preview shows live truth. No studioId
 * (logged-out / localStorage dev) → stays idle with empty content.
 */
export function useStudioLiveContent(studioId: string | undefined): LiveStudioContent {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState<LiveStudioContent["status"]>("idle");
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!studioId || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setData(EMPTY);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    const supabase = createClient();

    (async () => {
      const [artistsRes, reviews] = await Promise.all([
        supabase
          .from("artists")
          .select(ARTIST_CARD_COLUMNS)
          .eq("studio_id", studioId)
          .eq("is_visible", true)
          .order("rating", { ascending: false, nullsFirst: false }),
        getReviewsForTarget(supabase, "studio", studioId),
      ]);
      if (cancelled) return;
      if (artistsRes.error) {
        setStatus("error");
        return;
      }

      const rows = (artistsRes.data ?? []) as unknown as DbArtist[];
      let thumbsByArtist = new Map<string, DbPortfolioImage[]>();
      if (rows.length > 0) {
        const { data: portfolio } = await supabase
          .from("portfolio_images")
          .select("id, artist_id, url, sort_order")
          .in("artist_id", rows.map((r) => r.id))
          .order("sort_order", { ascending: true });
        if (cancelled) return;
        thumbsByArtist = new Map();
        for (const img of (portfolio ?? []) as DbPortfolioImage[]) {
          const list = thumbsByArtist.get(img.artist_id) ?? [];
          if (list.length < THUMBS_PER_ARTIST) list.push(img);
          thumbsByArtist.set(img.artist_id, list);
        }
      }

      const artists: StudioSiteArtist[] = rows.map((r) => {
        const thumbs = thumbsByArtist.get(r.id) ?? [];
        return {
          id: r.id,
          name: r.name,
          initials: initialsOf(r.name),
          styles: (r.specialties ?? []).slice(0, 3),
          photoCount: thumbs.length,
          photos: thumbs.map((t) => ({ id: t.id, url: t.url })),
          profileHref: `/artists/${r.id}`,
        };
      });

      const siteReviews: StudioSiteReview[] = reviews.map((r) => ({
        author: r.authorName || "Anonymous",
        stars: Math.round(r.rating),
        text: r.content,
      }));
      const avg =
        reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : undefined;

      setData({
        artists,
        reviews: siteReviews,
        ratingAverage: avg,
        reviewCount: reviews.length,
      });
      setStatus("ready");
    })().catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, [studioId, nonce]);

  return useMemo(() => ({ ...data, status, refresh }), [data, status, refresh]);
}
```

- [ ] **Step 2: Extend `components/studio-site/studio-site-context.tsx`**

Replace the file's interface section (keep `StudioSitePage`, provider, hook):

```ts
export type StudioSitePage = "studio" | "policies";

/** Content groups the builder's Content panel can deep-link to. */
export type ContentGroup =
  | "story"
  | "contact-hours"
  | "photos"
  | "socials"
  | "booking"
  | "artists";

export interface StudioSiteContextValue {
  config: StudioThemeConfig;
  data: StudioSiteData;
  onNavigatePage: (page: StudioSitePage) => void;
  /**
   * Builder-only: open the Content panel at a group. The public site never
   * provides this, so builder prompt chips cannot render on live sites.
   */
  onEditContent?: (group: ContentGroup) => void;
}
```

- [ ] **Step 3: Rewire `components/builder/builder-provider.tsx`**

Full replacement of the component body additions — the provider becomes the single site-data assembler:

```tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  useThemeEditor,
  type UseThemeEditorReturn,
} from "@/lib/hooks/use-theme-editor";
import type { StudioThemeConfig } from "@/lib/types/builder";
import { useStudio } from "@/lib/providers/studio-provider";
import type { StudioData } from "@/lib/repositories";
import { StudioSiteProvider, type ContentGroup } from "@/components/studio-site/studio-site-context";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import { buildBuilderSiteData } from "@/components/studio-site/demo-site-data";
import { useStudioLiveContent, type LiveStudioContent } from "@/lib/hooks/use-studio-live-content";

export type PreviewPage = "studio" | "policies";

interface BuilderContextValue extends UseThemeEditorReturn {
  replayKey: number;
  triggerReplay: () => void;
  studio: StudioData | null;
  useMockData: boolean;
  toggleMockData: () => void;
  previewPage: PreviewPage;
  setPreviewPage: (page: PreviewPage) => void;
  /** Assembled site data — the ONLY source preview surfaces may render from. */
  siteData: StudioSiteData;
  liveContent: LiveStudioContent;
  contentPanel: { open: boolean; group: ContentGroup };
  openContentPanel: (group?: ContentGroup) => void;
  closeContentPanel: () => void;
  isPreviewing: boolean;
  setIsPreviewing: (v: boolean) => void;
}
```

Inside `BuilderProvider` (after existing state), add:

```tsx
  const liveContent = useStudioLiveContent(useMockData ? undefined : studio?.id);
  const [contentPanel, setContentPanel] = useState<{ open: boolean; group: ContentGroup }>({
    open: false,
    group: "story",
  });
  const openContentPanel = useCallback(
    (group: ContentGroup = "story") => setContentPanel({ open: true, group }),
    [],
  );
  const closeContentPanel = useCallback(
    () => setContentPanel((p) => ({ ...p, open: false })),
    [],
  );
  const [isPreviewing, setIsPreviewing] = useState(false);

  const siteData = useMemo(
    () =>
      buildBuilderSiteData(studio, useMockData, {
        artists: liveContent.artists,
        reviews: liveContent.reviews,
        ratingAverage: liveContent.ratingAverage,
        reviewCount: liveContent.reviewCount,
      }),
    [studio, useMockData, liveContent],
  );
```

Replace the existing `siteContext` memo with:

```tsx
  const siteContext = useMemo(
    () => ({
      config: editor.config,
      data: siteData,
      onNavigatePage: setPreviewPage,
      onEditContent: openContentPanel,
    }),
    [editor.config, siteData, openContentPanel],
  );
```

And spread the new values into the provider `value` (add `siteData, liveContent, contentPanel, openContentPanel, closeContentPanel, isPreviewing, setIsPreviewing`).

- [ ] **Step 4: Simplify `components/builder/studio-page-preview.tsx`**

Replace the data assembly with the provider's:

```tsx
export function StudioPagePreview({ className }: StudioPagePreviewProps) {
  const { config, resolvedVars, replayKey, previewPage, siteData, setPreviewPage, openContentPanel } =
    useBuilder();

  return (
    <StudioSiteRenderer
      config={config}
      resolvedVars={resolvedVars}
      data={siteData}
      page={previewPage}
      replayKey={replayKey}
      onNavigatePage={setPreviewPage}
      onEditContent={openContentPanel}
      className={className}
    />
  );
}
```

(Remove the now-unused `buildBuilderSiteData` import.) In `components/studio-site/studio-site-renderer.tsx` add the pass-through prop: `onEditContent?: (group: ContentGroup) => void;` in `StudioSiteRendererProps` (import `ContentGroup` type), and include it in the provider value: `<StudioSiteProvider value={{ config, data, onNavigatePage: navigate, onEditContent }}>`. The public `StudioSitePublic` does NOT pass it — chips stay builder-only.

- [ ] **Step 5: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS; `npx tsx scripts/check-builder.ts` still all pass.

- [ ] **Step 6: Commit**

```bash
git add lib/hooks/use-studio-live-content.ts components/studio-site/studio-site-context.tsx components/builder/builder-provider.tsx components/builder/studio-page-preview.tsx components/studio-site/studio-site-renderer.tsx
git commit -m "feat(builder): fetch real roster/reviews; provider is the single site-data source"
```

---

### Task 6: Public page parity — roster thumbnails + coverImage

**Files:**
- Modify: `lib/data/studio-page.ts`

**Interfaces:**
- Consumes: `StudioSiteArtist` shape (photos + photoCount + profileHref) exactly as Task 5's hook produces, so builder and public render identically.

- [ ] **Step 1: Enrich the DB branch of `getStudioForPage`**

Replace the roster mapping block (the `const artists: StudioSiteArtist[] = roster.map(...)` in the `if (studio)` branch) with a thumbnail-enriched version:

```ts
        const rosterIds = roster.map((a) => a.id);
        let thumbsByArtist = new Map<string, { id: string; url: string }[]>();
        if (rosterIds.length > 0) {
          const { data: portfolio } = await supabase
            .from("portfolio_images")
            .select("id, artist_id, url, sort_order")
            .in("artist_id", rosterIds)
            .order("sort_order", { ascending: true });
          for (const img of (portfolio ?? []) as { id: string; artist_id: string; url: string }[]) {
            const list = thumbsByArtist.get(img.artist_id) ?? [];
            if (list.length < 12) list.push({ id: img.id, url: img.url });
            thumbsByArtist.set(img.artist_id, list);
          }
        }
        const artists: StudioSiteArtist[] = roster.map((a) => {
          const thumbs = thumbsByArtist.get(a.id) ?? [];
          return {
            id: a.id,
            name: a.name,
            initials: initialsOf(a.name),
            styles: a.specialties.slice(0, 3),
            photoCount: thumbs.length,
            photos: thumbs,
            profileHref: `/artists/${a.id}`,
          };
        });
```

(`studioSiteDataFromStudio` already picks up `coverImage`/`bookingLink` from Task 3 — no further change.)

- [ ] **Step 2: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/data/studio-page.ts
git commit -m "feat(studio-site): public roster strips render real portfolio thumbnails"
```

---

## Phase 2 — Designed Empty States (public parity) + Prompt Chips

### Task 7: Empty-state primitives

**Files:**
- Create: `components/studio-site/empty-states.tsx`

**Interfaces:**
- Produces:
  ```tsx
  function PromptChip({ group, label, className }: { group: ContentGroup; label: string; className?: string }): JSX.Element | null
  function SectionEmptyState({ eyebrow, message, prompt, className }: {
    eyebrow?: string; message: string;
    prompt?: { group: ContentGroup; label: string };
    className?: string;
  }): JSX.Element
  ```
  `PromptChip` returns `null` when the context has no `onEditContent` (i.e. on the public site) — chips are builder-only **by construction**. Both style exclusively with template CSS vars so empty states inherit each template's identity.

- [ ] **Step 1: Create `components/studio-site/empty-states.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { useStudioSite, type ContentGroup } from "./studio-site-context";

/**
 * Builder-only affordance overlaid on real empty states. Renders nothing on
 * the public site (no onEditContent in context). Click never toggles the
 * section's style popover (stopPropagation).
 */
export function PromptChip({
  group,
  label,
  className,
}: {
  group: ContentGroup;
  label: string;
  className?: string;
}) {
  const { onEditContent } = useStudioSite();
  if (!onEditContent) return null;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onEditContent(group);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "text-[11px] font-semibold transition-transform duration-150 hover:scale-[1.03]",
        "focus-visible:outline-none focus-visible:ring-2",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
      style={{
        borderColor: "var(--accent)",
        color: "var(--accent)",
        backgroundColor: "var(--accent-bg)",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M5 1v8M1 5h8" />
      </svg>
      {label}
    </button>
  );
}

/**
 * A designed, public-facing empty state. Shown identically in the builder and
 * on the live site (full-parity decision). Inherits the active template's
 * fonts/colors so an empty section still looks unmistakably on-brand.
 */
export function SectionEmptyState({
  eyebrow,
  message,
  prompt,
  className,
}: {
  eyebrow?: string;
  message: string;
  prompt?: { group: ContentGroup; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      {eyebrow && (
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--accent)" }}
        >
          {eyebrow}
        </p>
      )}
      <p
        className="max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--text-muted)", fontFamily: "var(--body-font)" }}
      >
        {message}
      </p>
      {prompt && <PromptChip group={prompt.group} label={prompt.label} />}
    </div>
  );
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 3: Commit**

```bash
git add components/studio-site/empty-states.tsx
git commit -m "feat(studio-site): PromptChip and SectionEmptyState primitives"
```

---

### Task 8: Hero — real cover photo + prompt chip

**Files:**
- Modify: `components/builder/preview/hero-section.tsx`

**Interfaces:**
- Consumes: `data.coverImage` (Task 3), `data.bookingLink` (Task 3), `PromptChip` (Task 7).

- [ ] **Step 1: Add imports**

```tsx
import { PromptChip } from "@/components/studio-site/empty-states";
```

- [ ] **Step 2: Cover-image style helper + image panel**

Add above `HeroContent`:

```tsx
function heroImageStyle(coverImage?: string): React.CSSProperties {
  if (coverImage) {
    return {
      backgroundImage: `url("${coverImage}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN };
}
```

In `SplitHero`, replace the image `<div>` with:

```tsx
function SplitHero() {
  const { data } = useStudioSite();
  return (
    <div className="grid min-h-[520px] grid-cols-1 @lg:grid-cols-2">
      <div className="relative min-h-[280px] @lg:min-h-full" style={heroImageStyle(data.coverImage)}>
        {!data.coverImage && (
          <div className="absolute bottom-4 left-4">
            <PromptChip group="photos" label="Add cover photo" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-5 p-8 @lg:p-12" style={{ backgroundColor: "var(--bg-primary)" }}>
        <HeroContent />
      </div>
    </div>
  );
}
```

In `FullbleedHero`, replace the outer `<div>` opening with the same pattern (gradient overlay stays so text remains legible over real photos):

```tsx
function FullbleedHero() {
  const { data } = useStudioSite();
  return (
    <div className="relative min-h-[520px]" style={heroImageStyle(data.coverImage)}>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, var(--bg-deep) 10%, transparent 60%)" }}
      />
      {!data.coverImage && (
        <div className="absolute top-4 right-4 z-10">
          <PromptChip group="photos" label="Add cover photo" />
        </div>
      )}
      <div className="relative flex h-full min-h-[520px] flex-col justify-end gap-5 p-8 @lg:max-w-xl @lg:p-12">
        <HeroContent />
      </div>
    </div>
  );
}
```

`CenteredHero` is text-on-solid — unchanged.

- [ ] **Step 3: Hero CTA truth**

In `HeroContent`, make the CTA real. Replace the CTA block:

```tsx
      {config.showHeroCta !== false && (
        <div className={cn("flex flex-col items-center gap-4 @md:flex-row @md:gap-5", centered && "@md:justify-center")}>
          {data?.bookingLink ? (
            <a
              href={data.bookingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaStyle.className}
              style={ctaStyle.style}
            >
              Book a Consultation
            </a>
          ) : (
            <button
              type="button"
              onClick={() => scrollToBuilderSection("footer-cta")}
              className={ctaStyle.className}
              style={ctaStyle.style}
            >
              Book a Consultation
            </button>
          )}
          <button
            type="button"
            onClick={() => scrollToBuilderSection("gallery", "artist-strips")}
            className="text-[13px] font-medium transition-colors hover:underline"
            style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
          >
            View Our Work &darr;
          </button>
        </div>
      )}
```

Add import `import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";` — this util is created in this task (it's needed by nav/footer later; creating here since hero lands first):

Create `lib/utils/scroll-to-section.ts`:

```ts
/**
 * Smooth-scroll the studio site to a section by data-section id.
 * Works inside the builder's overflow container and on the public page.
 * Extra ids act as fallbacks (first section that exists wins).
 */
export function scrollToBuilderSection(...sectionIds: string[]): void {
  const root = document.querySelector("[data-builder-root]");
  if (!root) return;
  let el: Element | null = null;
  for (const id of sectionIds) {
    el = root.querySelector(`[data-section="${id}"], [data-builder-section="${id}"]`);
    if (el) break;
  }
  if (!el) return;
  const scrollContainer =
    root.closest<HTMLElement>("[class*='overflow-y-auto']") ?? root.parentElement;
  if (!scrollContainer) return;
  const containerRect = scrollContainer.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  scrollContainer.scrollBy({ top: elRect.top - containerRect.top, behavior: "smooth" });
}
```

**Files addendum:** Create: `lib/utils/scroll-to-section.ts`.

- [ ] **Step 4: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 5: Commit**

```bash
git add components/builder/preview/hero-section.tsx lib/utils/scroll-to-section.ts
git commit -m "feat(builder): hero renders real cover photo; CTA wired to booking link or contact scroll"
```

---

### Task 9: Gallery — designed empty state

**Files:**
- Modify: `components/builder/preview/gallery-section.tsx`

**Interfaces:**
- Consumes: `data.images` (real when present), `SectionEmptyState` (Task 7).

- [ ] **Step 1: Replace the placeholder-fallback with a designed empty state**

Add import: `import { SectionEmptyState } from "@/components/studio-site/empty-states";`

In `GallerySection`, replace the `items` assignment and layout render:

```tsx
  const hasImages = data.images.length > 0;
  const items: GalleryTile[] = hasImages
    ? data.images.map((url, i) => ({
        id: i,
        aspect: GALLERY_ITEMS[i % GALLERY_ITEMS.length]!.aspect,
        src: url,
      }))
    : GALLERY_ITEMS.slice(0, 6);
```

Wrap the layout block (the four `{galleryLayout === ...}` lines) in a relative container with the overlay when empty:

```tsx
        <div className="relative">
          <div className={cn(!hasImages && "opacity-40")} aria-hidden={!hasImages}>
            {galleryLayout === "featured" && <FeaturedGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} />}
            {galleryLayout === "uniform" && <UniformGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} />}
            {galleryLayout === "masonry" && <MasonryGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} />}
            {galleryLayout === "carousel" && <CarouselGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} />}
          </div>
          {!hasImages && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-[var(--border-radius-lg)] px-4 py-2"
                style={{ backgroundColor: "color-mix(in srgb, var(--bg-primary) 82%, transparent)", backdropFilter: "blur(2px)" }}
              >
                <SectionEmptyState
                  message="Portfolio coming soon."
                  prompt={{ group: "photos", label: "Add photos" }}
                  className="py-4"
                />
              </div>
            </div>
          )}
        </div>
```

Only open the lightbox for real photos — replace the `lightboxPhotos` line with:

```tsx
  const lightboxPhotos = hasImages ? items.map((item) => ({ id: item.id, src: item.src })) : [];
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 3: Commit**

```bash
git add components/builder/preview/gallery-section.tsx
git commit -m "feat(builder): gallery designed empty state with silhouette tiles"
```

---

### Task 10: About — reflow to real content, kill fake amenities

**Files:**
- Modify: `components/builder/preview/about-section.tsx`

- [ ] **Step 1: StoryBlock renders truth**

Add import: `import { PromptChip, SectionEmptyState } from "@/components/studio-site/empty-states";`

Replace `StoryBlock`:

```tsx
function StoryBlock({ centered, bio }: { centered?: boolean; bio?: string }) {
  const hasStory = Boolean(bio && bio.trim());
  return (
    <div className={cn(centered && "text-center")}>
      <h2
        className="mb-4 text-2xl font-bold leading-tight @sm:text-3xl"
        style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}
      >
        Our Story
      </h2>
      {hasStory ? (
        <p
          className={cn("text-sm leading-relaxed", centered && "mx-auto max-w-xl")}
          style={{ color: "var(--text-secondary)" }}
        >
          {bio}
        </p>
      ) : (
        <div className={cn("flex flex-col gap-3", centered ? "items-center" : "items-start")}>
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            Story coming soon.
          </p>
          <PromptChip group="story" label="Tell your story" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Reflow instead of empty tag boxes**

In `AboutSection`, derive real presence and pass it down — replace the two `const has*` lines:

```tsx
  const hasSpecialties = showSpecialties !== false && (data?.specialties?.length ?? 0) > 0;
  const hasDetails = showStudioDetails !== false && (data?.services?.length ?? 0) > 0;
```

(`SpecialtiesBlock`/`StudioDetailsBlock` now only render with content — the section reflows to what exists, per spec.)

- [ ] **Step 3: Delete the fabricated amenities**

In `FullWidthAbout`, delete the entire `showDetails && (...)` 3-column grid (the block containing `"Private Rooms"` and `"Free Parking"`) and replace with a truthful services row:

```tsx
      {showDetails && services.length > 0 && (
        <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-6 text-center">
          {services.includes("walk-ins") && (
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }} aria-hidden="true">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Walk-ins Welcome</p>
            </div>
          )}
          {services.includes("piercing") && (
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--accent)" }} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Piercing Available</p>
            </div>
          )}
        </div>
      )}
```

- [ ] **Step 4: All-empty fallback** — in `AboutSection`, before the `aboutLayout === "none"` branch add:

```tsx
  const nothingToShow = !bio?.trim() && !hasSpecialties && !hasDetails;
  if (aboutLayout !== "none" && nothingToShow) {
    return (
      <section className={cn("w-full transition-all duration-500 ease-in-out", className)} style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-[1350px] px-6 py-12 @lg:px-10">
          <SectionEmptyState
            eyebrow="Our Story"
            message="Story coming soon."
            prompt={{ group: "story", label: "Tell your story" }}
          />
        </div>
      </section>
    );
  }
```

- [ ] **Step 5: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 6: Commit**

```bash
git add components/builder/preview/about-section.tsx
git commit -m "feat(builder): about section reflows to real content, removes fabricated amenities"
```

---

### Task 11: Artist strips — empty roster card, real profile links, per-artist empties

**Files:**
- Modify: `components/builder/preview/artist-strips-section.tsx`

- [ ] **Step 1: Empty-roster state replaces the hide**

Add imports:

```tsx
import Link from "next/link";
import { SectionEmptyState } from "@/components/studio-site/empty-states";
```

Replace `if (artists.length === 0) return null;` with a rendered section:

```tsx
  if (artists.length === 0) {
    return (
      <section data-builder-section="artist-strips" style={{ background: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-[1350px] px-6 @lg:px-10 pt-6 pb-4">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            Our Artists
          </p>
          <div
            data-builder-card
            className="rounded-lg border"
            style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
          >
            <SectionEmptyState
              message="Artist lineup coming soon."
              prompt={{ group: "artists", label: "Add artists" }}
            />
          </div>
        </div>
      </section>
    );
  }
```

- [ ] **Step 2: "View profile" becomes a real link**

In `ArtistStrip`, replace the dead `View profile` button:

```tsx
        {artist.profileHref ? (
          <Link
            href={artist.profileHref}
            className="text-[10px] @sm:text-[11px] font-medium shrink-0 ml-2 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            View profile &#8599;
          </Link>
        ) : null}
```

Apply the same to the `View profile` button in `ArtistGallerySheet` (link when `artist.profileHref`, otherwise omit).

- [ ] **Step 3: Artist-without-portfolio strip**

In `ArtistStrip`, when the artist has no photos, show honest placeholder tiles + note instead of the photo strip. Replace the photo-strip block:

```tsx
      {artist.photos.length > 0 ? (
        <div data-photo-strip>
          <div data-photo-track>
            {strip.map((photo, i) => (
              <PhotoBlock key={photo.id} src={photo.url} onClick={() => onPhotoClick(artist, i)} />
            ))}
            {remaining > 0 && (
              <OverflowPill remaining={remaining} onClick={() => onOverflowClick(artist)} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 w-12 shrink-0 rounded-md opacity-40"
              style={{ background: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN }}
              aria-hidden="true"
            />
          ))}
          <span className="ml-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
            Portfolio coming soon
          </span>
        </div>
      )}
```

Also update the identity row's meta line so it never claims photos that do not exist — replace `{artist.styles.join(" · ")} · {artist.photoCount} photos` with:

```tsx
              {[artist.styles.join(" · "), artist.photoCount > 0 ? `${artist.photoCount} photos` : null]
                .filter(Boolean)
                .join(" · ")}
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 5: Commit**

```bash
git add components/builder/preview/artist-strips-section.tsx
git commit -m "feat(builder): artist strips render empty roster state and real profile links"
```

---

### Task 12: Details — honest reviews/hours empties; booking card replaces fake calendar

**Files:**
- Modify: `components/builder/preview/details-section.tsx`
- Modify: `components/studio-site/studio-site-data.ts` (+`isSample`)
- Modify: `components/studio-site/demo-site-data.ts` (set `isSample: true` in mock branch)
- Modify: `scripts/check-builder.ts`

**Interfaces:**
- Produces: `StudioSiteData.isSample?: boolean` — `true` only from `buildBuilderSiteData`'s Sample branch. The ONLY consumer is demo-flavored widgets (the sample booking calendar). Public site data never sets it.

- [ ] **Step 1: Failing assert**

Append to `scripts/check-builder.ts`:

```ts
check("isSample flags only the Sample branch", () => {
  assert.equal(buildBuilderSiteData(null, true).isSample, true);
  assert.equal(buildBuilderSiteData(null, false).isSample ?? false, false);
});
```

Run `npx tsx scripts/check-builder.ts` → Expected: FAIL.

- [ ] **Step 2: Add the flag**

`components/studio-site/studio-site-data.ts` — in `StudioSiteData` after `bookingLink`:

```ts
  /** True only when the builder's Sample Data toggle is on. Never set for live/public data. */
  isSample?: boolean;
```

`components/studio-site/demo-site-data.ts` — in `buildBuilderSiteData`'s `if (useMockData)` return, add `isSample: true,` after `reviewCount`.

Run the check → PASS.

- [ ] **Step 3: ReviewsWidget always renders — with a real empty state**

In `details-section.tsx`, add import: `import { PromptChip, SectionEmptyState } from "@/components/studio-site/empty-states";` and `import type { StudioSiteData } from "@/components/studio-site/studio-site-data";` (already imported — keep single import).

Inside `ReviewsWidget`, at the top of the returned JSX handle the empty case — replace the `visibleReviews`/header logic with an early branch:

```tsx
  if (reviews.length === 0) {
    return (
      <div
        className="flex h-full flex-col rounded-[var(--border-radius-lg)] overflow-hidden"
        data-builder-card-lg
        style={{ background: "var(--widget-1)" }}
      >
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--widget-label)" }}>
            What clients say
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-6 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" style={{ color: "var(--text-muted)" }}>
            <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11 5.52.44a.56.56 0 0 1 .32.99l-4.2 3.6 1.28 5.39a.56.56 0 0 1-.84.61L12 16.73l-4.73 2.9a.56.56 0 0 1-.84-.6l1.29-5.4-4.21-3.6a.56.56 0 0 1 .32-.98l5.52-.44 2.13-5.12Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            No reviews yet &mdash; verified client reviews appear here.
          </p>
        </div>
      </div>
    );
  }
```

In `DetailsSection`, remove the `reviews.length > 0 &&` guard so the widget always renders (the widget now owns its empty state):

```tsx
          <ReviewsWidget
            reviews={reviews}
            ratingAverage={data.ratingAverage ?? ""}
            reviewCount={data.reviewCount ?? reviews.length}
          />
```

- [ ] **Step 4: HoursWidget empty state + chip**

Replace `HoursWidget`'s inner content when there are no hours — after the `VISIT US` heading, replace the day list with:

```tsx
      {Object.keys(hoursData).length === 0 ? (
        <div className="flex flex-1 flex-col items-start gap-3">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            By appointment &mdash; contact us.
          </p>
          {(contact.phone || contact.email) && (
            <div className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              {contact.phone && <span>{contact.phone}</span>}
              {contact.email && <span>{contact.email}</span>}
            </div>
          )}
          <PromptChip group="contact-hours" label="Set hours" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {DAY_ORDER.map((day) => {
            /* existing row rendering unchanged */
          })}
        </div>
      )}
```

Update the signature: `function HoursWidget({ hoursData, contact }: { hoursData: StudioSiteData["hours"]; contact: { phone?: string; email?: string } })` and the call site: `<HoursWidget hoursData={data.hours} contact={{ phone: data.phone, email: data.email }} />`.

- [ ] **Step 5: Booking truth — three states**

Rename the existing fake-calendar component `BookingWidget` → `SampleBookingDemo` (keep its internals verbatim; it is a deliberate demo). Then add the real card:

```tsx
function BookingCard({ data }: { data: StudioSiteData }) {
  const link = data.bookingLink;

  return (
    <div
      data-builder-card-lg
      className="flex h-full flex-col justify-between gap-5 rounded-xl border p-6"
      style={{ backgroundColor: "var(--widget-3)", borderColor: "var(--widget-border)" }}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--widget-label)" }}>
          Booking
        </p>
        <h3
          className="mt-3 text-lg font-bold uppercase tracking-tight"
          style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}
        >
          {link ? "Book a Session" : "Contact to Book"}
        </h3>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {link
            ? `Appointments are scheduled through ${link.platformName}.`
            : "Reach out and we’ll set up your appointment."}
        </p>
      </div>

      {link ? (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          Book on {link.platformName}
        </a>
      ) : (
        <div className="flex flex-col gap-2">
          {data.phone && (
            <a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`} className="text-sm hover:underline" style={{ color: "var(--text-primary)" }}>
              {data.phone}
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="text-sm hover:underline" style={{ color: "var(--text-primary)" }}>
              {data.email}
            </a>
          )}
          {data.instagram && (
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {data.instagram.startsWith("@") ? data.instagram : `@${data.instagram}`}
            </span>
          )}
          {!data.phone && !data.email && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Add contact details so clients can reach you.
            </p>
          )}
          <div className="mt-1">
            <PromptChip group="booking" label="Add booking link" />
          </div>
        </div>
      )}
    </div>
  );
}
```

In `DetailsSection`, render by truth:

```tsx
          {data.isSample ? (
            detailsLayout === "two-one" ? (
              <div className="@md:col-span-2"><SampleBookingDemo /></div>
            ) : (
              <SampleBookingDemo />
            )
          ) : detailsLayout === "two-one" ? (
            <div className="@md:col-span-2"><BookingCard data={data} /></div>
          ) : (
            <BookingCard data={data} />
          )}
```

- [ ] **Step 6: Verify** — `npx tsx scripts/check-builder.ts` all pass; `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 7: Commit**

```bash
git add components/builder/preview/details-section.tsx components/studio-site/studio-site-data.ts components/studio-site/demo-site-data.ts scripts/check-builder.ts
git commit -m "feat(builder): honest reviews/hours empties; real booking card, fake calendar sample-only"
```

---

### Task 13: Footer CTA — real stats only, working contact card

**Files:**
- Modify: `components/builder/preview/footer-cta-section.tsx`

- [ ] **Step 1: Booking variant — compute stats from data, delete fabrications**

Replace the entire hardcoded stats array + randomuser block in `Booking` with:

```tsx
function Booking({ glow, data, ctaStyle }: VariantProps) {
  const stats: { number: string; label: string; sub: string }[] = [];
  if (data.ratingAverage && (data.reviewCount ?? 0) > 0) {
    stats.push({
      number: data.ratingAverage,
      label: "Average Rating",
      sub: `from ${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"}`,
    });
  }
  if (data.artists.length > 0) {
    stats.push({
      number: String(data.artists.length),
      label: data.artists.length === 1 ? "Resident Artist" : "Resident Artists",
      sub: "specialized styles",
    });
  }
  if (data.services.includes("walk-ins")) {
    stats.push({ number: "Yes", label: "Walk-ins", sub: "when chairs are open" });
  }
  const hasStats = stats.length > 0;
```

Keep the left column (headline + CTA buttons) as-is, but wire the primary button like the hero (booking link `<a>` when `data.bookingLink`, else scroll to contact) and make "View Portfolio" call `scrollToBuilderSection("gallery", "artist-strips")` (import from `@/lib/utils/scroll-to-section`). For the right column:

```tsx
        {hasStats ? (
          <div
            className="flex flex-col justify-center border-t px-6 py-10 @md:border-t-0 @md:border-l @md:px-8 @md:py-16 @lg:px-12 @lg:py-20"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border)" }}
          >
            <div className={cn("grid gap-5", stats.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 rounded-xl p-4"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)" }}
                >
                  <span className="text-2xl font-bold" style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}>
                    {stat.number}
                  </span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{stat.label}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{stat.sub}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
```

When `!hasStats`, also drop the grid wrapper to a single centered column: change the outer grid class to `cn("grid grid-cols-1", hasStats && "@md:grid-cols-[1fr_1.1fr]")`. Delete the randomuser `<img>` block and its "Join 127+ satisfied clients" line entirely.

- [ ] **Step 2: ContactForm variant — live truth, demo form only in Sample**

Replace `ContactForm`'s right column: when `data.isSample`, keep today's read-only demo form; otherwise render real contact methods:

```tsx
        {data.isSample ? (
          /* existing mock form JSX unchanged */
        ) : (
          <div className="flex flex-col justify-center gap-3">
            {data.phone && (
              <a
                href={`tel:${data.phone.replace(/[^+\d]/g, "")}`}
                className="rounded-lg border px-4 py-3 text-sm transition-colors hover:underline"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}
              >
                Call {data.phone}
              </a>
            )}
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="rounded-lg border px-4 py-3 text-sm transition-colors hover:underline"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}
              >
                Email {data.email}
              </a>
            )}
            {data.instagram && (
              <a
                href={`https://instagram.com/${data.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-4 py-3 text-sm transition-colors hover:underline"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}
              >
                DM {data.instagram.startsWith("@") ? data.instagram : `@${data.instagram}`}
              </a>
            )}
            {!data.phone && !data.email && !data.instagram && (
              <SectionEmptyState
                message="Add contact details so clients can reach you."
                prompt={{ group: "contact-hours", label: "Add contact info" }}
                className="items-start px-0 py-0 text-left"
              />
            )}
          </div>
        )}
```

Add imports: `import { SectionEmptyState } from "@/components/studio-site/empty-states";` and `import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";`. Also change the left column's static copy `"...we'll get back to you within 24 hours."` to `"Questions about a custom piece? Reach us directly — we’d love to hear your idea."` (no promise we can't keep).

- [ ] **Step 3: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 4: Commit**

```bash
git add components/builder/preview/footer-cta-section.tsx
git commit -m "feat(builder): footer CTA renders only real stats and working contact actions"
```

---

### Task 14: Footer + Nav — real socials, filtered links, live Book CTA

**Files:**
- Modify: `components/builder/preview/template-footer.tsx`
- Modify: `components/builder/preview/template-nav-bar.tsx`

- [ ] **Step 1: Real social icons in the footer**

In `template-footer.tsx`, delete `SocialIcons` (the `◉ ✕ ◎` glyph row) and add:

```tsx
const SOCIAL_ICON_PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M15 3c.4 2.3 1.9 3.8 4.2 4v3.2c-1.6 0-3-.5-4.2-1.4v6.5A5.7 5.7 0 1 1 9.3 9.6v3.3a2.5 2.5 0 1 0 2.5 2.5V3H15z" />
  ),
  facebook: (
    <path d="M14 8h2.5V4.5H14c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3v-2c0-.6.4-1 1-1z" />
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
};

interface SocialLink { key: string; href: string; label: string }

function buildSocialLinks(d: StudioSiteData): SocialLink[] {
  const links: SocialLink[] = [];
  if (d.instagram) links.push({ key: "instagram", href: `https://instagram.com/${d.instagram.replace(/^@/, "")}`, label: "Instagram" });
  if (d.tiktok) links.push({ key: "tiktok", href: `https://tiktok.com/@${d.tiktok.replace(/^@/, "")}`, label: "TikTok" });
  if (d.facebook) links.push({ key: "facebook", href: d.facebook.startsWith("http") ? d.facebook : `https://facebook.com/${d.facebook}`, label: "Facebook" });
  if (d.website) links.push({ key: "website", href: d.website.startsWith("http") ? d.website : `https://${d.website}`, label: "Website" });
  return links;
}

function SocialIcons({ className }: { className?: string }) {
  const { data } = useStudioSite();
  const links = buildSocialLinks(data);
  if (links.length === 0) {
    return (
      <span className={className}>
        <PromptChip group="socials" label="Add social links" />
      </span>
    );
  }
  return (
    <div className={className} style={{ display: "flex", gap: "14px" }}>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {SOCIAL_ICON_PATHS[l.key]}
          </svg>
        </a>
      ))}
    </div>
  );
}
```

Add imports: `import { PromptChip } from "@/components/studio-site/empty-states";`, `import type { StudioSiteData } from "@/components/studio-site/studio-site-data";`. In `MinimalBarFooter`, replace its inline glyph row with `<SocialIcons className="order-first @md:order-last" />`.

- [ ] **Step 2: Truthful link groups**

Replace the static `linkGroups` constant with a data-driven builder and use it in `ColumnsFooter`:

```tsx
function useFooterLinkGroups() {
  const { data } = useStudioSite();
  const connect: { label: string; href: string }[] = [];
  if (data.instagram) connect.push({ label: "Instagram", href: `https://instagram.com/${data.instagram.replace(/^@/, "")}` });
  if (data.facebook) connect.push({ label: "Facebook", href: data.facebook.startsWith("http") ? data.facebook : `https://facebook.com/${data.facebook}` });
  if (data.email) connect.push({ label: "Email", href: `mailto:${data.email}` });
  if (data.phone) connect.push({ label: "Phone", href: `tel:${data.phone.replace(/[^+\d]/g, "")}` });

  return {
    studio: ["Portfolio", "Artists", "About", "Visit"],
    services: ["Booking", "Consultations", "Aftercare"],
    connect,
  };
}
```

In `ColumnsFooter`, render `studio`/`services` with the existing `FooterLink` (scroll/policy behavior unchanged), and `connect` as real `<a href>` elements styled identically (13px, `var(--text-secondary)`, accent on hover, `target="_blank" rel="noopener noreferrer"` for http links). Omit the Connect column entirely when `connect.length === 0`.

- [ ] **Step 3: Extract the scroll util**

Delete the local `scrollToSection` in `template-footer.tsx`; import and use `scrollToBuilderSection` from `@/lib/utils/scroll-to-section` (same behavior, shared). Map: `Portfolio→["gallery","artist-strips"]`, `Artists→["artist-strips"]`, `About→["about"]`, `Visit/Booking/Consultations→["footer-cta"]`.

- [ ] **Step 4: Nav Book Now truth**

In `template-nav-bar.tsx` `CtaButton`, wire like the hero:

```tsx
function CtaButton({ className }: { className?: string }) {
  const { config, data } = useStudioSite();
  const variant = CTA_STYLE_VARS[config.ctaStyle ?? "filled"];
  const shared: React.CSSProperties = {
    fontFamily: "var(--body-font)",
    fontSize: "13px",
    fontWeight: 600,
    padding: "8px 20px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    ...variant,
  };
  if (data.bookingLink) {
    return (
      <a href={data.bookingLink.url} target="_blank" rel="noopener noreferrer" className={className} style={{ ...shared, display: "inline-block", textDecoration: "none" }}>
        Book Now
      </a>
    );
  }
  return (
    <button type="button" className={className} style={shared} onClick={() => scrollToBuilderSection("footer-cta")}>
      Book Now
    </button>
  );
}
```

Add import `import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";`. Also make `NavLinks` items call `scrollToBuilderSection` on click (`Portfolio→["gallery","artist-strips"]`, `Artists→["artist-strips"]`, `About→["about"]`, `Contact→["footer-cta"]`) — and the three mobile menu variants' link items call the same then close the menu.

- [ ] **Step 5: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 6: Commit**

```bash
git add components/builder/preview/template-footer.tsx components/builder/preview/template-nav-bar.tsx
git commit -m "feat(builder): footer/nav render real socials and working navigation"
```

---

## Phase 3 — Upload Backend

### Task 15: Migration 011 — owner-scoped storage policies

**Files:**
- Create: `supabase/migrations/011_storage_owner_scoped.sql`

**Security context:** Migration 001 lets ANY authenticated user INSERT anywhere in `studio-images` and defines no UPDATE/DELETE policies. Uploads land at `{studioId}/{uuid}.webp`, so scope every write to studios the caller owns.

- [ ] **Step 1: Write the migration**

```sql
-- Owner-scoped storage access for studio-images.
-- 001's insert policy allowed any authenticated user to write anywhere in the
-- bucket and nobody could update/delete. Object paths are {studio_id}/{uuid}.ext;
-- scope all writes to studios the caller has claimed. Public read unchanged.

drop policy if exists "Studio owners can upload images" on storage.objects;

create policy "Owners upload to own studio folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(name))[1]
        and s.claimed_by = auth.uid()
    )
  );

create policy "Owners update own studio images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(name))[1]
        and s.claimed_by = auth.uid()
    )
  );

create policy "Owners delete own studio images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(name))[1]
        and s.claimed_by = auth.uid()
    )
  );
```

- [ ] **Step 2: Verify target project, then apply**

1. Read `.env.local` `NEXT_PUBLIC_SUPABASE_URL` and confirm host is `cktvpfenygxhfaodihbz.supabase.co`. **STOP if it is anything else.**
2. Apply with the Supabase MCP: `apply_migration(project_id: "cktvpfenygxhfaodihbz", name: "storage_owner_scoped", query: <SQL above>)`.
3. Run `get_advisors(project_id: "cktvpfenygxhfaodihbz", type: "security")` — expect no new findings about `storage.objects`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/011_storage_owner_scoped.sql
git commit -m "fix(storage): owner-scoped insert/update/delete policies for studio-images"
```

---

### Task 16: Client image pipeline

**Files:**
- Create: `lib/utils/image-upload.ts`
- Modify: `scripts/check-builder.ts`

**Interfaces:**
- Produces (from `@/lib/utils/image-upload`):
  ```ts
  const IMAGE_LIMITS: { maxSourceBytes: number; maxGalleryPhotos: number; minEdgeWarn: number };
  type UploadKind = "gallery" | "cover";
  function storagePathFromPublicUrl(url: string): string | null;           // pure — checked
  async function compressImage(file: File, kind: UploadKind): Promise<{ blob: Blob; width: number; height: number; lowRes: boolean }>;
  async function uploadStudioImage(supabase: SupabaseClient, studioId: string, file: File, kind: UploadKind):
    Promise<{ ok: true; url: string; lowRes: boolean } | { ok: false; error: string }>;
  async function deleteStudioImage(supabase: SupabaseClient, url: string): Promise<boolean>;
  ```

- [ ] **Step 1: Failing assert for the pure part**

Append to `scripts/check-builder.ts`:

```ts
// ─── Upload path parsing ─────────────────────────────────────────────────
import { storagePathFromPublicUrl } from "../lib/utils/image-upload";

check("storagePathFromPublicUrl extracts bucket-relative path", () => {
  assert.equal(
    storagePathFromPublicUrl(
      "https://cktvpfenygxhfaodihbz.supabase.co/storage/v1/object/public/studio-images/abc-123/photo.webp",
    ),
    "abc-123/photo.webp",
  );
  assert.equal(storagePathFromPublicUrl("https://example.com/not-storage.png"), null);
});
```

Run → Expected: FAIL (module not found).

- [ ] **Step 2: Create `lib/utils/image-upload.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Free-tier-safe client image pipeline: decode (EXIF-orientation aware) →
 * canvas re-encode (strips EXIF/GPS by construction) → WebP with JPEG
 * fallback → Supabase Storage at studio-images/{studioId}/{uuid}.{ext}.
 * No server-side transforms (paid tier) are ever requested.
 */

export const IMAGE_LIMITS = {
  maxSourceBytes: 10 * 1024 * 1024, // 10 MB source cap
  maxGalleryPhotos: 30,             // soft cap keeps page weight + free tier sane
  minEdgeWarn: 800,                 // below this we warn "may look blurry"
} as const;

export type UploadKind = "gallery" | "cover";

const MAX_EDGE: Record<UploadKind, number> = { gallery: 1600, cover: 2400 };
const BUCKET = "studio-images";
const MARKER = `/storage/v1/object/public/${BUCKET}/`;

/** Bucket-relative path from a public URL; null when not a studio-images URL. */
export function storagePathFromPublicUrl(url: string): string | null {
  const idx = url.indexOf(MARKER);
  if (idx === -1) return null;
  const path = url.slice(idx + MARKER.length);
  return path.length > 0 ? decodeURIComponent(path) : null;
}

async function encodeCanvas(canvas: HTMLCanvasElement): Promise<{ blob: Blob; ext: string }> {
  const tryType = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await tryType("image/webp", 0.8);
  // Older Safari cannot encode WebP from canvas — fall back to JPEG.
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpeg = await tryType("image/jpeg", 0.82);
  if (jpeg) return { blob: jpeg, ext: "jpg" };
  throw new Error("encode-failed");
}

export async function compressImage(
  file: File,
  kind: UploadKind,
): Promise<{ blob: Blob; ext: string; width: number; height: number; lowRes: boolean }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("unsupported-format");
  }
  const maxEdge = MAX_EDGE[kind];
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("encode-failed");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const { blob, ext } = await encodeCanvas(canvas);
  const lowRes = Math.max(width, height) < IMAGE_LIMITS.minEdgeWarn;
  return { blob, ext, width, height, lowRes };
}

const ERROR_MESSAGES: Record<string, string> = {
  "too-large": "That photo is over 10 MB — pick a smaller one.",
  "unsupported-format": "That format isn't supported — export as JPG or PNG and try again.",
  "encode-failed": "Couldn't process that photo — try a different one.",
  "upload-failed": "Upload failed — check your connection and retry.",
};

export async function uploadStudioImage(
  supabase: SupabaseClient,
  studioId: string,
  file: File,
  kind: UploadKind,
): Promise<{ ok: true; url: string; lowRes: boolean } | { ok: false; error: string }> {
  if (file.size > IMAGE_LIMITS.maxSourceBytes) {
    return { ok: false, error: ERROR_MESSAGES["too-large"]! };
  }
  try {
    const { blob, ext, lowRes } = await compressImage(file, kind);
    const path = `${studioId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) return { ok: false, error: ERROR_MESSAGES["upload-failed"]! };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, lowRes };
  } catch (e) {
    const key = e instanceof Error ? e.message : "upload-failed";
    return { ok: false, error: ERROR_MESSAGES[key] ?? ERROR_MESSAGES["upload-failed"]! };
  }
}

/**
 * Best-effort storage removal. Callers MUST persist the array/field change
 * FIRST (a dangling object is harmless; a broken image on a live site is not).
 */
export async function deleteStudioImage(supabase: SupabaseClient, url: string): Promise<boolean> {
  const path = storagePathFromPublicUrl(url);
  if (!path) return false;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}
```

- [ ] **Step 3: Verify** — `npx tsx scripts/check-builder.ts` all pass; `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/utils/image-upload.ts scripts/check-builder.ts
git commit -m "feat(builder): client-side compressed image upload pipeline"
```

---

## Phase 4 — Content Panel

### Task 17: Panel shell, group registry, Story + Socials groups

**Files:**
- Create: `components/builder/content-panel/content-panel-shell.tsx`
- Create: `components/builder/content-panel/fields.tsx`
- Create: `components/builder/content-panel/group-section.tsx`
- Create: `components/builder/content-panel/story-group.tsx`
- Create: `components/builder/content-panel/socials-group.tsx`
- Create: `components/builder/content-panel/groups.ts` (registry — later tasks append entries)
- Create: `components/builder/content-panel/index.tsx`

**Interfaces:**
- Produces:
  - `CONTENT_GROUPS: { id: ContentGroup; title: string; Component: React.FC }[]` from `./groups` — Tasks 18–19 append entries; Task 20 renders the registry in all three containers.
  - `<BuilderContentPanel />` (overlay drawer; reads `useBuilder().contentPanel`, scrolls to + highlights the active group).
  - `<ContentGroupList activeGroup?: ContentGroup />` — the stacked groups, reused by the docked (split) and mobile containers.
  - Field primitives from `./fields`: `PanelInput`, `PanelTextarea`, `PANEL_SELECT_CLASS` (chrome-styled), and `useSavedFlash(): { saved: boolean; flash: () => void }`.
  - `GroupSection({ id, title, saved, children })` — anchor + header + "Saved ✓" indicator.

- [ ] **Step 1: Field primitives — `components/builder/content-panel/fields.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Chrome-styled form primitives for the builder Content panel (dark shell). */

export const PANEL_SELECT_CLASS =
  "w-full rounded-lg border border-chrome-border bg-chrome-surface px-2.5 py-2 text-xs text-chrome-text-primary outline-none transition-colors focus:border-ink-red";

export function PanelInput({
  label,
  value,
  onCommit,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  // Re-sync when upstream value changes (e.g. dashboard edit in another tab section)
  useEffect(() => setLocal(value), [value]);

  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {label}
      </span>
      <input
        type={type}
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onCommit(local);
        }}
        className="w-full rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
      />
    </label>
  );
}

export function PanelTextarea({
  label,
  value,
  onCommit,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
        {label}
      </span>
      <textarea
        rows={rows}
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onCommit(local);
        }}
        className="w-full resize-y rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs leading-relaxed text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
      />
    </label>
  );
}

/** Autosave feedback: flash a "Saved" tick for 1.6s after each commit. */
export function useSavedFlash(): { saved: boolean; flash: () => void } {
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback(() => {
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 1600);
  }, []);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return { saved, flash };
}
```

- [ ] **Step 2: Group wrapper — `components/builder/content-panel/group-section.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";

export function GroupSection({
  id,
  title,
  saved,
  highlighted,
  children,
}: {
  id: ContentGroup;
  title: string;
  saved?: boolean;
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-content-group={id}
      className={cn(
        "rounded-xl border p-4 transition-shadow duration-500",
        highlighted
          ? "border-ink-red/60 shadow-[0_0_0_1px_rgba(255,51,51,0.25)]"
          : "border-chrome-border",
        "bg-ink-black-raised",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-tertiary">
          {title}
        </h3>
        <span
          aria-live="polite"
          className={cn(
            "flex items-center gap-1 text-[10px] font-semibold text-ink-sage transition-opacity duration-300",
            saved ? "opacity-100" : "opacity-0",
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M1.5 5.5 4 8l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Saved
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: Story group — `components/builder/content-panel/story-group.tsx`**

```tsx
"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import { studioSpecialtyOptions } from "@/lib/data/signup-styles";
import { ToggleRow } from "@/components/builder/controls";
import { cn } from "@/lib/utils";
import { GroupSection } from "./group-section";
import { PanelTextarea, useSavedFlash } from "./fields";
import type { StudioService } from "@/lib/types";

export function StoryGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();

  const specialties = studio?.specialties ?? [];
  const services = studio?.services ?? [];

  const commit = (partial: Parameters<typeof update>[0]) => {
    void update(partial).then(flash);
  };

  const toggleSpecialty = (tag: string) => {
    const next = specialties.includes(tag)
      ? specialties.filter((t) => t !== tag)
      : [...specialties, tag];
    commit({ specialties: next });
  };

  const toggleService = (service: StudioService, on: boolean) => {
    const next = on
      ? Array.from(new Set([...services, service]))
      : services.filter((s) => s !== service);
    commit({ services: next as ("walk-ins" | "piercing")[] });
  };

  return (
    <GroupSection id="story" title="Story" saved={saved} highlighted={highlighted}>
      <PanelTextarea
        label="About / Story"
        value={studio?.bio ?? ""}
        onCommit={(bio) => commit({ bio })}
        placeholder="Tell your studio's story..."
      />

      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Specialties
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Specialties">
          {studioSpecialtyOptions.map((tag) => {
            const active = specialties.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSpecialty(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors",
                  active
                    ? "border-ink-red bg-ink-red/10 text-ink-red"
                    : "border-chrome-border bg-chrome-surface text-chrome-text-dim hover:border-chrome-border-hover hover:text-chrome-text-secondary",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <ToggleRow
          label="Walk-ins welcome"
          checked={services.includes("walk-ins")}
          onChange={(v) => toggleService("walk-ins", v)}
        />
        <ToggleRow
          label="Piercing available"
          checked={services.includes("piercing")}
          onChange={(v) => toggleService("piercing", v)}
        />
      </div>
    </GroupSection>
  );
}
```

*(If `studioSpecialtyOptions` in `lib/data/signup-styles.ts` exports objects rather than strings, adapt to its actual shape — read that file before this step; it is the same source the dashboard edit panel uses.)*

- [ ] **Step 4: Socials group — `components/builder/content-panel/socials-group.tsx`**

```tsx
"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import { GroupSection } from "./group-section";
import { PanelInput, useSavedFlash } from "./fields";

export function SocialsGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const commit = (partial: Parameters<typeof update>[0]) => {
    void update(partial).then(flash);
  };

  return (
    <GroupSection id="socials" title="Social Links" saved={saved} highlighted={highlighted}>
      <PanelInput label="Instagram" value={studio?.instagram ?? ""} onCommit={(instagram) => commit({ instagram })} placeholder="@yourstudio" />
      <PanelInput label="TikTok" value={studio?.tiktok ?? ""} onCommit={(tiktok) => commit({ tiktok })} placeholder="@yourstudio" />
      <PanelInput label="Facebook" value={studio?.facebook ?? ""} onCommit={(facebook) => commit({ facebook })} placeholder="facebook.com/yourstudio" />
      <PanelInput label="Website" value={studio?.website ?? ""} onCommit={(website) => commit({ website })} placeholder="https://yourstudio.com" />
    </GroupSection>
  );
}
```

- [ ] **Step 5: Registry + list + overlay shell**

`components/builder/content-panel/groups.ts`:

```ts
import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { StoryGroup } from "./story-group";
import { SocialsGroup } from "./socials-group";

export interface ContentGroupDef {
  id: ContentGroup;
  title: string;
  Component: React.FC<{ highlighted?: boolean }>;
}

/** Ordered registry — Tasks 18–19 add contact-hours, booking, artists, photos. */
export const CONTENT_GROUPS: ContentGroupDef[] = [
  { id: "story", title: "Story", Component: StoryGroup },
  { id: "socials", title: "Social Links", Component: SocialsGroup },
];
```

`components/builder/content-panel/content-panel-shell.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { CONTENT_GROUPS } from "./groups";

/** Stacked content groups; scrolls to + highlights the active group. */
export function ContentGroupList({ activeGroup }: { activeGroup?: ContentGroup }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeGroup || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-content-group="${activeGroup}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeGroup]);

  return (
    <div ref={listRef} className="space-y-3">
      {CONTENT_GROUPS.map(({ id, Component }) => (
        <Component key={id} highlighted={id === activeGroup} />
      ))}
    </div>
  );
}

/**
 * Overlay drawer for inline mode. Chrome-styled (always-dark editor shell),
 * focus-trapped, focus returns to the invoking element on close.
 */
export function BuilderContentPanel() {
  const { contentPanel, closeContentPanel } = useBuilder();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Focus management: remember invoker, focus panel, restore on close.
  useEffect(() => {
    if (contentPanel.open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    }
  }, [contentPanel.open]);

  // Escape closes; Tab cycles within the panel (minimal focus trap).
  useEffect(() => {
    if (!contentPanel.open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeContentPanel();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contentPanel.open, closeContentPanel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={closeContentPanel}
        className={cn(
          "fixed inset-0 z-[210] bg-ink-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          "motion-reduce:transition-none",
          contentPanel.open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Studio content"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-[220] flex h-full w-full max-w-[400px] flex-col",
          "border-l border-chrome-border bg-chrome-surface shadow-2xl outline-none",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "motion-reduce:transition-none",
          contentPanel.open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-chrome-border px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-chrome-text-dim">
            Studio Content
          </span>
          <button
            type="button"
            onClick={closeContentPanel}
            aria-label="Close content panel"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-chrome-raised text-chrome-text-tertiary transition-colors hover:bg-chrome-border hover:text-chrome-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-red/60"
          >
            <span className="text-sm leading-none select-none">&times;</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {contentPanel.open && <ContentGroupList activeGroup={contentPanel.group} />}
        </div>
      </div>
    </>,
    document.body,
  );
}
```

`components/builder/content-panel/index.tsx`:

```ts
export { BuilderContentPanel, ContentGroupList } from "./content-panel-shell";
export { CONTENT_GROUPS } from "./groups";
```

- [ ] **Step 6: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 7: Commit**

```bash
git add components/builder/content-panel/
git commit -m "feat(builder): content panel shell with Story and Socials groups"
```

---

### Task 18: Contact & Hours, Booking, Artists groups

**Files:**
- Create: `components/builder/content-panel/contact-hours-group.tsx`
- Create: `components/builder/content-panel/booking-group.tsx`
- Create: `components/builder/content-panel/artists-group.tsx`
- Modify: `components/builder/content-panel/groups.ts` (register)

**Interfaces:**
- Consumes: `useStudio().update` (merge-patch), `STUDIO_HOUR_OPTIONS` from `@/lib/constants/schedule`, `getPlatformsByCategory("booking")` + `isValidIntegrationUrl` + `connectIntegration`/`disconnectIntegration` from integration helpers, `getBookingLink` (Task 3), `useBuilder().liveContent` (Task 5).

- [ ] **Step 1: `contact-hours-group.tsx`**

```tsx
"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import { STUDIO_HOUR_OPTIONS } from "@/lib/constants/schedule";
import type { BusinessHours } from "@/lib/repositories";
import { GroupSection } from "./group-section";
import { PanelInput, PANEL_SELECT_CLASS, useSavedFlash } from "./fields";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_DAY = { open: "10:00 AM", close: "6:00 PM", closed: false };

export function ContactHoursGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const hours: BusinessHours = studio?.hours ?? {};

  const commit = (partial: Parameters<typeof update>[0]) => {
    void update(partial).then(flash);
  };

  const setDay = (day: string, patch: Partial<(typeof DEFAULT_DAY)>) => {
    const current = hours[day] ?? { ...DEFAULT_DAY };
    commit({ hours: { ...hours, [day]: { ...current, ...patch } } });
  };

  return (
    <GroupSection id="contact-hours" title="Contact & Hours" saved={saved} highlighted={highlighted}>
      <div className="grid grid-cols-2 gap-2">
        <PanelInput label="Phone" type="tel" value={studio?.phone ?? ""} onCommit={(phone) => commit({ phone })} placeholder="(555) 555-0142" />
        <PanelInput label="Email" type="email" value={studio?.email ?? ""} onCommit={(email) => commit({ email })} placeholder="studio@email.com" />
      </div>
      <PanelInput label="Street Address" value={studio?.address ?? ""} onCommit={(address) => commit({ address })} placeholder="123 Main St" />
      <div className="grid grid-cols-3 gap-2">
        <PanelInput label="City" value={studio?.city ?? ""} onCommit={(city) => commit({ city })} placeholder="City" />
        <PanelInput label="State" value={studio?.state ?? ""} onCommit={(state) => commit({ state })} placeholder="OR" />
        <PanelInput label="Zip" value={studio?.zipCode ?? ""} onCommit={(zipCode) => commit({ zipCode })} placeholder="97214" />
      </div>

      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Weekly Hours
        </span>
        <div className="space-y-1.5">
          {DAYS.map((day) => {
            const h = hours[day] ?? { ...DEFAULT_DAY, closed: true };
            return (
              <div key={day} className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={!h.closed}
                  aria-label={`${day} open`}
                  onClick={() => setDay(day, { closed: !h.closed })}
                  className={cn(
                    "w-[72px] shrink-0 rounded-md border px-2 py-1.5 text-left text-[10px] font-semibold transition-colors",
                    h.closed
                      ? "border-chrome-border text-chrome-text-faint"
                      : "border-ink-red/50 bg-ink-red/10 text-ink-red",
                  )}
                >
                  {day.slice(0, 3)}
                </button>
                {h.closed ? (
                  <span className="text-[10px] text-chrome-text-faint">Closed</span>
                ) : (
                  <>
                    <select value={h.open} onChange={(e) => setDay(day, { open: e.target.value })} aria-label={`${day} open time`} className={PANEL_SELECT_CLASS}>
                      {STUDIO_HOUR_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-[10px] text-chrome-text-faint">&ndash;</span>
                    <select value={h.close} onChange={(e) => setDay(day, { close: e.target.value })} aria-label={`${day} close time`} className={PANEL_SELECT_CLASS}>
                      {STUDIO_HOUR_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GroupSection>
  );
}
```

- [ ] **Step 2: `booking-group.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useStudio } from "@/lib/providers/studio-provider";
import { getPlatformsByCategory } from "@/lib/data/integration-platforms";
import {
  connectIntegration,
  disconnectIntegration,
  isValidIntegrationUrl,
} from "@/lib/utils/integration-helpers";
import { getBookingLink } from "@/lib/utils/studio-content";
import type { IntegrationPlatform } from "@/lib/types/integrations";
import { GroupSection } from "./group-section";
import { PANEL_SELECT_CLASS, useSavedFlash } from "./fields";

const BOOKING_PLATFORMS = getPlatformsByCategory("booking");

export function BookingGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const active = getBookingLink(studio?.integrations);

  const [platformId, setPlatformId] = useState<IntegrationPlatform>("other-booking");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const platform = BOOKING_PLATFORMS.find((p) => p.id === platformId) ?? BOOKING_PLATFORMS[BOOKING_PLATFORMS.length - 1]!;

  const handleConnect = () => {
    if (!isValidIntegrationUrl(platform.id, url)) {
      setError(`That doesn't look like a ${platform.name} URL.`);
      return;
    }
    setError(null);
    void update(connectIntegration(studio?.integrations, platform.id, "integrate", url)).then(() => {
      setUrl("");
      flash();
    });
  };

  return (
    <GroupSection id="booking" title="Booking Link" saved={saved} highlighted={highlighted}>
      {active ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-chrome-text-light">{active.platformName}</p>
            <p className="truncate text-[10px] text-chrome-text-dim">{active.url}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const connected = BOOKING_PLATFORMS.find(
                (p) => studio?.integrations?.[p.id]?.linkUrl === active.url,
              );
              if (connected) {
                void update(disconnectIntegration(studio?.integrations, connected.id)).then(flash);
              }
            }}
            className="shrink-0 text-[10px] font-semibold text-chrome-text-dim transition-colors hover:text-ink-red"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] leading-relaxed text-chrome-text-dim">
            Your site&rsquo;s &ldquo;Book Now&rdquo; buttons point here. Without a link, they show your contact info instead.
          </p>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">Platform</span>
            <select value={platformId} onChange={(e) => setPlatformId(e.target.value as IntegrationPlatform)} className={PANEL_SELECT_CLASS}>
              {BOOKING_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">Booking URL</span>
            <input
              type="url"
              value={url}
              placeholder={platform.urlPlaceholder}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              className="w-full rounded-lg border border-chrome-border bg-chrome-surface px-3 py-2.5 text-xs text-chrome-text-primary placeholder-chrome-text-faint outline-none transition-colors focus:border-ink-red"
            />
          </label>
          {error && <p role="alert" className="text-[10px] font-medium text-ink-red">{error}</p>}
          <button
            type="button"
            onClick={handleConnect}
            disabled={url.length === 0}
            className="w-full rounded-lg border border-ink-red bg-ink-red/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-red transition-colors hover:bg-ink-red/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connect Booking Link
          </button>
        </>
      )}
    </GroupSection>
  );
}
```

- [ ] **Step 3: `artists-group.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useBuilder } from "@/components/builder/builder-provider";
import { GroupSection } from "./group-section";

export function ArtistsGroup({ highlighted }: { highlighted?: boolean }) {
  const { liveContent } = useBuilder();

  return (
    <GroupSection id="artists" title="Artists" highlighted={highlighted}>
      <p className="text-[11px] leading-relaxed text-chrome-text-dim">
        Your artist lineup comes from your roster &mdash; artists you add or approve
        appear here automatically with their portfolios.
      </p>
      {liveContent.artists.length > 0 ? (
        <p className="text-[11px] font-semibold text-chrome-text-light">
          {liveContent.artists.length} artist{liveContent.artists.length === 1 ? "" : "s"} on your roster
        </p>
      ) : (
        <p className="text-[11px] text-chrome-text-faint">No artists on your roster yet.</p>
      )}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="rounded-lg border border-chrome-border-hover px-3 py-2 text-[11px] font-semibold text-chrome-text-secondary transition-colors hover:border-chrome-text-dim hover:text-white"
        >
          Manage roster
        </Link>
        <button
          type="button"
          onClick={liveContent.refresh}
          className="rounded-lg border border-chrome-border px-3 py-2 text-[11px] font-semibold text-chrome-text-dim transition-colors hover:text-chrome-text-secondary"
        >
          Refresh
        </button>
      </div>
    </GroupSection>
  );
}
```

- [ ] **Step 4: Register in `groups.ts`**

```ts
import { ContactHoursGroup } from "./contact-hours-group";
import { BookingGroup } from "./booking-group";
import { ArtistsGroup } from "./artists-group";
```

and the array becomes (photos added in Task 19):

```ts
export const CONTENT_GROUPS: ContentGroupDef[] = [
  { id: "story", title: "Story", Component: StoryGroup },
  { id: "contact-hours", title: "Contact & Hours", Component: ContactHoursGroup },
  { id: "socials", title: "Social Links", Component: SocialsGroup },
  { id: "booking", title: "Booking Link", Component: BookingGroup },
  { id: "artists", title: "Artists", Component: ArtistsGroup },
];
```

- [ ] **Step 5: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 6: Commit**

```bash
git add components/builder/content-panel/
git commit -m "feat(builder): contact-hours, booking, artists content groups"
```

---

### Task 19: Photos group — cover + gallery manager

**Files:**
- Create: `components/builder/content-panel/photos-group.tsx`
- Modify: `components/builder/content-panel/groups.ts` (register after "story")

**Interfaces:**
- Consumes: `uploadStudioImage`/`deleteStudioImage`/`IMAGE_LIMITS` (Task 16), `useStudio()` (`studio.id`, `studio.images`, `studio.coverImage`, `update`), `createClient` from `@/lib/supabase/client`.

- [ ] **Step 1: Create `photos-group.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { useStudio } from "@/lib/providers/studio-provider";
import { createClient } from "@/lib/supabase/client";
import {
  uploadStudioImage,
  deleteStudioImage,
  IMAGE_LIMITS,
  type UploadKind,
} from "@/lib/utils/image-upload";
import { GroupSection } from "./group-section";
import { useSavedFlash } from "./fields";
import { cn } from "@/lib/utils";

export function PhotosGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"cover" | "gallery" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const images = studio?.images ?? [];
  const studioId = studio?.id;
  const atCap = images.length >= IMAGE_LIMITS.maxGalleryPhotos;

  const runUpload = async (files: FileList | null, kind: UploadKind) => {
    if (!files || files.length === 0) return;
    if (!studioId) {
      setError("Save your studio once from the dashboard before uploading photos.");
      return;
    }
    setError(null);
    setNotice(null);
    setBusy(kind === "cover" ? "cover" : "gallery");
    const supabase = createClient();
    let lowResSeen = false;
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      if (kind === "gallery" && images.length + uploaded.length >= IMAGE_LIMITS.maxGalleryPhotos) {
        setNotice(`Gallery cap is ${IMAGE_LIMITS.maxGalleryPhotos} photos — extra files were skipped.`);
        break;
      }
      const result = await uploadStudioImage(supabase, studioId, file, kind);
      if (!result.ok) {
        setError(result.error);
        break;
      }
      lowResSeen = lowResSeen || result.lowRes;
      uploaded.push(result.url);
      if (kind === "cover") break; // single slot
    }

    if (uploaded.length > 0) {
      if (kind === "cover") {
        const previous = studio?.coverImage;
        await update({ coverImage: uploaded[0] });
        if (previous) void deleteStudioImage(supabase, previous);
      } else {
        await update({ images: [...images, ...uploaded] });
      }
      flash();
    }
    if (lowResSeen) setNotice("Some photos are under 800px — they may look blurry on large screens.");
    setBusy(null);
  };

  const removeGalleryImage = async (url: string) => {
    // DB first — a dangling storage object is harmless, a broken image is not.
    await update({ images: images.filter((u) => u !== url) });
    flash();
    void deleteStudioImage(createClient(), url);
  };

  const removeCover = async () => {
    const previous = studio?.coverImage;
    await update({ coverImage: undefined });
    flash();
    if (previous) void deleteStudioImage(createClient(), previous);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    void update({ images: next }).then(flash);
  };

  return (
    <GroupSection id="photos" title="Photos" saved={saved} highlighted={highlighted}>
      {/* Cover image */}
      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Cover Photo
        </span>
        {studio?.coverImage ? (
          <div className="relative overflow-hidden rounded-lg border border-chrome-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={studio.coverImage} alt="Cover" className="h-28 w-full object-cover" />
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              <button type="button" onClick={() => coverInputRef.current?.click()} className="rounded bg-ink-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink-black/90">
                Replace
              </button>
              <button type="button" onClick={removeCover} className="rounded bg-ink-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:text-ink-red">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={busy === "cover"}
            className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-chrome-border-hover text-[11px] font-semibold text-chrome-text-dim transition-colors hover:border-chrome-text-faint disabled:opacity-50"
          >
            {busy === "cover" ? "Uploading…" : "Upload cover photo"}
          </button>
        )}
      </div>

      {/* Gallery */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
            Gallery ({images.length}/{IMAGE_LIMITS.maxGalleryPhotos})
          </span>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={busy === "gallery" || atCap}
            className="rounded-md border border-chrome-border-hover px-2 py-1 text-[10px] font-semibold text-chrome-text-secondary transition-colors hover:text-white disabled:opacity-40"
          >
            {busy === "gallery" ? "Uploading…" : "Add photos"}
          </button>
        </div>

        {images.length === 0 ? (
          <p className="text-[10px] text-chrome-text-faint">
            No photos yet. JPG/PNG up to 10 MB — we compress them automatically.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-chrome-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
                <div className={cn(
                  "absolute inset-x-0 bottom-0 flex justify-between bg-ink-black/70 px-1 py-0.5 backdrop-blur-sm",
                  "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                )}>
                  <button type="button" aria-label={`Move photo ${i + 1} earlier`} onClick={() => move(i, -1)} disabled={i === 0} className="px-1 text-[11px] text-white disabled:opacity-30">&larr;</button>
                  <button type="button" aria-label={`Delete photo ${i + 1}`} onClick={() => removeGalleryImage(url)} className="px-1 text-[11px] text-white transition-colors hover:text-ink-red">&times;</button>
                  <button type="button" aria-label={`Move photo ${i + 1} later`} onClick={() => move(i, 1)} disabled={i === images.length - 1} className="px-1 text-[11px] text-white disabled:opacity-30">&rarr;</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-[10px] font-medium text-ink-red">{error}</p>}
      {notice && <p className="text-[10px] font-medium text-ink-gold">{notice}</p>}

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void runUpload(e.target.files, "cover"); e.target.value = ""; }} />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void runUpload(e.target.files, "gallery"); e.target.value = ""; }} />
    </GroupSection>
  );
}
```

- [ ] **Step 2: Register** — in `groups.ts` add `import { PhotosGroup } from "./photos-group";` and insert `{ id: "photos", title: "Photos", Component: PhotosGroup },` directly after the `story` entry.

- [ ] **Step 3: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 4: Commit**

```bash
git add components/builder/content-panel/
git commit -m "feat(builder): photos group with compressed cover/gallery uploads"
```

---

### Task 20: Panel reachable everywhere — popover tabs, split dock, toolbar, mobile

**Files:**
- Modify: `app/dashboard/builder/page.tsx` (mount overlay panel in inline mode)
- Modify: `components/builder/section-popover.tsx` (Style/Content tabs)
- Modify: `components/builder/inline-overlay-builder.tsx` (pass section groups; toolbar Content button)
- Modify: `components/builder/bottom-toolbar.tsx` (+Content button)
- Modify: `components/builder/editor-panel.tsx` (Content | Style segmented switch)
- Modify: `components/builder/mobile/mobile-mini-bar.tsx` + `components/builder/mobile/mobile-control-sheet.tsx` (content sheet)

**Interfaces:**
- Produces: `SECTION_CONTENT_GROUP: Record<string, ContentGroup>` in `lib/config/builder-sections.ts` — the canonical section→group mapping every surface uses:

```ts
import type { ContentGroup } from "@/components/studio-site/studio-site-context";

/** Which Content-panel group edits each section's data. */
export const SECTION_CONTENT_GROUP: Record<string, ContentGroup> = {
  nav: "booking",
  hero: "photos",
  gallery: "photos",
  about: "story",
  "artist-strips": "artists",
  details: "contact-hours",
  "footer-cta": "booking",
  footer: "socials",
};
```

(Files addendum — Modify: `lib/config/builder-sections.ts`.)

- [ ] **Step 1: Mount the overlay panel (inline + split desktop)**

In `app/dashboard/builder/page.tsx`, add `import { BuilderContentPanel } from "@/components/builder/content-panel";` and render `<BuilderContentPanel />` as the last child inside `<BuilderProvider>` in BOTH desktop returns (inline and split) and the mobile return. (One overlay drawer serves all modes; the split dock below is an *additional* always-visible home.)

- [ ] **Step 2: SectionPopover gains Style | Content tabs**

Replace `SectionPopoverProps` and header in `components/builder/section-popover.tsx`:

```tsx
interface SectionPopoverProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** When set, the popover shows a Content tab that hands off to the Content panel. */
  contentGroup?: ContentGroup;
  contentSummary?: string;
}
```

Inside the component add `const [tab, setTab] = useState<"style" | "content">("style");` (reset via `useEffect(() => { if (isOpen) setTab("style"); }, [isOpen]);`), replace the header `<span>` with two tab buttons when `contentGroup` exists:

```tsx
        {contentGroup ? (
          <div className="flex gap-1" role="tablist" aria-label={title}>
            {(["style", "content"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  tab === t ? "bg-ink-red/15 text-ink-red" : "text-chrome-text-dim hover:text-chrome-text-secondary",
                )}
              >
                {t === "style" ? "Style" : "Content"}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-[11px] font-medium uppercase tracking-wider text-chrome-text-dim">{title}</span>
        )}
```

and the body:

```tsx
      <div className="max-h-[400px] overflow-y-auto p-3">
        {tab === "content" && contentGroup ? (
          <div className="space-y-3">
            {contentSummary && (
              <p className="text-[11px] leading-relaxed text-chrome-text-dim">{contentSummary}</p>
            )}
            <button
              type="button"
              onClick={() => {
                openContentPanel(contentGroup);
                onClose();
              }}
              className="w-full rounded-lg border border-ink-red bg-ink-red/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-red transition-colors hover:bg-ink-red/20"
            >
              Edit Content
            </button>
          </div>
        ) : (
          children
        )}
      </div>
```

with `const { openContentPanel } = useBuilder();` (import `useBuilder`, `ContentGroup` type, `useState`, `cn` already present).

In `inline-overlay-builder.tsx`, pass the mapping into each popover:

```tsx
              <SectionPopover
                title={section.title}
                isOpen={activeSection === section.id}
                onClose={() => setActiveSection(null)}
                contentGroup={SECTION_CONTENT_GROUP[section.id]}
                contentSummary={`Edit the real studio data this section displays.`}
              >
```

(import `SECTION_CONTENT_GROUP` from `@/lib/config/builder-sections`).

- [ ] **Step 3: Bottom toolbar Content button**

In `bottom-toolbar.tsx` add an optional prop `onOpenContent?: () => void;` and render before the tab buttons:

```tsx
      {onOpenContent && (
        <>
          <button
            type="button"
            onClick={onOpenContent}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-chrome-text-secondary transition-colors hover:bg-chrome-raised hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Content
          </button>
          <Divider />
        </>
      )}
```

In `inline-overlay-builder.tsx` pass `onOpenContent={() => editor.openContentPanel()}` (the `editor` from `useBuilder()` now includes it — destructure `openContentPanel`).

- [ ] **Step 4: Split mode — docked Content view**

In `editor-panel.tsx`, add a top-level view switch that also auto-follows panel-open requests:

```tsx
import { ContentGroupList } from "@/components/builder/content-panel";
```

```tsx
export function EditorPanel() {
  const { config, applyChange, contentPanel } = useBuilder();
  const tier = config.builderTier ?? "flash";
  const [view, setView] = useState<"content" | "style">("style");

  // Chip/checklist deep-links land in the docked view in split mode.
  useEffect(() => {
    if (contentPanel.open) setView("content");
  }, [contentPanel.open, contentPanel.group]);
```

Replace the header row's right side so the segmented Content|Style control sits beside the tier badges:

```tsx
      <div className="flex items-center justify-between border-b border-chrome-border px-4 py-2">
        <div className="flex gap-1">
          {(["content", "style"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors",
                view === v ? "bg-ink-red/15 text-ink-red" : "bg-transparent text-chrome-text-faint hover:text-chrome-text-secondary",
              )}
            >
              {v === "content" ? "Content" : "Style"}
            </button>
          ))}
        </div>
        {view === "style" && (
          <div className="flex gap-1">{/* existing Flash/Custom buttons unchanged */}</div>
        )}
      </div>

      {view === "content" ? (
        <div className="flex-1 overflow-y-auto p-4">
          <ContentGroupList activeGroup={contentPanel.group} />
        </div>
      ) : tier === "flash" ? (
        <FlashEditor />
      ) : (
        <CustomEditor />
      )}
```

**Split-mode overlay suppression:** in `app/dashboard/builder/page.tsx` mount `<BuilderContentPanel />` ONLY in the inline and mobile returns (NOT split) — split mode's home is the dock. Correct Step 1 accordingly: inline return + mobile return only.

- [ ] **Step 5: Mobile — Content in the mini-bar + sheet**

`mobile-mini-bar.tsx`: prepend a Content button before the mapped tabs:

```tsx
  const { openContentPanel, contentPanel } = useBuilder();
```

```tsx
        <button
          type="button"
          onClick={() => openContentPanel()}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors active:bg-white/5",
            contentPanel.open ? "text-ink-red" : "text-chrome-text-dim",
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span className="text-[9px] font-semibold">Content</span>
        </button>
```

`mobile-control-sheet.tsx`: read the file first; add a content branch that renders `<ContentGroupList activeGroup={contentPanel.group} />` inside the existing sheet chrome when `contentPanel.open` (close → `closeContentPanel()`). The mobile overlay `BuilderContentPanel` drawer from Step 1 is NOT mounted on mobile — remove it from the mobile return; the sheet is the mobile container (one surface per platform).

- [ ] **Step 6: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS. Manual: in inline mode click an empty section chip → panel opens at that group; split mode → dock switches to Content; mobile → sheet opens.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/builder/page.tsx components/builder/section-popover.tsx components/builder/inline-overlay-builder.tsx components/builder/bottom-toolbar.tsx components/builder/editor-panel.tsx components/builder/mobile/mobile-mini-bar.tsx components/builder/mobile/mobile-control-sheet.tsx lib/config/builder-sections.ts
git commit -m "feat(builder): content panel reachable from popovers, toolbar, split dock, and mobile"
```

---

## Phase 5 — Guidance Layer + Chrome Truth

### Task 21: Setup progress — hook, chip, checklist

**Files:**
- Create: `lib/hooks/use-setup-progress.ts`
- Create: `components/builder/setup-progress-chip.tsx`
- Modify: `components/builder/builder-top-bar.tsx` (mount chip)
- Modify: `components/builder/mobile/mobile-top-bar.tsx` (mount compact chip)
- Modify: `scripts/check-builder.ts`

**Interfaces:**
- Produces (from `@/lib/hooks/use-setup-progress`):
  ```ts
  interface SetupItem {
    id: "story" | "photos" | "contact-hours" | "socials" | "booking" | "policies" | "artists";
    label: string;
    done: boolean;
    optional?: boolean;
    group: ContentGroup;          // Content-panel deep-link target
    sectionId: string;            // preview scroll target (data-section id)
  }
  function computeSetupItems(data: StudioSiteData, config: StudioThemeConfig, rosterCount: number): SetupItem[]; // pure — checked
  function useSetupProgress(): { items: SetupItem[]; requiredDone: number; requiredTotal: number; ready: boolean };
  ```
  The pure `computeSetupItems` uses the SAME predicates the sections use (`hasBio`, `hasPhotos`, `hasHours`, `hasContact`, `hasAnySocial`, booking via `data.bookingLink`) — checklist and preview cannot disagree.

- [ ] **Step 1: Failing asserts**

Append to `scripts/check-builder.ts`:

```ts
// ─── Setup progress ──────────────────────────────────────────────────────
import { computeSetupItems } from "../lib/hooks/use-setup-progress";

check("empty studio: only policies (template defaults) can be done", () => {
  const items = computeSetupItems(EMPTY_SITE, defaultThemeConfig, 0);
  const byId = new Map(items.map((i) => [i.id, i]));
  assert.equal(byId.get("story")?.done, false);
  assert.equal(byId.get("photos")?.done, false);
  assert.equal(byId.get("contact-hours")?.done, false);
  assert.equal(byId.get("socials")?.done, false);
  assert.equal(byId.get("booking")?.done, false);
  assert.equal(byId.get("artists")?.optional, true);
});

check("filled studio: everything done", () => {
  const full: StudioSiteData = {
    ...EMPTY_SITE,
    bio: "story", phone: "555", email: "a@b.c",
    hours: { Monday: { open: "10:00 AM", close: "6:00 PM", closed: false } },
    instagram: "@x", images: ["u"],
    bookingLink: { url: "https://booksy.com/x", platformName: "Booksy" },
  };
  const cfgWithPolicy = {
    ...defaultThemeConfig,
    policies: [{ id: "aftercare", type: "standard" as const, title: "Aftercare", enabled: true, body: "", featured: false, order: 0 }],
  };
  const items = computeSetupItems(full, cfgWithPolicy, 2);
  assert.ok(items.every((i) => i.done));
});
```

Run → Expected: FAIL (module not found).

- [ ] **Step 2: Create `lib/hooks/use-setup-progress.ts`**

```ts
"use client";

import { useMemo } from "react";
import type { StudioThemeConfig } from "@/lib/types/builder";
import type { StudioSiteData } from "@/components/studio-site/studio-site-data";
import type { ContentGroup } from "@/components/studio-site/studio-site-context";
import { useBuilder } from "@/components/builder/builder-provider";
import { hasBio, hasPhotos, hasHours, hasContact, hasAnySocial } from "@/lib/utils/studio-content";

export interface SetupItem {
  id: "story" | "photos" | "contact-hours" | "socials" | "booking" | "policies" | "artists";
  label: string;
  done: boolean;
  optional?: boolean;
  group: ContentGroup;
  sectionId: string;
}

/** Pure derivation — shares the sections' own predicates so the checklist can never disagree with the preview. */
export function computeSetupItems(
  data: StudioSiteData,
  config: StudioThemeConfig,
  rosterCount: number,
): SetupItem[] {
  return [
    { id: "story", label: "Tell your story", done: hasBio(data), group: "story", sectionId: "about" },
    { id: "photos", label: "Add photos", done: hasPhotos(data), group: "photos", sectionId: "gallery" },
    { id: "contact-hours", label: "Hours & contact", done: hasContact(data) && hasHours(data), group: "contact-hours", sectionId: "details" },
    { id: "socials", label: "Social links", done: hasAnySocial(data), group: "socials", sectionId: "footer" },
    { id: "booking", label: "Booking link", done: Boolean(data.bookingLink), group: "booking", sectionId: "details" },
    { id: "policies", label: "Studio policies", done: (config.policies ?? []).some((p) => p.enabled), group: "booking", sectionId: "policies" },
    { id: "artists", label: "Artist roster", done: rosterCount > 0, optional: true, group: "artists", sectionId: "artist-strips" },
  ];
}

export function useSetupProgress() {
  const { siteData, config, liveContent } = useBuilder();
  return useMemo(() => {
    const items = computeSetupItems(siteData, config, liveContent.artists.length);
    const required = items.filter((i) => !i.optional);
    const requiredDone = required.filter((i) => i.done).length;
    return {
      items,
      requiredDone,
      requiredTotal: required.length,
      ready: requiredDone === required.length,
    };
  }, [siteData, config, liveContent.artists.length]);
}
```

Note: `computeSetupItems` intentionally lives in this file and is imported by the check script via `tsx` (the `"use client"` directive is inert under tsx). The `policies` item deep-links to the existing Policies editor — its `group` value is unused because `sectionId: "policies"` scroll is the affordance; clicking it opens nothing extra.

- [ ] **Step 3: Create `components/builder/setup-progress-chip.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { useSetupProgress, type SetupItem } from "@/lib/hooks/use-setup-progress";
import { scrollToBuilderSection } from "@/lib/utils/scroll-to-section";

function ProgressRing({ fraction }: { fraction: number }) {
  const r = 6;
  const c = 2 * Math.PI * r;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="-rotate-90">
      <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <circle
        cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeDasharray={c} strokeDashoffset={c * (1 - fraction)} strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
      />
    </svg>
  );
}

export function SetupProgressChip({ compact }: { compact?: boolean }) {
  const { openContentPanel } = useBuilder();
  const { items, requiredDone, requiredTotal, ready } = useSetupProgress();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleItem = (item: SetupItem) => {
    setOpen(false);
    scrollToBuilderSection(item.sectionId);
    if (!item.done && item.id !== "policies") openContentPanel(item.group);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
          ready
            ? "border-ink-sage/60 text-ink-sage hover:bg-ink-sage/10"
            : "border-chrome-border-hover text-chrome-text-secondary hover:border-chrome-text-dim hover:text-white",
        )}
      >
        <ProgressRing fraction={requiredTotal === 0 ? 1 : requiredDone / requiredTotal} />
        {ready ? (compact ? "Ready" : "Ready to publish") : `Setup ${requiredDone}/${requiredTotal}`}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Site setup checklist"
          className="absolute right-0 top-[calc(100%+6px)] z-[230] w-[240px] rounded-xl border border-chrome-muted bg-chrome-surface/97 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => handleItem(item)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-chrome-raised"
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  item.done ? "border-ink-sage bg-ink-sage/15 text-ink-sage" : "border-chrome-border-hover text-transparent",
                )}
                aria-hidden="true"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.5 4 8l4.5-5.5" />
                </svg>
              </span>
              <span className={cn("flex-1 text-[11px] font-medium", item.done ? "text-chrome-text-dim line-through decoration-chrome-text-faint" : "text-chrome-text-light")}>
                {item.label}
              </span>
              {item.optional && (
                <span className="text-[9px] font-semibold uppercase tracking-wide text-chrome-text-faint">Optional</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Mount** — in `builder-top-bar.tsx` render `<SetupProgressChip />` first inside the right-side actions `<div>`; in `mobile/mobile-top-bar.tsx` render `<SetupProgressChip compact />` before the Save button.

- [ ] **Step 5: Verify** — `npx tsx scripts/check-builder.ts` all pass; `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/hooks/use-setup-progress.ts components/builder/setup-progress-chip.tsx components/builder/builder-top-bar.tsx components/builder/mobile/mobile-top-bar.tsx scripts/check-builder.ts
git commit -m "feat(builder): setup progress chip with data-derived checklist"
```

---

### Task 22: Chrome truth — "Sample Data" rename + working Preview

**Files:**
- Modify: `components/builder/builder-top-bar.tsx`
- Modify: `app/dashboard/builder/page.tsx`

- [ ] **Step 1: Rename the toggle**

In `builder-top-bar.tsx` replace the Mock Data button content/attrs:

```tsx
        <button
          type="button"
          onClick={toggleMockData}
          aria-pressed={useMockData}
          title="Preview with example content — never shown on your live site."
          className={cn(
            "rounded-lg border bg-transparent px-3.5 py-1.5 text-xs font-medium transition-colors",
            useMockData
              ? "border-ink-gold text-ink-gold"
              : "border-chrome-border-hover text-chrome-text-tertiary",
          )}
        >
          Sample Data
        </button>
```

- [ ] **Step 2: Wire Preview**

In `builder-top-bar.tsx`, destructure `setIsPreviewing` from `useBuilder()` and give the Preview button `onClick={() => setIsPreviewing(true)}`.

In `app/dashboard/builder/page.tsx`, inside the desktop `<BuilderProvider>` tree add a full-screen preview branch. Create a small inner component in the same file (it must live under the provider to use the hook):

```tsx
function PreviewOverlay() {
  const { isPreviewing, setIsPreviewing } = useBuilder();
  useEffect(() => {
    if (!isPreviewing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPreviewing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPreviewing, setIsPreviewing]);

  if (!isPreviewing) return null;
  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto bg-chrome-bg">
      <StudioPagePreview />
      <button
        type="button"
        onClick={() => setIsPreviewing(false)}
        className="fixed bottom-6 left-1/2 z-[310] -translate-x-1/2 rounded-full border border-chrome-border-hover bg-ink-black/90 px-5 py-2.5 text-xs font-semibold text-chrome-text-light shadow-2xl backdrop-blur-xl transition-colors hover:text-white"
      >
        Exit preview
      </button>
    </div>
  );
}
```

Add `import { useBuilder } from "@/components/builder/builder-provider";` and `import { StudioPagePreview } from "@/components/builder/studio-page-preview";`, and render `<PreviewOverlay />` inside both desktop provider trees (and the mobile one). This is exactly what publishes: the shared renderer with current config + real data.

- [ ] **Step 3: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS. Manual: Preview shows the chrome-free site; Escape/Exit returns.

- [ ] **Step 4: Commit**

```bash
git add components/builder/builder-top-bar.tsx app/dashboard/builder/page.tsx
git commit -m "feat(builder): Sample Data rename with tooltip; working full-screen Preview"
```

---

## Phase 6 — Template Signatures

> New visual variants: apply the `frontend-design` skill's craft standards while implementing (per CLAUDE.md) — these components define each template's identity. All variants stay selectable in Custom tier; *defaults* create identity.

### Task 23: New hero layouts — masthead, grid-overlay, zine

**Files:**
- Modify: `lib/types/builder.ts` (HeroLayout union)
- Modify: `lib/data/builder-options.ts` (heroOptions)
- Modify: `components/builder/preview/hero-section.tsx` (three new variants)
- Modify: `components/builder/controls/hero-style-picker.tsx` (thumbnails)
- Modify: `lib/data/templates.ts` (defaults: bold-editorial→masthead, studio-minimal→grid-overlay, gutter-punk→zine)
- Modify: `scripts/check-builder.ts`

- [ ] **Step 1: Failing assert**

```ts
check("signature hero defaults", () => {
  assert.equal(templates["bold-editorial"].defaults.heroLayout, "masthead");
  assert.equal(templates["studio-minimal"].defaults.heroLayout, "grid-overlay");
  assert.equal(templates["gutter-punk"].defaults.heroLayout, "zine");
});
```

Run → FAIL (type error first — expand the union).

- [ ] **Step 2: Type + options**

`lib/types/builder.ts`: `export type HeroLayout = "split" | "fullbleed" | "centered" | "masthead" | "grid-overlay" | "zine";`

`lib/data/builder-options.ts` — append to `heroOptions`:

```ts
  { label: "Masthead", value: "masthead", description: "Editorial masthead with rule lines" },
  { label: "Grid Overlay", value: "grid-overlay", description: "Photo grid with name overlay" },
  { label: "Zine", value: "zine", description: "Raw collage with stamped name" },
```

- [ ] **Step 3: Implement the variants in `hero-section.tsx`**

```tsx
/** Bold Editorial signature: magazine masthead — rule lines, huge name, meta row, wide image band. */
function MastheadHero() {
  const { config, data } = useStudioSite();
  const metaParts = [
    [data?.city, data?.state].filter(Boolean).join(", "),
    data?.specialties?.slice(0, 3).join(" / "),
  ].filter((p) => p && p.length > 0);

  return (
    <div className="flex min-h-[520px] flex-col justify-between gap-6 px-6 pt-10 @lg:px-12" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div>
        <div className="h-[3px] w-full" style={{ backgroundColor: "var(--text-primary)" }} />
        <h1
          className="py-3 text-center text-[17vw] leading-[0.9] @lg:text-8xl @lg:py-5"
          style={{ fontFamily: "var(--heading-font)", color: "var(--text-primary)" }}
        >
          {data?.name ?? ""}
        </h1>
        <div className="h-px w-full" style={{ backgroundColor: "var(--border)" }} />
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          {metaParts.map((part) => (
            <span key={part}>{part}</span>
          ))}
          {config.showHeroSubtext !== false && (
            <span style={{ color: "var(--text-secondary)" }}>{config.heroSubtext || "Tattoo crafted with intention."}</span>
          )}
        </div>
        <div className="h-px w-full" style={{ backgroundColor: "var(--border)" }} />
      </div>
      <div className="relative min-h-[240px] flex-1" data-hero-image style={heroImageStyle(data?.coverImage)}>
        {!data?.coverImage && (
          <div className="absolute bottom-4 left-4">
            <PromptChip group="photos" label="Add cover photo" />
          </div>
        )}
      </div>
    </div>
  );
}

/** Studio Minimal signature: the hero IS a photo grid; name floats on a quiet panel. */
function GridOverlayHero() {
  const { data } = useStudioSite();
  const tiles = (data?.images ?? []).slice(0, 6);
  const cells = tiles.length > 0 ? tiles : Array.from({ length: 6 }, () => undefined);

  return (
    <div className="relative min-h-[520px]">
      <div className="grid h-full min-h-[520px] grid-cols-2 gap-px @lg:grid-cols-3" aria-hidden={tiles.length === 0}>
        {cells.map((src, i) => (
          <div
            key={i}
            data-gallery-item
            className={cn("min-h-[170px]", tiles.length === 0 && "opacity-50")}
            style={src
              ? { backgroundImage: `url("${src}")`, backgroundSize: "cover", backgroundPosition: "center" }
              : { backgroundColor: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 px-10 py-8 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--bg-primary) 92%, transparent)", backdropFilter: "blur(4px)" }}>
          <HeroContent centered />
          {tiles.length === 0 && <PromptChip group="photos" label="Add photos" />}
        </div>
      </div>
    </div>
  );
}

/** Gutter Punk signature: zine collage — rotated tiles, tape corners, stamped name. */
function ZineHero() {
  const { config, data } = useStudioSite();
  const photos = data?.images ?? [];
  const tiles = [0, 1, 2].map((i) => photos[i]);

  return (
    <div className="relative min-h-[520px] overflow-hidden px-6 py-12 @lg:px-12" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 @lg:gap-8">
        {tiles.map((src, i) => (
          <div
            key={i}
            data-zine-tile
            className={cn(
              "relative h-[280px] w-[200px] shrink-0 @lg:h-[360px] @lg:w-[260px]",
              i === 0 && "-rotate-[4deg] translate-y-6",
              i === 1 && "rotate-[2deg] -translate-y-3",
              i === 2 && "-rotate-[1.5deg] translate-y-8 hidden @md:block",
              !src && "opacity-40",
            )}
            style={src
              ? { backgroundImage: `url("${src}")`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }
              : { backgroundColor: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}
          >
            {/* tape corner */}
            <span
              aria-hidden="true"
              className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg]"
              style={{ backgroundColor: "color-mix(in srgb, var(--text-primary) 18%, transparent)" }}
            />
          </div>
        ))}
      </div>
      <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-5 text-center">
        <h1
          className="inline-block -rotate-[2deg] px-5 py-2 text-5xl uppercase tracking-tight @lg:text-7xl"
          style={{
            fontFamily: "var(--heading-font)",
            color: "var(--bg-primary)",
            backgroundColor: "var(--text-primary)",
            boxShadow: "4px 4px 0 var(--accent)",
          }}
        >
          {data?.name ?? ""}
        </h1>
        {config.showHeroSubtext !== false && (
          <p className="max-w-md text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-secondary)" }}>
            {config.heroSubtext || "Tattoo crafted with intention."}
          </p>
        )}
        {photos.length === 0 && <PromptChip group="photos" label="Add photos" />}
      </div>
    </div>
  );
}
```

Register in `HeroSection`:

```tsx
      {config.heroLayout === "masthead" && <MastheadHero />}
      {config.heroLayout === "grid-overlay" && <GridOverlayHero />}
      {config.heroLayout === "zine" && <ZineHero />}
```

- [ ] **Step 4: Thumbnails** — in `hero-style-picker.tsx` `HeroThumbnail`, add cases (schematic tiles matching each layout: masthead = two rules + wide band; grid-overlay = 6-cell grid + center chip; zine = three rotated rects). Follow the existing chrome-token style of the current cases; `columns={3}` already wraps to two rows.

- [ ] **Step 5: Defaults** — in `lib/data/templates.ts` set `heroLayout: "masthead"` (bold-editorial), `heroLayout: "grid-overlay"` (studio-minimal), `heroLayout: "zine"` (gutter-punk).

- [ ] **Step 6: Verify** — `npx tsx scripts/check-builder.ts` all pass; `npx tsc --noEmit` PASS; `npm run lint` PASS. Manual: switch the three templates → each hero is structurally unique; chips appear when photo-less.

- [ ] **Step 7: Commit**

```bash
git add lib/types/builder.ts lib/data/builder-options.ts components/builder/preview/hero-section.tsx components/builder/controls/hero-style-picker.tsx lib/data/templates.ts scripts/check-builder.ts
git commit -m "feat(templates): masthead, grid-overlay, and zine signature heroes"
```

---

### Task 24: New gallery layouts — film-strip, flash-sheet

**Files:**
- Modify: `lib/types/builder.ts` (GalleryLayout union)
- Modify: `lib/data/builder-options.ts` (galleryOptions)
- Modify: `components/builder/preview/gallery-section.tsx`
- Modify: `components/builder/controls/gallery-style-picker.tsx` (thumbnails)
- Modify: `lib/data/templates.ts` (defaults: dark-cinematic→film-strip, traditional-flash→flash-sheet)
- Modify: `scripts/check-builder.ts`

- [ ] **Step 1: Failing assert**

```ts
check("signature gallery defaults", () => {
  assert.equal(templates["dark-cinematic"].defaults.galleryLayout, "film-strip");
  assert.equal(templates["traditional-flash"].defaults.galleryLayout, "flash-sheet");
});
```

- [ ] **Step 2: Type + options**

`lib/types/builder.ts`: `export type GalleryLayout = "featured" | "uniform" | "masonry" | "carousel" | "film-strip" | "flash-sheet";`

`galleryOptions` additions:

```ts
  { label: "Film Strip", value: "film-strip", description: "Sprocket-edged cinematic strip" },
  { label: "Flash Sheet", value: "flash-sheet", description: "Bordered tiles, ornament corners" },
```

- [ ] **Step 3: Implement in `gallery-section.tsx`**

```tsx
/** Dark Cinematic signature: horizontal strip framed by film sprocket holes. */
function FilmStripGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  const sprockets = {
    backgroundImage:
      "repeating-linear-gradient(90deg, var(--border) 0 10px, transparent 10px 26px)",
  } as React.CSSProperties;
  return (
    <div className="overflow-hidden rounded-[var(--border-radius-lg)]" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="h-4 w-full opacity-60" style={sprockets} aria-hidden="true" />
      <div className="flex gap-2 overflow-x-auto px-2 py-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((item, i) => (
          <div key={item.id} className="w-44 shrink-0 snap-start @sm:w-56 @md:w-64">
            <GalleryItem index={i} aspect="aspect-[3/4]" src={item.src} className="rounded-sm" onClick={onPhotoClick} />
          </div>
        ))}
      </div>
      <div className="h-4 w-full opacity-60" style={sprockets} aria-hidden="true" />
    </div>
  );
}

/** Traditional Flash signature: flash-sheet grid — bordered tiles with corner ornaments. */
function FlashSheetGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  const corner = (pos: string) => (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute h-2.5 w-2.5", pos)}
      style={{ borderColor: "var(--accent)", borderStyle: "solid", borderWidth: 0 }}
    />
  );
  return (
    <div className="grid grid-cols-2 gap-4 @md:grid-cols-3">
      {items.slice(0, 9).map((item, i) => (
        <div
          key={item.id}
          className="relative border-2 p-1.5"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 55%, var(--border))", backgroundColor: "var(--bg-raised)" }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute left-0.5 top-0.5 h-2.5 w-2.5 border-l-2 border-t-2" style={{ borderColor: "var(--accent)" }} />
          <span aria-hidden="true" className="pointer-events-none absolute right-0.5 top-0.5 h-2.5 w-2.5 border-r-2 border-t-2" style={{ borderColor: "var(--accent)" }} />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-0.5 left-0.5 h-2.5 w-2.5 border-b-2 border-l-2" style={{ borderColor: "var(--accent)" }} />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-0.5 right-0.5 h-2.5 w-2.5 border-b-2 border-r-2" style={{ borderColor: "var(--accent)" }} />
          <GalleryItem index={i} aspect="aspect-square" src={item.src} className="rounded-none" onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}
```

Register in `GallerySection`'s layout switch:

```tsx
            {galleryLayout === "film-strip" && <FilmStripGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} />}
            {galleryLayout === "flash-sheet" && <FlashSheetGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} />}
```

(Remove the unused `corner` helper stub if the four corner spans are inlined as shown.)

- [ ] **Step 4: Thumbnails** — add `film-strip` (strip with dotted top/bottom rows) and `flash-sheet` (2×2 bordered cells) cases to `GalleryThumbnail` in `gallery-style-picker.tsx`, following the existing schematic style.

- [ ] **Step 5: Defaults** — `lib/data/templates.ts`: `galleryLayout: "film-strip"` (dark-cinematic), `galleryLayout: "flash-sheet"` (traditional-flash).

- [ ] **Step 6: Verify** — check script passes; `npx tsc --noEmit` PASS; `npm run lint` PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/types/builder.ts lib/data/builder-options.ts components/builder/preview/gallery-section.tsx components/builder/controls/gallery-style-picker.tsx lib/data/templates.ts scripts/check-builder.ts
git commit -m "feat(templates): film-strip and flash-sheet signature galleries"
```

---

### Task 25: `data-template` CSS signatures

**Files:**
- Modify: `components/studio-site/studio-site-renderer.tsx` (+`data-template`)
- Modify: `components/builder/inline-overlay-builder.tsx` (+`data-template` on its root)
- Modify: `components/builder/mobile/mobile-preview-canvas.tsx` (+`data-template` on its root)
- Modify: `components/builder/preview/about-section.tsx` (add `data-story-body` to the bio `<p>`)
- Modify: `app/globals.css`

- [ ] **Step 1: Attribute plumbing**

Add `data-template={config.template}` alongside the existing `data-builder-root` attribute in all three roots (renderer line ~136, inline builder line ~159, mobile canvas line ~85). In `about-section.tsx`, add `data-story-body` to the bio paragraph inside `StoryBlock`.

- [ ] **Step 2: Append to `app/globals.css`**

```css
/* ─── Template signatures (keyed by data-template) ────────────────── */

/* Dark Cinematic — letterboxed hero + slow Ken Burns on the cover */
[data-template="dark-cinematic"] [data-section="hero"] {
  position: relative;
  overflow: hidden;
}
[data-template="dark-cinematic"] [data-section="hero"]::before,
[data-template="dark-cinematic"] [data-section="hero"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 22px;
  background: #000;
  z-index: 2;
  pointer-events: none;
}
[data-template="dark-cinematic"] [data-section="hero"]::before { top: 0; }
[data-template="dark-cinematic"] [data-section="hero"]::after { bottom: 0; }
@keyframes builder-kenburns {
  from { transform: scale(1); }
  to { transform: scale(1.07) translate(-1%, -1%); }
}
[data-template="dark-cinematic"] [data-hero-image] {
  animation: builder-kenburns 26s ease-in-out infinite alternate;
  will-change: transform;
}

/* Warm Artisan — arched hero image + serif drop cap in the story */
[data-template="warm-artisan"] [data-hero-image] {
  border-radius: 45% 45% 0 0 / 22% 22% 0 0;
}
[data-template="warm-artisan"] [data-story-body]::first-letter {
  font-family: var(--heading-font);
  font-size: 3em;
  line-height: 0.85;
  float: left;
  padding-right: 0.12em;
  color: var(--accent);
}

/* Fine Line — hairline photo mats with breathing room */
[data-template="fine-line"] [data-gallery-item] {
  border: 1px solid var(--border);
  padding: 6px;
  background-color: var(--bg-primary);
  background-clip: content-box;
}

/* Gutter Punk — stickered, off-kilter gallery tiles */
[data-template="gutter-punk"] [data-gallery-item]:nth-child(3n+1) { transform: rotate(-1.2deg); }
[data-template="gutter-punk"] [data-gallery-item]:nth-child(3n+2) { transform: rotate(0.9deg); }
[data-template="gutter-punk"] [data-gallery-item]:nth-child(3n)   { transform: rotate(-0.5deg); }

/* Bold Editorial — numbered gallery plates */
[data-builder-root][data-template="bold-editorial"] { counter-reset: plate; }
[data-template="bold-editorial"] [data-gallery-item] { counter-increment: plate; }
[data-template="bold-editorial"] [data-gallery-item]::before {
  content: "N\00B0 " counter(plate, decimal-leading-zero);
  position: absolute;
  bottom: 6px;
  left: 8px;
  z-index: 1;
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--text-primary);
  opacity: 0.75;
  pointer-events: none;
}
[data-template="bold-editorial"] [data-gallery-item] { position: relative; }

/* Motion safety */
@media (prefers-reduced-motion: reduce) {
  [data-template="dark-cinematic"] [data-hero-image] { animation: none; }
  [data-template="gutter-punk"] [data-gallery-item] { transform: none; }
}
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` PASS; `npm run lint` PASS. Manual: cycle all 7 templates in the builder — each shows its signature; toggle OS reduced-motion → Ken Burns stops.

- [ ] **Step 4: Commit**

```bash
git add components/studio-site/studio-site-renderer.tsx components/builder/inline-overlay-builder.tsx components/builder/mobile/mobile-preview-canvas.tsx components/builder/preview/about-section.tsx app/globals.css
git commit -m "feat(templates): per-template CSS signatures via data-template"
```

---

## Phase 7 — Verification Gate

### Task 26: Full verification + manual browser matrix

**Files:**
- Create: `docs/superpowers/verification/2026-07-07-builder-manual-matrix.md`

- [ ] **Step 1: Run the complete automated gate**

```bash
npx tsx scripts/check-builder.ts   # every check passes
npx tsc --noEmit                   # zero errors
npm run lint                       # zero errors/warnings introduced
```

- [ ] **Step 2: Supabase advisors**

Run MCP `get_advisors(project_id: "cktvpfenygxhfaodihbz", type: "security")` and `type: "performance"` — no new findings attributable to migration 011 or the new queries.

- [ ] **Step 3: Write the manual matrix**

Create `docs/superpowers/verification/2026-07-07-builder-manual-matrix.md`:

```markdown
# Builder Overhaul — Manual Browser Matrix

Run with `npm run dev` (user-invoked). Test studio states: EMPTY (fresh signup,
no data beyond name), PARTIAL (bio + phone only), FULL (photos, hours, socials,
booking link, roster artist with portfolio), plus Sample Data ON.

## Per mode: inline · split · mobile (≤767px)
- [ ] Sample OFF: zero demo names (Jake/Sarah/Marcus), zero fake reviews, no "4.9", no fake calendar
- [ ] Sample ON: full demo everywhere, calendar demo visible, gold toggle state
- [ ] EMPTY: every section shows its designed empty state + prompt chip
- [ ] Chip click opens Content panel at the right group (inline overlay / split dock / mobile sheet)
- [ ] Field blur → preview updates instantly + "Saved" tick; reload persists (Supabase row updated)
- [ ] Cover + gallery upload: progress, compressed file in storage under {studioId}/, renders in hero/gallery
- [ ] Photo reorder + delete work; deleted photo gone after reload
- [ ] Booking link connect → hero/nav/details CTAs become real links (new tab); remove → contact-to-book card
- [ ] Setup chip counts match reality; item click scrolls + opens group; 6/6 → "Ready to publish"
- [ ] Section popover: Style tab = old controls; Content tab hands off correctly
- [ ] Preview button: full-screen chrome-free site; Escape exits
- [ ] Keyboard: panel focus-trap, Esc closes, focus returns; chips reachable by Tab

## Templates (cycle all 7, EMPTY and FULL)
- [ ] Masthead / grid-overlay / zine heroes render; film-strip / flash-sheet galleries render
- [ ] CSS signatures visible (letterbox+KenBurns, arch+dropcap, mats, rotation, numbered plates)
- [ ] Empty states inherit template styling; reduced-motion kills Ken Burns/rotations
- [ ] Old draft with `immersive-dark`/`clean-minimal` in localStorage loads as the mapped survivor

## Public parity (`/studios/[id]`)
- [ ] FULL studio: page pixel-matches builder preview (roster thumbs, reviews, rating, cover)
- [ ] EMPTY studio: same designed empty states, NO prompt chips anywhere in the DOM
- [ ] No `theme_config` studio: default template + real empty states
- [ ] Reviews section: real reviews render; zero reviews → "No reviews yet" state
```

- [ ] **Step 4: Commit + hand the matrix to the user**

```bash
git add docs/superpowers/verification/2026-07-07-builder-manual-matrix.md
git commit -m "docs: builder overhaul manual verification matrix"
```

Report results honestly: list any check that failed and fix before claiming completion. The browser matrix requires the user to run `npm run dev` — hand it over rather than running the server.

---

## Plan Self-Review Notes

- **Spec coverage:** §1 audit → Tasks 4, 10, 12, 13, 14 (each leak has a named kill site). §3 truth model → Tasks 1–6. §4 matrix → Tasks 7–14. §5 panel → Tasks 17–20. §6 uploads → Tasks 15–16, 19. §7 guidance → Task 21. §8 reorg → Tasks 20, 22. §9 a11y → Tasks 7, 17, 21 (traps, roles, focus, reduced-motion). §10 templates → Tasks 1, 23–25. §11 errors → Tasks 5 (status/error), 16 (messages), 19 (per-tile), 1 (remap). §12 verification → Tasks 1–24 asserts + Task 26. §13 out-of-scope honored (Publish untouched; Preview wired as the one inclusion).
- **Known judgment points for the executor:** `studioSpecialtyOptions` shape (read `lib/data/signup-styles.ts` before Task 17 Step 3); `mobile-control-sheet.tsx` internals (read before Task 20 Step 5); `SCHEDULE_SELECT_CLASS` is light-themed — Task 18 deliberately uses `PANEL_SELECT_CLASS` instead.
- **Type consistency:** `ContentGroup` defined once (Task 5) and imported everywhere; `buildBuilderSiteData` 3-arg signature consistent across Tasks 4/5; predicates named identically in Tasks 3/21.



