# Studio Template Customizer — Design Spec

## Context

Studio owners on the Shader tier ($59.85/mo) get a custom web page but currently have no way to customize it — the "Customize Your Studio Page" button in the dashboard does nothing. This spec defines the template customizer: a builder that lets Shader-tier studios personalize their page's colors, typography, and section styles without changing the template layout structure.

The customizer must feel like Apple designed a web page builder — intuitive, lightweight, impossible to make ugly. Studios can build for free (draft mode) and pay when ready to publish.

## Goals

- Ship two builder modes (owner-selectable): split-screen editor and inline overlay editor
- Provide curated theme presets with safe customization (accent picker, tested backgrounds)
- Live-preview all changes with smooth transitions
- Support undo/redo for fearless experimentation
- Tease Magnum-tier features (section reordering, premium templates) as locked upsells
- Free to build, pay to publish

## Non-Goals (this spec)

- Section reordering / drag-and-drop (Magnum tier, future spec)
- Premium template library (Magnum tier, future spec)
- Custom CSS injection
- Content editing (text, images) — that's a separate feature
- Backend persistence / API routes — mock with localStorage for now

---

## Data Model

### StudioThemeConfig

```typescript
interface StudioThemeConfig {
  // Base theme preset
  preset: ThemePreset

  // Color overrides (only stored if changed from preset defaults)
  accentColor?: string          // hex
  backgroundColor?: string      // hex
  backgroundMode?: 'light' | 'dark'

  // Typography
  headingFont: string           // Google Font name, e.g. 'Bebas Neue'
  bodyFont: string              // Google Font name, e.g. 'Inter'

  // Section layout variants
  heroLayout: 'split' | 'fullbleed' | 'centered'
  galleryLayout: 'featured' | 'uniform' | 'masonry' | 'carousel'
  detailsLayout: 'three-col' | 'two-one' | 'stacked'
  footerStyle: 'glow' | 'minimal'
  tagStyle: 'pill' | 'square' | 'outline'

  // Builder preference (persisted in user settings)
  builderMode: 'split' | 'inline'
}

type ThemePreset = 'midnight' | 'parchment' | 'sage' | 'ocean' | 'gold' | 'mono'
```

### Resolved CSS Variables

The `StudioThemeConfig` resolves to a flat CSS variables object at render time:

```typescript
interface ResolvedThemeVars {
  '--accent': string
  '--accent-bg': string
  '--bg-primary': string
  '--bg-raised': string
  '--bg-sunken': string
  '--bg-deep': string
  '--text-primary': string
  '--text-secondary': string
  '--text-muted': string
  '--border': string
  '--tag-bg': string
  '--tag-text': string
  '--widget-1': string
  '--widget-2': string
  '--widget-3': string
  '--widget-label': string
  '--hero-bg': string
  '--footer-glow': string
  '--heading-font': string
  '--body-font': string
}
```

Resolution logic: start with preset defaults, apply any overrides (accentColor, backgroundColor, backgroundMode). The `resolveTheme(config: StudioThemeConfig): ResolvedThemeVars` function is pure and deterministic.

---

## State Engine: useThemeEditor

```typescript
interface ThemeEditorState {
  config: StudioThemeConfig
  resolvedVars: ResolvedThemeVars
  history: StudioThemeConfig[]     // undo stack (max 50)
  historyIndex: number
  isDirty: boolean
}

interface ThemeEditorActions {
  applyChange: (partial: Partial<StudioThemeConfig>) => void  // merge + push history
  applyPreset: (preset: ThemePreset) => void                  // full preset swap
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  reset: () => void               // back to preset defaults
  saveDraft: () => void            // persist to localStorage (future: API)
  loadDraft: () => StudioThemeConfig | null
}
```

Both builder modes consume this hook via `BuilderProvider` context. No state duplication.

---

## Theme Presets

| Preset | Accent | Background | Mode | Vibe |
|--------|--------|------------|------|------|
| **Midnight Ink** | `#FF3333` (Red) | `#0A0A0A` (Black) | Dark | Bold, industrial, default |
| **Parchment** | `#C1440E` (Rust) | `#F5F0EB` (Cream) | Light | Vintage, warm, traditional |
| **Forest Sage** | `#6B7C5E` (Sage) | `#0A0A0A` (Black) | Dark | Natural, earthy, blackwork |
| **Deep Ocean** | `#3B82F6` (Blue) | `#0c1424` (Navy) | Dark | Cool, clean, modern |
| **Gold Rush** | `#C9A840` (Gold) | `#0A0A08` (Deep black) | Dark | Premium, luxe |
| **Monochrome** | `#ffffff` (White) | `#0A0A0A` (Black) | Dark | Minimal, photography-forward |

### Accent Colors (10)

Red `#FF3333`, Rust `#C1440E`, Sage `#6B7C5E`, Blue `#3B82F6`, Purple `#8B5CF6`, Gold `#C9A840`, Pink `#EC4899`, Orange `#F97316`, Teal `#14B8A6`, White `#ffffff`

### Background Colors (6)

**Dark mode:** Black `#0A0A0A`, Charcoal `#111`, Navy `#1a1a2e`
**Light mode:** Parchment `#F5F0EB`, White `#ffffff`, Mint `#f0f4f0`

### Typography Pairings (6)

| Name | Heading | Body | Character |
|------|---------|------|-----------|
| Bold Industrial | Bebas Neue | Inter | Strong, clean (default) |
| Hand-drawn | Permanent Marker | Inter | Casual, artistic |
| Elegant Serif | Playfair Display | Inter | Upscale, refined |
| Modern Geometric | Space Grotesk | Space Grotesk | Tech-forward |
| Display Statement | Abril Fatface | Inter | High-impact, editorial |
| Western Saloon | Rye | Inter | Vintage Americana |

---

## Component Architecture

```
/dashboard/builder (route)
└── StudioPageBuilder
    └── BuilderProvider (context: useThemeEditor)
        ├── BuilderTopBar
        │   ├── Logo + page name + "Editing" badge
        │   ├── Undo/Redo buttons (Cmd+Z / Cmd+Shift+Z)
        │   ├── Save Draft button
        │   ├── Preview button (opens full-page preview in new tab)
        │   └── Publish button (→ plan gate if no active plan)
        │
        ├── [builderMode === 'split']
        │   └── SplitScreenBuilder
        │       ├── EditorPanel (380px sidebar)
        │       │   ├── EditorTabs
        │       │   ├── ThemePresetsTab → ThemePresetPicker
        │       │   ├── ColorCustomizerTab → AccentColorPicker + BackgroundPicker
        │       │   ├── TypographyTab → TypographyPairPicker
        │       │   └── SectionStylesTab → HeroStylePicker, GalleryStylePicker,
        │       │       DetailsLayoutPicker, FooterStylePicker, TagStylePicker
        │       └── PreviewPane
        │           ├── DeviceToggle (desktop / tablet / mobile)
        │           └── StudioPagePreview
        │
        ├── [builderMode === 'inline']
        │   └── InlineOverlayBuilder
        │       ├── DeviceFrameWrapper (constrains width for mobile/tablet preview)
        │       ├── StudioPagePreview (sections are wrapped in EditableSection)
        │       │   ├── EditableSection (hover highlight, click → SectionPopover)
        │       │   └── SectionPopover (floating, per-section options)
        │       ├── BottomToolbar (Theme / Colors / Type + Reset)
        │       └── ToolbarFlyout (slides up from toolbar)
        │
        └── StudioPagePreview (SHARED — used by both modes)
            ├── HeroSection (split | fullbleed | centered)
            ├── GallerySection (featured | uniform | masonry | carousel)
            ├── DetailsSection (three-col | two-one | stacked)
            └── FooterCTASection (glow | minimal)
```

### Shared Control Components

These atomic components are used by both builder modes — the split-screen puts them in sidebar tabs, the inline mode puts them in flyouts/popovers:

- `ThemePresetPicker` — grid of 6 preset cards with color swatches
- `AccentColorPicker` — grid of 10 color swatches + future custom picker slot
- `BackgroundPicker` — grid of 6 background options (3 dark, 3 light)
- `TypographyPairPicker` — list of 6 pairings with live font previews
- `HeroStylePicker` — 3 layout options with thumbnail previews
- `GalleryStylePicker` — 4 layout options with thumbnail previews
- `DetailsLayoutPicker` — 3 layout options
- `FooterStylePicker` — 2 style options
- `TagStylePicker` — 3 style options with live tag previews

### Magnum Upsell Hints

Shown in the Sections tab (split-screen) or as a locked section in the bottom toolbar (inline):

- **Section Reordering** — "Drag to rearrange sections" with lock icon + "Magnum" badge
- **Premium Templates** — "+6 premium themes" with lock icon + "Magnum" badge

These are purely visual/informational — no functionality, just upsell.

---

## UX Flow

### Entry
1. Owner clicks "Customize Your Studio Page" on studio dashboard
2. Navigates to `/dashboard/builder`
3. Builder loads with saved draft (if exists) or `midnight` preset defaults
4. First-time: subtle tooltip pointing to builder mode toggle

### Editing
- All changes apply instantly to the live preview with smooth CSS transitions (0.45s)
- Every change pushes to undo history
- `Cmd+Z` undo, `Cmd+Shift+Z` redo
- `Escape` closes any open popover/flyout
- `Cmd+S` saves draft

### Saving
- **Save Draft** — persists StudioThemeConfig to localStorage (future: API)
- **Publish** — checks for active Shader+ plan
  - If no plan: shows plan selection modal
  - If plan active: publishes (marks config as live)

### Device Preview
- **Split-screen mode**: Desktop/Tablet/Mobile buttons resize the preview pane (100% / 768px / 390px max-width)
- **Inline mode**: `DeviceFrameWrapper` constrains the page width and adds a centered frame with subtle device chrome

### Builder Mode Switching
- Available in Settings > Appearance (alongside theme toggle)
- Preference stored as `builderMode` in user settings
- Default: `'inline'`

---

## Key Files to Create

```
components/
  builder/
    index.tsx                      # barrel export
    builder-provider.tsx           # BuilderProvider context
    builder-top-bar.tsx            # top bar with save/publish/undo/redo
    split-screen-builder.tsx       # split-screen shell
    inline-overlay-builder.tsx     # inline overlay shell
    editor-panel.tsx               # sidebar for split-screen
    editor-tabs.tsx                # tab navigation
    preview-pane.tsx               # right panel for split-screen
    device-toggle.tsx              # desktop/tablet/mobile switcher
    device-frame-wrapper.tsx       # responsive frame for inline mode
    editable-section.tsx           # hover/click wrapper for inline sections
    section-popover.tsx            # floating popover for inline section editing
    bottom-toolbar.tsx             # bottom bar for inline mode
    toolbar-flyout.tsx             # flyout panel from toolbar
    studio-page-preview.tsx        # shared preview rendering component
    controls/
      index.tsx
      theme-preset-picker.tsx
      accent-color-picker.tsx
      background-picker.tsx
      typography-pair-picker.tsx
      hero-style-picker.tsx
      gallery-style-picker.tsx
      details-layout-picker.tsx
      footer-style-picker.tsx
      tag-style-picker.tsx
      magnum-upsell-hint.tsx

lib/
  data/
    theme-presets.ts               # preset definitions (6 themes)
    typography-pairings.ts         # 6 pairings with metadata
    builder-options.ts             # section variant options with labels/thumbnails

  hooks/
    use-theme-editor.ts            # state engine (config, undo/redo, resolve)

  utils/
    resolve-theme.ts               # StudioThemeConfig → ResolvedThemeVars
    color-utils.ts                 # hexToRgba, lighten, darken helpers

  types/
    builder.ts                     # StudioThemeConfig, ResolvedThemeVars, etc.

app/
  dashboard/
    builder/
      page.tsx                     # builder route
      layout.tsx                   # minimal layout (no footer/nav)
```

### Key Files to Modify

- `components/dashboard/studio/studio-page-card.tsx` — wire "Customize" button to `/dashboard/builder`
- `components/settings/appearance-section.tsx` — add builder mode toggle
- `lib/types/index.ts` — add StudioThemeConfig and related types
- `app/studios/[id]/page.tsx` — read saved theme config, apply CSS variables to render

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+S` | Save draft |
| `Escape` | Close active popover/flyout |

---

## Verification Plan

1. **Builder loads**: Navigate to `/dashboard/builder` — page renders with Midnight Ink defaults
2. **Theme switching**: Click each of the 6 presets — preview updates with correct colors, smooth transitions
3. **Color picker**: Change accent color — all accent-colored elements update (buttons, tags, labels, bio border, footer glow)
4. **Background picker**: Switch between dark and light backgrounds — text colors invert appropriately
5. **Typography**: Switch pairings — headings and body text change fonts
6. **Section variants**: Test each hero layout (3), gallery layout (4), details layout (3), footer style (2), tag style (3)
7. **Undo/redo**: Make 5+ changes, then Cmd+Z back through each, Cmd+Shift+Z forward
8. **Device preview**: Toggle desktop/tablet/mobile — preview resizes correctly in both builder modes
9. **Builder mode switch**: Toggle between split-screen and inline in settings — builder re-renders in new mode with same config
10. **Save/load draft**: Save, refresh page, verify draft restores
11. **Publish gate**: Click Publish without a plan — plan selection modal appears
12. **Magnum hints**: Verify section reordering and premium templates show as locked
13. **Responsive**: Test builder itself on different screen sizes
