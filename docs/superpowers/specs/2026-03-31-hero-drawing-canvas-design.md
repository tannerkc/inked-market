# Hero Drawing Canvas — Design Spec

## Context

The Inked Market landing page hero section currently features a warm cream gradient background with 11 parallax-floating tattoo SVGs, a display heading, subtitle, CTAs, and stats bar. This feature adds an interactive drawing canvas where visitors can doodle with an ink pen cursor — a "wow" moment that reinforces the tattoo brand identity. Drawings are ephemeral (cleared on refresh), not functional.

## Feature Summary

When a desktop user hovers over the hero section, their cursor becomes a pen nib tip. Click-and-drag draws ink strokes onto the hero background. Strokes have speed-sensitive width variation (fast = thin, slow = thick) and a subtle ink bleed effect that settles after each stroke. A floating color palette offers 3 real tattoo ink colors. Mobile devices get the standard hero experience with no drawing.

## Design Decisions

| Decision | Choice |
|---|---|
| Purpose | Delight & brand identity |
| Cursor | Pen nib tip SVG (~16px), split nib, red ink dot |
| Activation | Always-on pen cursor on hero hover, click+drag to draw |
| Stroke feel | Fine-line base + speed-sensitive width (fast=thin, slow=thick) |
| Ink colors | Floating palette: black (#0A0A0A), red (#FF3333), royal blue (#2B5EA7) |
| Ink bleed | Subtle edge diffusion (~1s): stroke thickens slightly, edges soften, core stays sharp |
| Permanence | Strokes persist until page refresh |
| Layer relationship | Drawing canvas and parallax SVGs coexist on same visual layer |
| Mobile | Disabled entirely — no canvas, no custom cursor |
| Technical approach | Dual Canvas + Web Worker bleed (Approach C) |

## Architecture

### Z-Index Stack (hero section)

```
z-0:   Gradient background (from-[#FAF3E8] via-[#F5F0EB] to-[#F0E8DE])
z-10:  Parallax tattoo SVG decorations (existing, unchanged)
z-18:  Settled canvas (bleed-processed strokes, updated from worker)
z-20:  Active canvas (current stroke being drawn, no bleed)
z-30:  Center content div (heading, subtitle, CTAs, stats)
z-40:  Ink cursor div (pointer-events-none) + Color palette (pointer-events-auto)
```

### Component Tree

```
app/page.tsx
  <section> (hero)
    {parallax decorations}     ← existing, unchanged
    <DrawingCanvas />          ← new component
    <div z-30> (text/CTAs)     ← existing, z-index bumped
```

### File Structure

```
components/
  hero/
    drawing-canvas.tsx         — main "use client" orchestrator component
    drawing-worker.ts          — Web Worker: OffscreenCanvas bleed processing
    ink-cursor.tsx             — JS-tracked custom cursor div
    color-palette.tsx          — glassmorphism 3-swatch floating pill
lib/
  drawing/
    stroke-engine.ts           — velocity calc, width smoothing, point buffering
    bleed-kernel.ts            — dilate + blur pixel operations (runs in worker)
public/
  cursors/
    pen-nib.svg                — custom cursor SVG asset
```

## Component Specifications

### DrawingCanvas (`components/hero/drawing-canvas.tsx`)

The main orchestrator. `"use client"` component that:

- Renders two `<canvas>` elements (settled z-18, active z-20)
- Renders `<InkCursor />` and `<ColorPalette />`
- Manages pointer event handlers (pointerdown, pointermove, pointerup)
- Spawns the Web Worker on mount
- Transfers completed strokes to the worker for bleed processing
- Composites worker output onto the settled canvas
- Gates entire feature on `window.matchMedia('(pointer: fine)')` — renders `null` on coarse-pointer (mobile/tablet)
- Handles canvas resize via `ResizeObserver` on the hero section
- Scales canvases for `devicePixelRatio` (capped at 2x)

**Props:** None (self-contained). Mounted inside hero section in `page.tsx`.

### InkCursor (`components/hero/ink-cursor.tsx`)

A lightweight `<div>` containing the pen nib SVG, positioned via `transform: translate3d(x, y, 0)`.

- CSS `cursor: none` on the hero section hides the native cursor
- Updated on every `pointermove` via ref (no React re-renders)
- `will-change: transform` for GPU compositing
- `pointer-events: none` so it doesn't intercept clicks
- The red ink dot at the nib tip changes color to match the currently selected swatch
- Hidden when cursor enters the text/CTA content area (toggled via pointer enter/leave events on the content div)

### ColorPalette (`components/hero/color-palette.tsx`)

Floating glassmorphism pill with 3 circular swatches.

- Colors: black (#0A0A0A), red (#FF3333), royal blue (#2B5EA7)
- Positioned bottom-right of the hero section
- Glass style: `bg-white/90 backdrop-blur border border-[#0A0A0A]/[0.06] rounded-full`
- Active swatch gets a 2px ring indicator
- `pointer-events: auto` (must be clickable)
- Defaults to black on load

### StrokeEngine (`lib/drawing/stroke-engine.ts`)

Pure utility — no React dependencies. Handles:

- **Point buffering:** Stores last ~10 points with timestamps in a ring buffer
- **Velocity calculation:** `distance(currentPoint, lastPoint) / deltaTime`
- **Width mapping:** `width = clamp(MIN_WIDTH, BASE_WIDTH / (1 + velocity * SENSITIVITY), MAX_WIDTH)` where MIN_WIDTH=1.2, BASE_WIDTH=3.5, MAX_WIDTH=5
- **Width smoothing:** Exponential moving average: `smoothedWidth = smoothedWidth * 0.7 + targetWidth * 0.3`
- **Stroke history:** Maintains an array of all completed strokes (points + widths + color) for resize redraws
- **Exports:** `createStrokeEngine()` factory returning `{ addPoint, getWidth, reset, getPoints, getHistory, clearHistory }`

### BleedKernel (`lib/drawing/bleed-kernel.ts`)

Pixel manipulation utilities that run inside the Web Worker:

- **Morphological dilation:** Expand stroke edges by ~0.3px equivalent
- **Gaussian blur:** Soften edges at ~0.4 stdDeviation equivalent
- **Composite:** Merge bleed result over the crisp original (core stays sharp)
- Operates on `ImageData` arrays
- Must be efficient — processes only the bounding box of the new stroke, not the entire canvas

### DrawingWorker (`components/hero/drawing-worker.ts`)

Web Worker that:

1. Receives completed stroke data (points + widths + color) via `postMessage`
2. Draws the stroke onto its internal `OffscreenCanvas`
3. Applies `BleedKernel` operations to the stroke's bounding box
4. Transfers the processed result back to the main thread as an `ImageBitmap`
5. Uses `new Worker(new URL('./drawing-worker.ts', import.meta.url))` pattern (Next.js/webpack native)

**Fallback:** If `OffscreenCanvas` is unavailable, the main component falls back to CSS SVG filter bleed on the settled canvas:

```html
<svg width="0" height="0">
  <filter id="inkBleed">
    <feMorphology operator="dilate" radius="0.3" />
    <feGaussianBlur stdDeviation="0.4" />
    <feComposite in="SourceGraphic" operator="over" />
  </filter>
</svg>
```

### Pen Nib SVG (`public/cursors/pen-nib.svg`)

Custom cursor asset. ~14x16px viewBox. Split nib shape tapering to a point with a colored ink dot at the tip. The dot color is dynamic (controlled by JS cursor component), so the SVG file uses the default black/red variant; the JS cursor swaps the dot fill based on selected color.

## Drawing Flow

```
1. User hovers hero section
   → CSS cursor: none activates
   → InkCursor div appears, tracks mouse position

2. User clicks (pointerdown)
   → StrokeEngine.reset()
   → Begin recording points on active canvas
   → Draw segments with per-point lineWidth from StrokeEngine

3. User drags (pointermove)
   → StrokeEngine.addPoint(x, y, timestamp)
   → Calculate velocity → map to width → smooth
   → ctx.lineWidth = smoothedWidth
   → ctx.beginPath() → moveTo(prev) → lineTo(current) → stroke()
   → lineCap: 'round', lineJoin: 'round'

4. User releases (pointerup)
   → Collect all stroke points + widths + color from StrokeEngine
   → postMessage to worker with stroke data
   → Clear active canvas

5. Worker processes stroke
   → Draw stroke onto OffscreenCanvas
   → Apply BleedKernel (dilate + blur on bounding box)
   → transferToImageBitmap() → postMessage back

6. Main thread receives processed bitmap
   → ctx.drawImage(bitmap, 0, 0) onto settled canvas
```

## Performance Strategy

- **Main thread only handles:** pointer events (draw segments), scroll events (parallax), worker output compositing
- **Worker handles:** all bleed computation (pixel manipulation) — the heaviest operation
- **Canvas DPR:** Both canvases scale for `devicePixelRatio`, capped at 2x to avoid 4x pixel counts on retina
- **Memory:** Two canvases at 2x DPR for ~1440x900 hero ≈ 40MB texture memory. Acceptable.
- **No requestAnimationFrame for drawing:** `pointermove` fires at display refresh rate. Draw directly in the handler.
- **Batch old strokes:** After ~50 strokes, worker can merge old processed strokes into a single static bitmap layer to bound memory
- **Mobile gate:** `window.matchMedia('(pointer: fine)')` — entire feature skipped on coarse-pointer devices. Component renders `null`.

## Integration with Existing Hero

### Changes to `app/page.tsx`

1. Import and mount `<DrawingCanvas />` inside the hero `<section>`, between the parallax decorations and the center content div
2. Bump the center content div's z-index to z-30 (currently relative z-10)
3. Add `overflow-hidden` to the hero section if not already present (clip canvas to hero bounds)
4. No changes to parallax decoration logic

### Changes to `app/globals.css`

- Add fallback SVG filter definition (hidden, 0x0) for non-worker browsers
- No other CSS changes needed — all styling is Tailwind/inline

## Verification Plan

1. **Desktop Chrome/Firefox/Safari:** Hover hero → pen cursor appears. Click-drag → strokes draw with variable width. Release → subtle bleed settles. Color palette switches ink color. Buttons/text remain clickable with normal cursor.
2. **Mobile Safari/Chrome:** No canvas, no custom cursor, standard hero experience. Parallax still works.
3. **Performance:** Run Lighthouse on the page with ~20 drawn strokes. Target: Performance 90+, no layout shift from canvas mount.
4. **Worker fallback:** Disable OffscreenCanvas in DevTools → verify CSS filter fallback still produces visible bleed.
5. **Resize:** Resize browser window → canvas resizes, stroke data redraws at new dimensions. Doodles persist.
6. **Scroll:** Draw strokes, then scroll down → parallax still smooth at 60fps, no jank from canvas compositing.

## Resolved Decisions

1. **Tattoo blue hex:** Royal blue #2B5EA7 — vivid, distinct from black on cream.
2. **Canvas on resize:** Store stroke data and redraw at new dimensions. Preserves user's doodles.
3. **Palette position:** Bottom-right of hero. Less intrusive, feels like a tool palette.
