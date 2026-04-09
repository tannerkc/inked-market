# Studio Builder: Personality Dimensions & Two-Tier Flow

## Context

The current studio builder offers ~6,500 unique combinations through templates, presets, font pairs, and section layouts. Despite the volume, the *visual distance* between combinations is small -- two studios using the same preset and font pair look nearly identical. The builder also front-loads all controls in 4 tabs regardless of whether the user wants quick setup or deep customization, creating a one-size-fits-none experience.

This spec introduces:
1. **8 personality dimensions** -- new customization levers that dramatically increase visual differentiation between studios
2. **Two-tier builder flow** -- Flash (fast, curated) and Custom (full control) modes that match the builder's depth to the user's intent

The goal: a studio using Inked Market's builder should produce a page that looks like a custom-built tattoo website, not a template.

---

## Entry Flow

When a user clicks "Customize your studio page" from the dashboard:

1. **Editor mode selection** -- Choose between inline-overlay or split-panel editor (persisted in localStorage as `inked-builder-mode`, already implemented)
2. **Tier selection** -- Choose between Flash and Custom:
   - **Flash** -- "Pick a look and go" / small subtext describing the fast path
   - **Custom** -- "Full control over every detail" / small subtext describing the power path
3. Tier choice persisted in localStorage alongside `inked-builder-mode`
4. Users can switch tiers at any time via a tier badge at the top of the editor panel

---

## Flash Mode

Three tabs. Designed for completion in under a minute.

### Tab 1: Theme & Colors

**Visible by default:**
- Theme preset picker (6 presets, existing `ThemePresetPicker` component) -- selects mood/atmosphere
- Accent color picker (10 colors, existing `AccentColorPicker` component) -- drives buttons, headings, tags, glows
- Background picker (6 options, existing `BackgroundPicker` component) -- dark/light backgrounds

**Hidden (expandable):**
- "Brand color" section -- full spectrum color picker for studios with existing brand colors. When picked, overrides the accent color with any hex value. Uses the existing `resolveTheme` accent override logic.

### Tab 2: Typography

- Typography pair picker (6 pairs, existing `TypographyPairPicker` component)
- No advanced controls in Flash mode

### Tab 3: Sections

**Vibe picker (new component: `VibePicker`):**
Four curated personality bundles. Selecting a vibe sets spacing density, border/shape language, divider style, and animation style as a coordinated group:

| Vibe | Density | Shape | Divider | Animation |
|------|---------|-------|---------|-----------|
| Bold & tight | compact | sharp | solid | none |
| Clean & balanced | balanced | rounded (subtle) | solid | fade-up |
| Luxe & airy | luxe | rounded | gradient | fade-up |
| Editorial | balanced | editorial (mixed) | ornament | slide |

**Show/hide toggles:**
- Hero tagline
- Hero CTA button
- About section
- Specialties
- Studio details
- CTA glow

**Hidden (expandable) -- "Override sections":**
- Hero layout (split / fullbleed / centered)
- Gallery layout (featured / uniform / masonry / carousel)
- Footer CTA layout (simple-minimal / contact-form / map-info / booking)

These override the vibe's defaults for individual sections without switching to Custom mode.

---

## Custom Mode

Five tabs. All controls available, organized by category.

### Tab 1: Theme

**Visible by default:**
- Theme preset picker (existing)
- Accent color picker (existing)
- Background picker (existing)

**Hidden (expandable) -- "Advanced color":**
- Full spectrum color picker (any hex value)
- Secondary accent color -- optional second brand color used for gradients, alternating tags, and dual-tone elements
- Gradient direction (diagonal / horizontal / radial / none) -- controls how primary and secondary accents blend in gradient contexts (CTA backgrounds, footer glow, hero overlays)
- Glow intensity (none / subtle / medium / intense) -- controls the strength of accent color glows on CTA sections and interactive elements

### Tab 2: Typography

**Visible by default:**
- Typography pair picker (existing)

**Hidden (expandable) -- "Fine-tune typography":**
- Letter spacing (tight / normal / wide) -- applied to headings via `--heading-letter-spacing` CSS variable
- Text transform (uppercase / mixed case / title case) -- applied to headings and navigation via `--heading-text-transform`
- Heading weight (light / regular / bold / black) -- applied via `--heading-font-weight`

### Tab 3: Sections

All section controls displayed in visually grouped cards (bordered containers with section name + current value in header). Uses existing picker components for each section:

**Per-section groups:**
- **Navigation** -- nav style picker (none / static / floating / reveal)
- **Hero** -- layout picker (split / fullbleed / centered), tagline toggle, CTA toggle, CTA style (filled / outline / pill)
- **About** -- layout picker (split / full-width / none), specialties toggle, details toggle, tag style picker (pill / square / outline) *(tag style moved here from standalone)*
- **Gallery** -- layout picker (featured / uniform / masonry / carousel)
- **Details** -- layout picker (3-col / 2+1 / stacked)
- **Footer** -- CTA layout (simple-minimal / contact-form / map-info / booking), glow toggle, footer layout (columns / minimal-bar / centered / none)

**Page Style group (new, visually distinct with accent border):**
- Density (compact / balanced / luxe)
- Border/shape language (sharp / rounded / editorial)
- Divider style (solid / gradient / dotted / ornament)
- Animation style (none / fade-up / scale / slide)

### Tab 4: Effects

**Surface textures (new: `TexturePicker`):**
Six texture overlays applied as CSS pseudo-elements with adjustable opacity:
- None (default)
- Film grain -- analog photography noise (existing `film-grain` utility, refined)
- Parchment -- warm paper fibers, subtle creases, tonal variation
- Concrete -- industrial micro-texture with edge darkening
- Leather -- crosshatch pattern with warm center highlight
- Geometric -- repeating triangular/hexagonal pattern in accent color at low opacity

Implementation: each texture is a CSS `::after` pseudo-element on `[data-builder-root]` with `pointer-events: none` and configurable opacity via `--texture-opacity` CSS variable.

**Image treatments (new: `ImageTreatmentPicker`):**
Six CSS filter treatments applied globally to portfolio images:
- Raw (default) -- no filter
- High-contrast B&W -- `grayscale(1) contrast(1.4) brightness(0.9)`
- Duotone -- grayscale + accent color overlay via `mix-blend-mode: color`
- Film emulation -- `contrast(0.95) saturate(0.7) sepia(0.15)` with warm top fade
- Desaturated + accent pop -- `saturate(0.2) contrast(1.1)` with accent radial overlay
- Vignette -- `saturate(1.1) contrast(1.05)` with dark-edge radial gradient

Implementation: CSS filters applied to `.gallery-item` containers. Duotone dynamically uses the studio's resolved `--accent` color. Zero image processing cost -- purely client-side CSS.

### Tab 5: Brand

**Logo upload:**
- Drag-and-drop zone accepting SVG, PNG, JPG
- Stored as a data URL in the builder config (localStorage draft), uploaded to CDN on publish

**Logo placement (new: `LogoPlacementPicker`):**
- Nav -- logo replaces text studio name in navigation bar
- Hero -- logo displayed as centerpiece in hero section above studio name
- Watermark -- oversized, low-opacity logo as page background texture

**Toggles:**
- Gallery watermarks -- small branded badge on each portfolio image (logo + studio name)
- Custom social preview -- auto-generated Open Graph image using logo, studio name, accent colors, and tagline

---

## New Config Properties

Added to `StudioThemeConfig` in `lib/types/builder.ts`:

```typescript
// Tier
builderTier: 'flash' | 'custom'

// Vibe (Flash mode -- maps to multiple properties)
vibe?: 'bold' | 'clean' | 'luxe' | 'editorial'

// Color depth (Custom mode)
secondaryAccentColor?: string    // hex
gradientDirection?: 'diagonal' | 'horizontal' | 'radial' | 'none'
glowIntensity?: 'none' | 'subtle' | 'medium' | 'intense'

// Typography fine-tuning (Custom mode)
headingLetterSpacing?: 'tight' | 'normal' | 'wide'
headingTextTransform?: 'uppercase' | 'mixed' | 'title'
headingFontWeight?: 'light' | 'regular' | 'bold' | 'black'

// Page style
density?: 'compact' | 'balanced' | 'luxe'
borderShape?: 'sharp' | 'rounded' | 'editorial'
dividerStyle?: 'solid' | 'gradient' | 'dotted' | 'ornament'
animationStyle?: 'none' | 'fade-up' | 'scale' | 'slide'

// Effects
surfaceTexture?: 'none' | 'film-grain' | 'parchment' | 'concrete' | 'leather' | 'geometric'
textureOpacity?: number           // 0-1, default 0.5
imageTreatment?: 'none' | 'bw' | 'duotone' | 'film' | 'desat' | 'vignette'

// Brand
logoUrl?: string
logoPlacement?: 'nav' | 'hero' | 'watermark'
galleryWatermarks?: boolean
customSocialPreview?: boolean
```

---

## New CSS Variables

Added to `ResolvedThemeVars` via `resolveTheme`:

```css
/* Color depth */
--accent-secondary: <hex>;
--gradient-direction: <deg or keyword>;
--glow-intensity: <0-1 multiplier>;

/* Typography */
--heading-letter-spacing: <value>;
--heading-text-transform: <value>;
--heading-font-weight: <value>;

/* Page style */
--section-padding: <value>;          /* compact: 2rem, balanced: 4rem, luxe: 6rem */
--element-gap: <value>;              /* compact: 0.5rem, balanced: 1rem, luxe: 1.5rem */
--border-radius: <value>;            /* sharp: 0, rounded: 0.75rem, editorial: 0.125rem */
--border-radius-lg: <value>;         /* sharp: 0, rounded: 1rem, editorial: 0.25rem */

/* Effects */
--texture-opacity: <0-1>;
--image-filter: <CSS filter string>;
--image-overlay: <CSS background for ::after>;
```

---

## New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TierSelector` | `components/builder/tier-selector.tsx` | Flash/Custom choice screen with descriptions |
| `VibePicker` | `components/builder/controls/vibe-picker.tsx` | 4 vibe cards for Flash mode |
| `TexturePicker` | `components/builder/controls/texture-picker.tsx` | 6 texture overlay options |
| `ImageTreatmentPicker` | `components/builder/controls/image-treatment-picker.tsx` | 6 CSS filter options |
| `LogoUpload` | `components/builder/controls/logo-upload.tsx` | Drag-and-drop logo upload with preview |
| `LogoPlacementPicker` | `components/builder/controls/logo-placement-picker.tsx` | Nav/Hero/Watermark choice |
| `DensityPicker` | `components/builder/controls/density-picker.tsx` | Compact/Balanced/Luxe |
| `BorderShapePicker` | `components/builder/controls/border-shape-picker.tsx` | Sharp/Rounded/Editorial |
| `DividerStylePicker` | `components/builder/controls/divider-style-picker.tsx` | Solid/Gradient/Dotted/Ornament |
| `AnimationStylePicker` | `components/builder/controls/animation-style-picker.tsx` | None/Fade/Scale/Slide |
| `AdvancedColorPanel` | `components/builder/controls/advanced-color-panel.tsx` | Spectrum picker, secondary accent, gradient, glow |
| `TypographyTuner` | `components/builder/controls/typography-tuner.tsx` | Letter spacing, transform, weight |
| `FlashEditor` | `components/builder/flash-editor.tsx` | 3-tab Flash mode editor panel |
| `CustomEditor` | `components/builder/custom-editor.tsx` | 5-tab Custom mode editor panel |
| `PageStyleGroup` | `components/builder/controls/page-style-group.tsx` | Combined density + shape + divider + animation |

---

## Modified Files

| File | Changes |
|------|---------|
| `lib/types/builder.ts` | Add new config properties and type unions |
| `lib/utils/resolve-theme.ts` | Add resolution for new CSS variables (color depth, typography, page style, effects) |
| `lib/data/theme-presets.ts` | No changes -- presets remain as-is |
| `lib/data/builder-options.ts` | Add vibe definitions, texture definitions, image treatment definitions |
| `lib/hooks/use-theme-editor.ts` | Add `applyVibe()` method, handle new config properties in `applyChange()` |
| `app/dashboard/builder/page.tsx` | Add tier selection step before entering builder, pass tier to provider |
| `app/dashboard/builder/layout.tsx` | No changes needed |
| `components/builder/builder-provider.tsx` | Expose `builderTier` in context |
| `components/builder/split-screen-builder.tsx` | Render `FlashEditor` or `CustomEditor` based on tier |
| `components/builder/inline-overlay-builder.tsx` | Adapt bottom toolbar tabs to tier, move tag style to about popover |
| `components/builder/editor-panel.tsx` | Replace with tier-aware routing to Flash/Custom editors |
| `components/builder/studio-page-preview.tsx` | Apply new CSS variables for density, borders, textures, image treatments, animations |
| `components/builder/preview/` (all sections) | Add density-aware padding, border-radius from shape, animation entrance styles |
| `components/builder/controls/about-layout-picker.tsx` | Add tag style picker (moved from standalone) |

---

## Inline Builder Changes

The inline-overlay builder adapts to tier similarly:

- **Flash:** Bottom toolbar flyouts map to the 3 Flash tabs (Theme & Colors, Typography, Sections)
- **Custom:** Bottom toolbar flyouts include all 5 Custom tabs
- **Tag style picker** moves into the About section's click popover (both tiers)
- Section popovers in Custom mode include per-section controls as they do today, plus the new Page Style controls accessible via a "Page Style" button in the bottom toolbar

---

## Vibe-to-Config Mapping

When a vibe is selected in Flash mode, it sets multiple config properties at once:

```typescript
const VIBE_DEFAULTS: Record<Vibe, Partial<StudioThemeConfig>> = {
  bold: {
    density: 'compact',
    borderShape: 'sharp',
    dividerStyle: 'solid',
    animationStyle: 'none',
  },
  clean: {
    density: 'balanced',
    borderShape: 'rounded',
    dividerStyle: 'solid',
    animationStyle: 'fade-up',
  },
  luxe: {
    density: 'luxe',
    borderShape: 'rounded',
    dividerStyle: 'gradient',
    animationStyle: 'fade-up',
  },
  editorial: {
    density: 'balanced',
    borderShape: 'editorial',
    dividerStyle: 'ornament',
    animationStyle: 'slide',
  },
}
```

When switching from Flash to Custom, the vibe's resolved values populate the individual Page Style controls so nothing is lost.

---

## Tier Switching Behavior

- **Flash -> Custom:** All current config preserved. Vibe is decomposed into its constituent density/shape/divider/animation values. No data loss.
- **Custom -> Flash:** Config preserved. If the current density/shape/divider/animation match a known vibe, that vibe is pre-selected. Otherwise "Clean & balanced" is selected as default (the vibe picker shows the closest match).
- Switching shows a brief confirmation: "Switch to Custom? You'll get more control over every detail." / "Switch to Flash? Your current settings will be preserved."

---

## Verification

1. **Flash flow:** Select a template, pick theme preset, choose accent color, select typography, pick a vibe, toggle a few sections on/off -- preview updates live with all changes reflected
2. **Custom flow:** All Flash controls work, plus: advanced color panel (secondary accent, gradient, glow), typography tuner, full section controls, texture overlay visible in preview, image treatment applied to gallery, logo displays in chosen placement
3. **Tier switching:** Customize in Custom, switch to Flash -- settings preserved and vibe picker reflects closest match. Switch back -- all custom settings still intact
4. **Inline builder:** Both tiers work in inline-overlay mode with adapted toolbar flyouts, tag style appears in About popover
5. **Draft persistence:** Save draft in Flash, reload, tier and all settings restored. Same for Custom.
6. **New CSS variables:** Density changes section padding live, border shape changes all radii, texture overlay appears/disappears, image treatment filter applies to gallery items
