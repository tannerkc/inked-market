# Vibes Redesign + New Templates

**Date:** 2026-04-08
**Status:** Approved

---

## Problem

The 4 existing vibes (bold, clean, luxe, editorial) are too similar. They each only set 4 subtle properties (density, borderShape, dividerStyle, animationStyle), producing imperceptible differences in the preview. Users can't distinguish them by feel.

---

## Design Decisions

### Vibes own atmosphere, templates own structure

Vibes do not touch section layouts (heroLayout, galleryLayout, navStyle, etc.). Templates own those. This keeps the two controls orthogonal — no overlap, no override tracking needed.

Vibes control the full **visual atmosphere**: image treatment, surface texture, typography personality (weight, transform, tracking), spacing density, edge style, divider style, and animation. These combinations produce dramatically different feels on any template layout.

### No override tracking

Since vibes and section pickers touch completely disjoint properties, there is no need for a `userOverriddenSections` mechanism or an `applySection` wrapper. `applyChange` remains the single mutation API.

---

## 6 New Vibes

| Vibe | Image | Texture | Type weight | Transform | Tracking | Density | Edges | Divider | Animation |
|---|---|---|---|---|---|---|---|---|---|
| **Raw** | bw | concrete | black | uppercase | tight | compact | sharp | solid | none |
| **Ghost** | desat | film-grain | light | mixed | wide | luxe | editorial | gradient | fade-up |
| **Americana** | film | parchment | black | uppercase | normal | balanced | editorial | ornament | slide |
| **Noir** | vignette | film-grain | bold | uppercase | tight | balanced | sharp | none | scale |
| **Void** | none | none | light | title | wide | luxe | rounded | none | fade-up |
| **Sacred** | duotone | leather | bold | mixed | normal | balanced | rounded | dotted | fade-up |

Each vibe also sets `tagStyle` and `ctaStyle`:

| Vibe | tagStyle | ctaStyle |
|---|---|---|
| Raw | square | outline |
| Ghost | outline | outline |
| Americana | pill | filled |
| Noir | outline | pill |
| Void | outline | outline |
| Sacred | pill | filled |

---

## 5 New Templates

These were designed as distinct aesthetic directions during the vibe brainstorm. They join the existing 4 templates (bold-editorial, clean-minimal, immersive-dark, warm-artisan).

### Gutter Punk
Dark, industrial, underground street energy.
- preset: midnight | heading: Bebas Neue | body: Inter
- hero: fullbleed | gallery: masonry | nav: none | footer: minimal-bar
- about: full-width | cta: simple-minimal | ctaGlow: false
- tagStyle: square | ctaStyle: outline

### Dark Cinematic
Photography-forward, atmospheric, reveal-on-scroll.
- preset: mono | heading: Abril Fatface | body: Inter
- hero: fullbleed | gallery: carousel | nav: reveal | footer: minimal-bar
- about: split | cta: simple-minimal | ctaGlow: false
- tagStyle: outline | ctaStyle: pill

### Studio Minimal
Contemporary gallery aesthetic, radical whitespace.
- preset: parchment | heading: Space Grotesk | body: Space Grotesk
- hero: centered | gallery: uniform | nav: static | footer: none
- about: full-width | cta: simple-minimal | ctaGlow: false
- tagStyle: outline | ctaStyle: outline

### Fine Line
Delicate, upscale, floating nav, soft gallery.
- preset: parchment | heading: Playfair Display | body: Inter
- hero: centered | gallery: uniform | nav: floating | footer: centered
- about: full-width | cta: contact-form | ctaGlow: false
- tagStyle: outline | ctaStyle: outline

### Traditional Flash
Bold Americana, parchment warmth, ornate detail.
- preset: gold | heading: Playfair Display | body: Inter
- hero: split | gallery: featured | nav: static | footer: columns
- about: split | cta: contact-form | ctaGlow: false
- tagStyle: pill | ctaStyle: filled

---

## Files to Change

### 4 files for vibes

1. **`lib/types/builder.ts`**
   - `Vibe` type: replace `"bold" | "clean" | "luxe" | "editorial"` with `"raw" | "ghost" | "americana" | "noir" | "void" | "sacred"`

2. **`lib/data/builder-options.ts`**
   - `VibeDefinition.defaults` interface: add `imageTreatment`, `surfaceTexture`, `headingTextTransform`, `headingLetterSpacing`, `headingFontWeight`, `tagStyle`, `ctaStyle`
   - `vibeOptions` array: replace 4 entries with 6 new ones per the table above

3. **`lib/hooks/use-theme-editor.ts`**
   - `applyVibe`: apply all 11 properties (not just 4)

4. **`components/builder/controls/vibe-picker.tsx`**
   - `detectVibe`: updated to match on expanded property set
   - Grid: 6 cards (2-col, 3 rows)

### 2 files for templates

5. **`lib/types/builder.ts`**
   - `TemplateSlug`: add `"gutter-punk" | "dark-cinematic" | "studio-minimal" | "fine-line" | "traditional-flash"`

6. **`lib/data/templates.ts`**
   - Add 5 new `TemplateDefinition` entries per the specs above

---

## Out of Scope

- No new UI for template selection (existing picker handles it)
- No vibe applied by default when selecting a template (user chooses independently)
- No migration of existing saved drafts (old vibe values fall back to "ghost" via existing `?? "clean"` fallback pattern, which will be updated to `?? "ghost"`)
