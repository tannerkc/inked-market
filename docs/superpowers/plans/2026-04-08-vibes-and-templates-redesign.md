# Vibes Redesign + New Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 4 weak vibes with 6 dramatically distinct atmosphere presets, and add 5 new templates, with no overlap between vibe and template controls.

**Architecture:** Vibes own visual atmosphere (image treatment, texture, typography personality, density, edges, dividers, animation, tag style, CTA style — 11 properties total). Templates own structure (section layouts). The two are orthogonal — no override tracking needed. `applyVibe` expands from 4 to 11 properties; types update accordingly; 5 new template definitions join the existing 4.

**Tech Stack:** TypeScript, Next.js App Router, React 19, Tailwind CSS v4

---

## File Map

| File | Change |
|---|---|
| `lib/types/builder.ts` | `Vibe` union type, `TemplateSlug` union type |
| `lib/data/builder-options.ts` | `VibeDefinition.defaults` interface, `vibeOptions` array (4 → 6) |
| `lib/hooks/use-theme-editor.ts` | `applyVibe` (4 → 11 props), `reset` default vibe |
| `components/builder/controls/vibe-picker.tsx` | `detectVibe` logic, grid (4 → 6 cards) |
| `lib/data/templates.ts` | 5 new `TemplateDefinition` entries |

---

## Task 1: Update Type Definitions

**Files:**
- Modify: `lib/types/builder.ts`

- [ ] **Step 1: Replace Vibe union type**

In `lib/types/builder.ts`, find line 30:
```ts
export type Vibe = "bold" | "clean" | "luxe" | "editorial";
```
Replace with:
```ts
export type Vibe = "raw" | "ghost" | "americana" | "noir" | "void" | "sacred";
```

- [ ] **Step 2: Expand TemplateSlug union type**

In `lib/types/builder.ts`, find the `TemplateSlug` type (lines 23–27):
```ts
export type TemplateSlug =
  | "bold-editorial"
  | "clean-minimal"
  | "immersive-dark"
  | "warm-artisan";
```
Replace with:
```ts
export type TemplateSlug =
  | "bold-editorial"
  | "clean-minimal"
  | "immersive-dark"
  | "warm-artisan"
  | "gutter-punk"
  | "dark-cinematic"
  | "studio-minimal"
  | "fine-line"
  | "traditional-flash";
```

- [ ] **Step 3: Verify TypeScript is still happy**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only about `vibeOptions` and `templates` (data files not yet updated) — no errors in `builder.ts` itself. Errors referencing old vibe values (`"bold"`, `"clean"`, etc.) in other files are expected at this stage.

- [ ] **Step 4: Commit**

```bash
git add lib/types/builder.ts
git commit -m "feat: expand Vibe and TemplateSlug union types"
```

---

## Task 2: Expand VibeDefinition and Replace vibeOptions

**Files:**
- Modify: `lib/data/builder-options.ts`

- [ ] **Step 1: Expand the VibeDefinition interface**

In `lib/data/builder-options.ts`, find the `VibeDefinition` interface (lines 182–191):
```ts
export interface VibeDefinition {
  label: string;
  value: Vibe;
  description: string;
  defaults: {
    density: Density;
    borderShape: BorderShape;
    dividerStyle: DividerStyle;
    animationStyle: AnimationStyle;
  };
}
```
Replace with:
```ts
export interface VibeDefinition {
  label: string;
  value: Vibe;
  description: string;
  defaults: {
    density: Density;
    borderShape: BorderShape;
    dividerStyle: DividerStyle;
    animationStyle: AnimationStyle;
    imageTreatment: ImageTreatment;
    surfaceTexture: SurfaceTexture;
    headingTextTransform: HeadingTextTransform;
    headingLetterSpacing: HeadingLetterSpacing;
    headingFontWeight: HeadingFontWeight;
    tagStyle: TagStyle;
    ctaStyle: CtaStyle;
  };
}
```

- [ ] **Step 2: Replace vibeOptions array**

Find the `vibeOptions` array (lines 194–219) and replace entirely:
```ts
export const vibeOptions: VibeDefinition[] = [
  {
    label: "Raw",
    value: "raw",
    description: "Underground grit. Maximum contrast, zero softness.",
    defaults: {
      density: "compact",
      borderShape: "sharp",
      dividerStyle: "solid",
      animationStyle: "none",
      imageTreatment: "bw",
      surfaceTexture: "concrete",
      headingTextTransform: "uppercase",
      headingLetterSpacing: "tight",
      headingFontWeight: "black",
      tagStyle: "square",
      ctaStyle: "outline",
    },
  },
  {
    label: "Ghost",
    value: "ghost",
    description: "Barely-there elegance. Light, airy, gallery-clean.",
    defaults: {
      density: "luxe",
      borderShape: "editorial",
      dividerStyle: "gradient",
      animationStyle: "fade-up",
      imageTreatment: "desat",
      surfaceTexture: "film-grain",
      headingTextTransform: "mixed",
      headingLetterSpacing: "wide",
      headingFontWeight: "light",
      tagStyle: "outline",
      ctaStyle: "outline",
    },
  },
  {
    label: "Americana",
    value: "americana",
    description: "Bold nostalgia. Traditional flash sheet energy.",
    defaults: {
      density: "balanced",
      borderShape: "editorial",
      dividerStyle: "ornament",
      animationStyle: "slide",
      imageTreatment: "film",
      surfaceTexture: "parchment",
      headingTextTransform: "uppercase",
      headingLetterSpacing: "normal",
      headingFontWeight: "black",
      tagStyle: "pill",
      ctaStyle: "filled",
    },
  },
  {
    label: "Noir",
    value: "noir",
    description: "Moody atmosphere. Vignette and grain, no decoration.",
    defaults: {
      density: "balanced",
      borderShape: "sharp",
      dividerStyle: "none",
      animationStyle: "scale",
      imageTreatment: "vignette",
      surfaceTexture: "film-grain",
      headingTextTransform: "uppercase",
      headingLetterSpacing: "tight",
      headingFontWeight: "bold",
      tagStyle: "outline",
      ctaStyle: "pill",
    },
  },
  {
    label: "Void",
    value: "void",
    description: "Clinical whitespace. The work speaks, nothing else does.",
    defaults: {
      density: "luxe",
      borderShape: "rounded",
      dividerStyle: "none",
      animationStyle: "fade-up",
      imageTreatment: "none",
      surfaceTexture: "none",
      headingTextTransform: "title",
      headingLetterSpacing: "wide",
      headingFontWeight: "light",
      tagStyle: "outline",
      ctaStyle: "outline",
    },
  },
  {
    label: "Sacred",
    value: "sacred",
    description: "Warm richness. Duotone and leather, editorial depth.",
    defaults: {
      density: "balanced",
      borderShape: "rounded",
      dividerStyle: "dotted",
      animationStyle: "fade-up",
      imageTreatment: "duotone",
      surfaceTexture: "leather",
      headingTextTransform: "mixed",
      headingLetterSpacing: "normal",
      headingFontWeight: "bold",
      tagStyle: "pill",
      ctaStyle: "filled",
    },
  },
];
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only in `use-theme-editor.ts` and `vibe-picker.tsx` (not yet updated). No errors in `builder-options.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/data/builder-options.ts
git commit -m "feat: replace vibeOptions with 6 distinct atmosphere presets"
```

---

## Task 3: Expand applyVibe in use-theme-editor

**Files:**
- Modify: `lib/hooks/use-theme-editor.ts`

- [ ] **Step 1: Expand applyVibe to apply all 11 properties**

Find the `applyVibe` function (lines 123–138):
```ts
const applyVibe = useCallback(
  (vibe: Vibe) => {
    const vibeDef = vibeOptions.find((v) => v.value === vibe);
    if (!vibeDef) return;
    const newConfig: StudioThemeConfig = {
      ...config,
      vibe,
      density: vibeDef.defaults.density,
      borderShape: vibeDef.defaults.borderShape,
      dividerStyle: vibeDef.defaults.dividerStyle,
      animationStyle: vibeDef.defaults.animationStyle,
    };
    pushHistory(newConfig);
  },
  [config, pushHistory],
);
```
Replace with:
```ts
const applyVibe = useCallback(
  (vibe: Vibe) => {
    const vibeDef = vibeOptions.find((v) => v.value === vibe);
    if (!vibeDef) return;
    const newConfig: StudioThemeConfig = {
      ...config,
      vibe,
      density: vibeDef.defaults.density,
      borderShape: vibeDef.defaults.borderShape,
      dividerStyle: vibeDef.defaults.dividerStyle,
      animationStyle: vibeDef.defaults.animationStyle,
      imageTreatment: vibeDef.defaults.imageTreatment,
      surfaceTexture: vibeDef.defaults.surfaceTexture,
      headingTextTransform: vibeDef.defaults.headingTextTransform,
      headingLetterSpacing: vibeDef.defaults.headingLetterSpacing,
      headingFontWeight: vibeDef.defaults.headingFontWeight,
      tagStyle: vibeDef.defaults.tagStyle,
      ctaStyle: vibeDef.defaults.ctaStyle,
    };
    pushHistory(newConfig);
  },
  [config, pushHistory],
);
```

- [ ] **Step 2: Update reset() default vibe**

In the `reset` function (around line 173), find:
```ts
vibe: "clean",
```
Replace with:
```ts
vibe: "void",
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: only `vibe-picker.tsx` errors remain (old vibe string literals). No errors in `use-theme-editor.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/use-theme-editor.ts
git commit -m "feat: expand applyVibe to apply all 11 atmosphere properties"
```

---

## Task 4: Update Vibe Picker UI

**Files:**
- Modify: `components/builder/controls/vibe-picker.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { vibeOptions } from "@/lib/data/builder-options";
import type { Vibe } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

function detectVibe(config: {
  density?: string;
  borderShape?: string;
  dividerStyle?: string;
  animationStyle?: string;
  imageTreatment?: string;
  surfaceTexture?: string;
  headingTextTransform?: string;
  headingLetterSpacing?: string;
  headingFontWeight?: string;
  tagStyle?: string;
  ctaStyle?: string;
  vibe?: string;
}): Vibe | null {
  const match = vibeOptions.find(
    (v) =>
      v.defaults.density === config.density &&
      v.defaults.borderShape === config.borderShape &&
      v.defaults.dividerStyle === config.dividerStyle &&
      v.defaults.animationStyle === config.animationStyle &&
      v.defaults.imageTreatment === config.imageTreatment &&
      v.defaults.surfaceTexture === config.surfaceTexture &&
      v.defaults.headingTextTransform === config.headingTextTransform &&
      v.defaults.headingLetterSpacing === config.headingLetterSpacing &&
      v.defaults.headingFontWeight === config.headingFontWeight &&
      v.defaults.tagStyle === config.tagStyle &&
      v.defaults.ctaStyle === config.ctaStyle,
  );
  return match?.value ?? (config.vibe as Vibe) ?? null;
}

export function VibePicker() {
  const { config, applyVibe } = useBuilder();
  const activeVibe = detectVibe(config);

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Vibe
      </div>
      <div className="grid grid-cols-2 gap-2">
        {vibeOptions.map((opt) => {
          const selected = activeVibe === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyVibe(opt.value as Vibe)}
              className={cn(
                "relative flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-[#FF3333] bg-[rgba(255,51,51,0.1)] ring-1 ring-[#FF3333]/30"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              {selected && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3333]">
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="#fff" strokeWidth={2}>
                    <path d="M2 5.5 4.5 8 8.5 3" />
                  </svg>
                </span>
              )}
              <span className="text-[11px] font-semibold text-[#ccc]">{opt.label}</span>
              <span className="text-[10px] leading-tight text-[#555]">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

VibePicker.displayName = "VibePicker";
```

- [ ] **Step 2: Verify TypeScript is fully clean**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors (all vibe-related types now consistent across all files).

- [ ] **Step 3: Start dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3001/dashboard/builder`. In the editor panel, find the Vibe section. Verify:
- 6 cards appear in 2-col grid (3 rows): Raw, Ghost, Americana, Noir, Void, Sacred
- Clicking each vibe visibly changes the preview — Raw should look starkly different from Void
- The selected card shows the red checkmark

- [ ] **Step 4: Commit**

```bash
git add components/builder/controls/vibe-picker.tsx
git commit -m "feat: update vibe picker for 6 new vibes with expanded detection"
```

---

## Task 5: Add 5 New Templates

**Files:**
- Modify: `lib/data/templates.ts`

- [ ] **Step 1: Add 5 new template definitions**

In `lib/data/templates.ts`, the file ends with:
```ts
export const templateList = Object.values(templates);
```

Before that line, add the 5 new entries to the `templates` record. Replace the entire file with:

```ts
import type { TemplateDefinition, TemplateSlug } from "@/lib/types/builder";

export const templates: Record<TemplateSlug, TemplateDefinition> = {
  "bold-editorial": {
    slug: "bold-editorial",
    name: "Bold Editorial",
    description:
      "Magazine-inspired layout with bold typography and a dark, industrial feel.",
    badge: "Popular",
    previewAccent: "#FF3333",
    previewBg: "#0A0A0A",
    previewMode: "dark",
    defaults: {
      template: "bold-editorial",
      preset: "midnight",
      headingFont: "Bebas Neue",
      bodyFont: "Inter",
      heroLayout: "split",
      showHeroCta: true,
      ctaStyle: "filled",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "featured",
      detailsLayout: "three-col",
      ctaLayout: "simple-minimal",
      ctaGlow: true,
      footerLayout: "columns",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "split",
      tagStyle: "pill",
      navStyle: "none",
      navLayout: "standard",
      builderTier: "flash",
    },
  },
  "clean-minimal": {
    slug: "clean-minimal",
    name: "Clean Minimal",
    description:
      "Light, modern design with clean lines and geometric typography.",
    previewAccent: "#1a1a1a",
    previewBg: "#fafafa",
    previewMode: "light",
    defaults: {
      template: "clean-minimal",
      preset: "parchment",
      accentColor: "#1a1a1a",
      backgroundColor: "#fafafa",
      backgroundMode: "light",
      headingFont: "Space Grotesk",
      bodyFont: "Space Grotesk",
      heroLayout: "centered",
      showHeroCta: true,
      ctaStyle: "filled",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "uniform",
      detailsLayout: "two-one",
      ctaLayout: "simple-minimal",
      ctaGlow: false,
      footerLayout: "centered",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "full-width",
      tagStyle: "square",
      navStyle: "static",
      navLayout: "standard",
      builderTier: "flash",
    },
  },
  "immersive-dark": {
    slug: "immersive-dark",
    name: "Immersive Dark",
    description:
      "Photography-forward with cinematic full-bleed imagery and elegant type.",
    previewAccent: "#ffffff",
    previewBg: "#050505",
    previewMode: "dark",
    defaults: {
      template: "immersive-dark",
      preset: "mono",
      headingFont: "Abril Fatface",
      bodyFont: "Inter",
      heroLayout: "fullbleed",
      showHeroCta: true,
      ctaStyle: "pill",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "masonry",
      detailsLayout: "stacked",
      ctaLayout: "simple-minimal",
      ctaGlow: false,
      footerLayout: "minimal-bar",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "split",
      tagStyle: "outline",
      navStyle: "none",
      navLayout: "standard",
      builderTier: "flash",
    },
  },
  "warm-artisan": {
    slug: "warm-artisan",
    name: "Warm Artisan",
    description:
      "Earthy tones and refined serif typography for a craft-focused studio.",
    previewAccent: "#C1440E",
    previewBg: "#F5F0EB",
    previewMode: "light",
    defaults: {
      template: "warm-artisan",
      preset: "parchment",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      heroLayout: "split",
      showHeroCta: true,
      ctaStyle: "filled",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "uniform",
      detailsLayout: "two-one",
      ctaLayout: "contact-form",
      ctaGlow: false,
      footerLayout: "columns",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "full-width",
      tagStyle: "pill",
      navStyle: "static",
      navLayout: "standard",
      builderTier: "flash",
    },
  },
  "gutter-punk": {
    slug: "gutter-punk",
    name: "Gutter Punk",
    description:
      "Raw, industrial underground energy. Zero polish, maximum attitude.",
    previewAccent: "#FF3333",
    previewBg: "#0A0A0A",
    previewMode: "dark",
    defaults: {
      template: "gutter-punk",
      preset: "midnight",
      headingFont: "Bebas Neue",
      bodyFont: "Inter",
      heroLayout: "fullbleed",
      showHeroCta: true,
      ctaStyle: "outline",
      showHeroSubtext: false,
      heroSubtext: "",
      galleryLayout: "masonry",
      detailsLayout: "stacked",
      ctaLayout: "simple-minimal",
      ctaGlow: false,
      footerLayout: "minimal-bar",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "full-width",
      tagStyle: "square",
      navStyle: "none",
      navLayout: "minimal",
      builderTier: "flash",
    },
  },
  "dark-cinematic": {
    slug: "dark-cinematic",
    name: "Dark Cinematic",
    description:
      "Photography-forward with atmospheric depth and reveal-on-scroll navigation.",
    previewAccent: "#ffffff",
    previewBg: "#050505",
    previewMode: "dark",
    defaults: {
      template: "dark-cinematic",
      preset: "mono",
      headingFont: "Abril Fatface",
      bodyFont: "Inter",
      heroLayout: "fullbleed",
      showHeroCta: true,
      ctaStyle: "pill",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "carousel",
      detailsLayout: "stacked",
      ctaLayout: "simple-minimal",
      ctaGlow: false,
      footerLayout: "minimal-bar",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "split",
      tagStyle: "outline",
      navStyle: "reveal",
      navLayout: "standard",
      builderTier: "flash",
    },
  },
  "studio-minimal": {
    slug: "studio-minimal",
    name: "Studio Minimal",
    description:
      "Contemporary gallery aesthetic with radical whitespace and clean geometry.",
    previewAccent: "#1a1a1a",
    previewBg: "#ffffff",
    previewMode: "light",
    defaults: {
      template: "studio-minimal",
      preset: "parchment",
      headingFont: "Space Grotesk",
      bodyFont: "Space Grotesk",
      heroLayout: "centered",
      showHeroCta: true,
      ctaStyle: "outline",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "uniform",
      detailsLayout: "two-one",
      ctaLayout: "simple-minimal",
      ctaGlow: false,
      footerLayout: "none",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "full-width",
      tagStyle: "outline",
      navStyle: "static",
      navLayout: "centered",
      builderTier: "flash",
    },
  },
  "fine-line": {
    slug: "fine-line",
    name: "Fine Line",
    description:
      "Delicate and upscale with floating navigation and a soft gallery grid.",
    previewAccent: "#9b8ea0",
    previewBg: "#faf9f7",
    previewMode: "light",
    defaults: {
      template: "fine-line",
      preset: "parchment",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      heroLayout: "centered",
      showHeroCta: true,
      ctaStyle: "outline",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "uniform",
      detailsLayout: "two-one",
      ctaLayout: "contact-form",
      ctaGlow: false,
      footerLayout: "centered",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "full-width",
      tagStyle: "outline",
      navStyle: "floating",
      navLayout: "logo-center",
      builderTier: "flash",
    },
  },
  "traditional-flash": {
    slug: "traditional-flash",
    name: "Traditional Flash",
    description:
      "Bold Americana energy with parchment warmth and ornate typographic detail.",
    previewAccent: "#C1440E",
    previewBg: "#F5F0EB",
    previewMode: "light",
    defaults: {
      template: "traditional-flash",
      preset: "gold",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      heroLayout: "split",
      showHeroCta: true,
      ctaStyle: "filled",
      showHeroSubtext: true,
      heroSubtext: "Tattoo crafted with intention.",
      galleryLayout: "featured",
      detailsLayout: "two-one",
      ctaLayout: "contact-form",
      ctaGlow: false,
      footerLayout: "columns",
      showSpecialties: true,
      showStudioDetails: true,
      aboutLayout: "split",
      tagStyle: "pill",
      navStyle: "static",
      navLayout: "standard",
      builderTier: "flash",
    },
  },
};

export const templateList = Object.values(templates);
```

- [ ] **Step 2: Verify TypeScript is fully clean**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 3: Verify in browser**

With dev server running (`npm run dev`), open `http://localhost:3001/dashboard/builder`. Find the template picker and verify:
- All 9 templates appear (4 original + 5 new)
- Clicking each new template updates the preview to use its layouts
- Gutter Punk uses fullbleed hero + masonry gallery
- Dark Cinematic uses fullbleed + carousel + reveal nav
- Studio Minimal uses centered hero + uniform grid + no footer
- Fine Line uses centered hero + floating nav
- Traditional Flash uses split hero + featured gallery

- [ ] **Step 4: Commit**

```bash
git add lib/data/templates.ts
git commit -m "feat: add 5 new templates (gutter-punk, dark-cinematic, studio-minimal, fine-line, traditional-flash)"
```

---

## Self-Review Notes

- All 6 vibes use valid values from existing union types (`ImageTreatment`, `SurfaceTexture`, `HeadingTextTransform`, `HeadingLetterSpacing`, `HeadingFontWeight`, `TagStyle`, `CtaStyle`, `Density`, `BorderShape`, `DividerStyle`, `AnimationStyle`)
- All 5 new templates use `headingFont` values present in `lib/data/typography-pairings.ts` (Bebas Neue, Abril Fatface, Space Grotesk, Playfair Display)
- All 5 new templates reference `preset` values in the existing `ThemePreset` union (midnight, mono, parchment, gold)
- `navLayout: "minimal"` is a valid `NavLayout` value
- `reset()` now defaults to `vibe: "void"` — consistent with the new type
- `detectVibe` returns `null` (not a default string) when no vibe matches and no stored vibe exists — the picker handles `null` by showing no selection, which is correct when a template hasn't had a vibe applied yet
