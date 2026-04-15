# Mobile-Native Studio Builder

## Context

The studio builder currently forces mobile users into the desktop inline overlay mode -- a floating toolbar + flyouts designed for wide screens. The result is cramped controls, awkwardly positioned 360px flyouts, and no touch gestures. Shop owners claiming their listing from a phone get a degraded experience that undermines the "5-minute onboarding from phone" goal.

This spec defines a new mobile-native builder that feels like editing in Instagram or Canva mobile: tap what you see, controls slide up from the bottom, everything is in the thumb zone. Desktop remains completely untouched.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mobile feel | Native app (bottom sheets, gestures, thumb-zone nav) | Shop owners expect phone-native interactions |
| Scope | Tiered: Flash fully mobile-capable, Custom structured but complete | Flash is already simple; Custom needs guided flow |
| Architecture | Separate mobile component tree, shared state + controls | Maximum design freedom, zero desktop risk |
| Interaction model | Contextual tap-to-edit (Model C) | Preview is the canvas; tap sections to edit them |
| Global access | Bottom mini-bar (Theme, Type, Sections, Effects*, Brand*) | Always visible, thumb-zone, doesn't obstruct preview |
| Sheet behavior | One sheet at a time, content swaps seamlessly | Simple mental model, no stacking confusion |

## Component Architecture

### Component Tree

```
BuilderProvider (existing, shared -- zero changes)
  |
  MobileBuilder
    |
    +-- MobileTopBar              44px fixed top
    |
    +-- MobilePreviewCanvas       flex-1 scrollable, tap-enabled
    |     +-- EditableSection     (existing, reused)
    |     +-- preview/* sections  (existing, reused)
    |
    +-- MobileMiniBar             56px fixed bottom + safe area
    |
    +-- MobileSheetOrchestrator   context + reducer
          +-- MobileControlSheet  enhanced BottomSheet
                +-- control pickers (existing, reused)
```

### New Files

All new files go in `components/builder/mobile/`:

| File | Purpose |
|------|---------|
| `mobile-builder.tsx` | Top-level shell: fixed layout with top bar, scrollable preview, mini bar, sheet |
| `mobile-top-bar.tsx` | Compact header: back, studio name, undo/redo icons, save pill, publish pill |
| `mobile-preview-canvas.tsx` | Scrollable themed preview with tappable EditableSection wrappers |
| `mobile-mini-bar.tsx` | Persistent bottom bar with global control icons, tier-aware button set |
| `mobile-sheet-orchestrator.tsx` | React context + useReducer managing sheet open/close state machine |
| `mobile-control-sheet.tsx` | BottomSheet wrapper with swipe-to-dismiss gesture and dynamic content |
| `mobile-section-controls.tsx` | Maps section IDs to their control picker compositions |
| `mobile-global-controls.tsx` | Maps global tab IDs to their control picker compositions |
| `use-swipe-dismiss.ts` | Lightweight pointer events hook for drag-down-to-dismiss |
| `index.tsx` | Barrel export |

### Modified Files

| File | Change |
|------|--------|
| `app/dashboard/builder/page.tsx` | When `isMobile`, render `<MobileBuilder />` instead of `InlineOverlayBuilder`. Hide existing `BuilderTopBar` on mobile. ~10 lines changed. |

**No other existing files are modified.**

## Routing and Detection

The existing mobile detection in `page.tsx` (lines 14-28) uses `useSyncExternalStore` with `matchMedia("(max-width: 767px)")`. This stays exactly as-is.

Current behavior (line 174):
```ts
const effectiveMode = isMobile ? "inline" : mode;
```

New behavior:
```ts
const effectiveMode = isMobile ? "mobile" : mode;
```

The `"mobile"` value is ephemeral -- derived from viewport at runtime, never persisted to localStorage or `StudioThemeConfig`. The `BuilderMode` type does not change. The render tree adds one branch:

```tsx
{effectiveMode === "mobile" ? (
  <MobileBuilder />
) : effectiveMode === "split" ? (
  <SplitScreenBuilder />
) : (
  <InlineOverlayBuilder />  // existing, untouched
)}
```

`MobileBuilder` sits inside the existing `<BuilderProvider>` wrapper, inheriting the full shared state.

## Component Specifications

### MobileBuilder (`mobile-builder.tsx`)

Top-level shell. No props -- reads everything from `useBuilder()`.

```
<MobileSheetProvider>
  <div className="fixed inset-0 flex flex-col bg-chrome-bg">
    <MobileTopBar />
    <div className="flex-1 overflow-hidden relative">
      <MobilePreviewCanvas />
      <MobileControlSheet />
    </div>
    <MobileMiniBar />
  </div>
</MobileSheetProvider>
```

Provides `OverlayContext` via a `pointer-events-none` overlay div for portal-based sheets.

### MobileTopBar (`mobile-top-bar.tsx`)

Height: 44px (iOS standard). Dark chrome background with blur.

```
[ < back ] [ Studio Name ] [ unsaved dot ] [ undo ] [ redo ] [ Save ] [ Publish ]
```

Differences from existing `BuilderTopBar`:
- No "INKED MARKET" branding
- No "EDITING" badge
- No "Mock Data" toggle
- No "Preview" button (canvas IS the preview)
- Unsaved state shown as a subtle dot on the Save button, not a badge
- Undo/redo are icon-only (no text labels)
- Save and Publish are compact pills

### MobilePreviewCanvas (`mobile-preview-canvas.tsx`)

Full-viewport scrollable preview. Renders all visible sections wrapped in `EditableSection`.

```tsx
<div
  data-builder-root
  data-texture={surfaceTexture}
  data-animation={animationStyle}
  style={cssVarStyle}
  className="min-h-full"
>
  {visibleSections.map(section => (
    <EditableSection
      key={section.id}
      name={section.name}
      isActive={sheetState.sectionId === section.id}
      onClick={() => openSection(section.id)}
    >
      <section.component />
    </EditableSection>
  ))}
</div>
```

Key decisions:
- Reuses `EditableSection` directly (red outlines + floating labels work on touch)
- No `SectionPopover` -- taps dispatch to the sheet orchestrator instead
- No `DeviceFrameWrapper` -- the phone IS the device, no device toggle
- Bottom padding accounts for MobileMiniBar height + safe area

### MobileMiniBar (`mobile-mini-bar.tsx`)

Height: 56px (48px content + `env(safe-area-inset-bottom)` padding).

```
Flash tier:   [ Theme ] [ Type ] [ Sections ] [ Reset ]
Custom tier:  [ Theme ] [ Type ] [ Sections ] [ Effects ] [ Brand ] [ Reset ]
```

Each button: 32x32 icon circle with 9px label beneath. Active state: red icon + red label. Arranged with `justify-around` spacing.

Tapping an icon calls `openGlobal(tabId)` on the sheet orchestrator. Tapping the active icon again closes the sheet (toggle behavior).

Background: `bg-ink-black/95 backdrop-blur-xl border-t border-chrome-muted`.

### MobileSheetOrchestrator (`mobile-sheet-orchestrator.tsx`)

React context + `useReducer` managing which sheet is open.

**State:**
```ts
interface MobileSheetState {
  isOpen: boolean;
  type: "section" | "global" | null;
  sectionId: string | null;     // when type === "section"
  globalTab: string | null;     // when type === "global"
}
```

**Actions:**
```ts
type MobileSheetAction =
  | { type: "OPEN_SECTION"; sectionId: string }
  | { type: "OPEN_GLOBAL"; tab: string }
  | { type: "CLOSE" }
```

**Rules:**
- `OPEN_SECTION` with same sectionId -> toggle close
- `OPEN_SECTION` with different sectionId -> swap content (sheet stays open)
- `OPEN_GLOBAL` with same tab -> toggle close
- `OPEN_GLOBAL` with different tab -> swap content
- `CLOSE` -> close everything

**Context API:**
```ts
interface MobileSheetContextValue {
  state: MobileSheetState;
  openSection: (sectionId: string) => void;
  openGlobal: (tab: string) => void;
  close: () => void;
}
```

### MobileControlSheet (`mobile-control-sheet.tsx`)

Wraps the existing `BottomSheet` from `components/ui/bottom-sheet.tsx`. Adds:
1. Swipe-to-dismiss gesture via `use-swipe-dismiss` hook
2. Dynamic content rendering based on orchestrator state
3. Adaptive height (section sheets: `max-h-[50vh]`, global sheets: `max-h-[70vh]`)

**Header for section sheets:**
```
[ HERO SECTION ]                 [ 2 of 5 ] [ < ] [ > ]
```
Arrows navigate prev/next section. Section indicator shows position.

**Header for global sheets:**
```
[ THEME & COLORS ]               [ Global ] [ x ]
```

Content rendered by `SectionSheetContent` or `GlobalSheetContent` based on state.

### Section Controls Mapping (`mobile-section-controls.tsx`)

Maps section IDs to control picker compositions. Extracted from the section definitions in `InlineOverlayBuilder` (lines 164-234).

| Section | Flash Controls | Custom Additions |
|---------|---------------|-----------------|
| nav | NavStylePicker | + NavLayoutPicker, MobileMenuTypePicker |
| hero | HeroStylePicker | (same) |
| about | AboutLayoutPicker | + TagStylePicker |
| gallery | GalleryStylePicker | (same) |
| artist-strips | GalleryPhotosPicker | (same) |
| details | DetailsLayoutPicker | (same) |
| footer-cta | CtaStylePicker | (same) |
| footer | FooterStylePicker | + FooterLayoutPicker |

### Global Controls Mapping (`mobile-global-controls.tsx`)

Maps global tab IDs to control picker compositions. Extracted from flyout content in `InlineOverlayBuilder` (lines 288-406).

| Tab | Flash Controls | Custom Additions |
|-----|---------------|-----------------|
| theme | TemplateSwitcher, ThemePresetPicker, AccentColorPicker, BackgroundPicker | + AdvancedColorPanel |
| type | TypographyPairPicker | + TypographyTuner |
| sections | VibePicker + show/hide toggles | PageStyleGroup |
| effects | (not available) | TexturePicker, ImageTreatmentPicker |
| brand | (not available) | LogoUpload, LogoPlacementPicker, toggle rows |

### Swipe-to-Dismiss Hook (`use-swipe-dismiss.ts`)

Lightweight custom hook using the Pointer Events API (no external dependencies).

**Behavior:**
1. `pointerdown` on drag handle area captures initial Y position
2. `pointermove` (tracked on window) applies damped `translateY` to sheet
3. `pointerup` with delta-Y > 80px threshold triggers dismiss; otherwise springs back
4. Only downward swipes are tracked; upward movement is ignored

**API:**
```ts
function useSwipeDismiss(options: {
  onDismiss: () => void;
  threshold?: number;  // default 80px
  enabled?: boolean;
}): {
  handleRef: React.RefObject<HTMLDivElement>;
  dragStyle: React.CSSProperties;
  onPointerDown: React.PointerEventHandler;
}
```

## Reuse Strategy

### Reused Directly (zero changes)

- `BuilderProvider` + `useBuilder()` context
- `useThemeEditor` hook (undo/redo, save/load, applyChange)
- All 32 control pickers in `components/builder/controls/`
- All 10 preview section components in `components/builder/preview/`
- `EditableSection` component
- `OverlayContext` for portal targeting
- `TemplateSwitcher` component

### Wrapped (thin enhancement)

- `BottomSheet` -- wrapped by `MobileControlSheet` adding swipe gesture + dynamic content

### Not Reused (replaced by mobile equivalents)

- `BuilderTopBar` -> `MobileTopBar`
- `BottomToolbar` + `ToolbarFlyout` -> `MobileMiniBar` + `MobileControlSheet`
- `SectionPopover` -> bottom sheet via orchestrator
- `DeviceFrameWrapper` + `DeviceToggle` -> not needed (phone IS the device)

## Flash vs Custom Tier

The tier is stored in `config.builderTier` and read via `useBuilder()`. Differences surface in:

1. **MobileMiniBar**: Flash shows 4 icons, Custom shows 6
2. **Section sheet content**: Custom adds extra pickers per section
3. **Global sheet content**: Custom unlocks Effects and Brand tabs, adds advanced controls to Theme and Type

Tier switching: accessible via a small segmented control in `MobileTopBar`, keeping the mini-bar uncluttered.

## Potential Challenges

1. **TemplateSwitcher dropdown clipping**: Its absolute-positioned dropdown may clip inside `overflow-y-auto` sheets. Solution: render as inline selection on mobile, or portal the dropdown.

2. **Touch target sizes**: Some control pickers use compact 2-column grids. Audit all pickers for 44x44px minimum touch targets. Most are fine; `ToggleRow` switch (36x20px currently) may need padding increase inside mobile sheets.

3. **Safe area insets**: MobileMiniBar must use `pb-[env(safe-area-inset-bottom)]` for iPhone home indicator / Android nav bar.

4. **Virtual keyboard**: Text inputs in pickers (hex color, logo URL) will push the sheet up. The existing BottomSheet scroll + max-height should handle this, but needs real-device testing.

5. **Content swap transitions**: When switching between sheets (section A -> section B), the content swap should feel smooth. Use a quick opacity fade (150ms) on the sheet body, not a full close/reopen animation.

## Implementation Phases

### Phase 1: Shell (renders, no interactivity)
1. Create `components/builder/mobile/` directory
2. `mobile-sheet-orchestrator.tsx` -- context + reducer
3. `mobile-top-bar.tsx` -- reads from useBuilder()
4. `mobile-preview-canvas.tsx` -- renders sections with EditableSection
5. `mobile-mini-bar.tsx` -- renders icons
6. `mobile-builder.tsx` -- composes the above
7. Wire into `page.tsx` -- mobile users see new shell with live preview

### Phase 2: Sheet System (full interactivity)
8. `mobile-section-controls.tsx` -- section -> controls mapping
9. `mobile-global-controls.tsx` -- global tab -> controls mapping
10. `mobile-control-sheet.tsx` -- BottomSheet wrapper with dynamic content
11. Wire section taps in PreviewCanvas to orchestrator
12. Wire mini-bar taps to orchestrator

### Phase 3: Polish
13. `use-swipe-dismiss.ts` -- integrate into MobileControlSheet
14. Safe area inset handling on MobileMiniBar
15. Content swap transitions (opacity fade on sheet body)
16. Tier toggle UI in MobileTopBar
17. `index.tsx` barrel export

### Phase 4: Verification
18. All 32 control pickers render correctly in sheets (scroll, overflow, touch targets)
19. Desktop builders completely untouched
20. Test on actual mobile viewport: thumb zones, scroll, sheet heights, keyboard overlap

## Verification Plan

1. **Desktop regression**: Run `npm run build` and manually verify split-screen and inline builders work identically to before. No changes should exist in any file outside `components/builder/mobile/` and `app/dashboard/builder/page.tsx`.

2. **Mobile functional test**: Open `/dashboard/builder` on a 390px viewport (iPhone 14). Verify:
   - TierSelector appears and works (Flash/Custom selection)
   - MobileBuilder renders with live themed preview
   - Tapping each section opens the correct bottom sheet with correct controls
   - Tapping mini-bar icons opens global control sheets
   - Controls update the preview in real-time
   - Undo/redo work from the top bar
   - Save persists to localStorage
   - Swipe down on sheet handle dismisses the sheet

3. **Cross-tier test**: Switch between Flash and Custom tiers. Verify mini-bar icons update, sheet content adjusts, and no controls are missing.

4. **Touch target audit**: Verify all interactive elements inside sheets meet the 44x44px minimum.
