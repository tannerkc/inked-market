"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  COVER_ASPECTS,
  MAX_COVER_ZOOM,
  clamp01,
  clampCenter,
  baseCropSize,
  cropRect,
  cropRegionStyle,
  viewportFromRect,
} from "@/lib/utils/cover-crop";
import type { CoverCrop, CoverFocal } from "@/lib/types";

interface CoverPhotoEditorProps {
  /** The pristine original photo (framing is always re-derived from it). */
  sourceUrl: string;
  initialCrop?: CoverCrop | null;
  initialFocal?: CoverFocal | null;
  /** Aspect preset id matching the studio's current hero layout. */
  suggestedAspect: string;
  saving?: boolean;
  onSave: (crop: CoverCrop | null, focal: CoverFocal) => void;
  onClose: () => void;
}

const NUDGE = 0.02;
const STAGE_MAX_H = 320;

/**
 * Instagram-style cover framing: a fixed crop window at the chosen aspect —
 * drag to pan, pinch/wheel/slider to zoom — plus a draggable focal pin on the
 * result. Mount it only when open; state initializes fresh per session.
 */
export function CoverPhotoEditor({
  sourceUrl,
  initialCrop = null,
  initialFocal = null,
  suggestedAspect,
  saving = false,
  onSave,
  onClose,
}: CoverPhotoEditorProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const stageWrapRef = React.useRef<HTMLDivElement>(null);

  // ── Source image dimensions ────────────────────────────────────────────────
  const [img, setImg] = React.useState<{ w: number; h: number } | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);

  React.useEffect(() => {
    const el = new window.Image();
    el.onload = () => setImg({ w: el.naturalWidth, h: el.naturalHeight });
    el.onerror = () => setLoadFailed(true);
    el.src = sourceUrl;
    return () => {
      el.onload = null;
      el.onerror = null;
    };
  }, [sourceUrl]);

  // ── Editor state (normalized — independent of on-screen size) ─────────────
  const [aspectId, setAspectId] = React.useState<string>(() => {
    const saved = initialCrop?.ratio;
    return saved && COVER_ASPECTS.some((a) => a.id === saved) ? saved : suggestedAspect;
  });
  const [zoom, setZoom] = React.useState(1);
  const [center, setCenter] = React.useState({ cx: 0.5, cy: 0.5 });
  const [focal, setFocal] = React.useState<CoverFocal>(
    initialFocal ? { x: clamp01(initialFocal.x), y: clamp01(initialFocal.y) } : { x: 0.5, y: 0.5 },
  );

  const preset = COVER_ASPECTS.find((a) => a.id === aspectId) ?? COVER_ASPECTS[0]!;
  const aspect = preset.value;

  // Restore the saved viewport once the image dims arrive (same ratio only).
  const restoredRef = React.useRef(false);
  React.useEffect(() => {
    if (!img || restoredRef.current) return;
    restoredRef.current = true;
    if (initialCrop && initialCrop.ratio === aspectId && aspect) {
      const vp = viewportFromRect(img.w, img.h, aspect, initialCrop);
      setZoom(vp.zoom);
      setCenter(clampCenter(vp.cx, vp.cy, baseCropSize(img.w, img.h, aspect)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot restore on image load
  }, [img]);

  // ── Stage sizing ───────────────────────────────────────────────────────────
  const [stageAvailW, setStageAvailW] = React.useState(0);
  React.useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setStageAvailW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // Keyed on img: the stage wrapper only mounts after the image loads, so a
    // mount-time ([]) run would find no element and never attach the observer.
  }, [img]);

  const stageAspect = aspect ?? (img ? img.w / img.h : 16 / 9);
  const winW = Math.min(stageAvailW, STAGE_MAX_H * stageAspect);
  const winH = winW / stageAspect;

  const rect: CoverCrop | null =
    img && aspect ? cropRect(img.w, img.h, aspect, aspectId, zoom, center.cx, center.cy) : null;

  // ── Dialog behavior: Esc, scroll lock, initial focus ───────────────────────
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // ── Pan / pinch (pointer events, rAF-batched) ──────────────────────────────
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const gesture = React.useRef<{ startCenter: { cx: number; cy: number }; startPoint: { x: number; y: number }; startZoom: number; startDist: number } | null>(null);
  const rafId = React.useRef(0);
  const pending = React.useRef<(() => void) | null>(null);

  const schedule = (fn: () => void) => {
    pending.current = fn;
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      pending.current?.();
      pending.current = null;
    });
  };
  React.useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const pinchDist = () => {
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
  };

  const beginGesture = (e: React.PointerEvent) => {
    gesture.current = {
      startCenter: center,
      startPoint: { x: e.clientX, y: e.clientY },
      startZoom: zoom,
      startDist: pinchDist(),
    };
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rect) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    beginGesture(e);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !img || !aspect || !rect || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;

    if (pointers.current.size >= 2) {
      // Pinch — zoom about the window center.
      const dist = pinchDist();
      if (g.startDist > 0 && dist > 0) {
        const next = Math.min(MAX_COVER_ZOOM, Math.max(1, g.startZoom * (dist / g.startDist)));
        schedule(() => setZoom(next));
      }
      return;
    }

    // Pan — window px → normalized image fraction via the current crop size.
    const size = { w: rect.w, h: rect.h };
    const dx = e.clientX - g.startPoint.x;
    const dy = e.clientY - g.startPoint.y;
    const next = clampCenter(
      g.startCenter.cx - (dx * size.w) / Math.max(1, winW),
      g.startCenter.cy - (dy * size.h) / Math.max(1, winH),
      size,
    );
    schedule(() => setCenter(next));
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!aspect) return;
    setZoom((z) => Math.min(MAX_COVER_ZOOM, Math.max(1, z * Math.exp(-e.deltaY * 0.002))));
  };

  // ── Focal pin ──────────────────────────────────────────────────────────────
  const focalRef = React.useRef<HTMLDivElement>(null);
  const focalDragging = React.useRef(false);

  const setFocalFromEvent = (clientX: number, clientY: number) => {
    const el = focalRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    setFocal({
      x: clamp01((clientX - box.left) / box.width),
      y: clamp01((clientY - box.top) / box.height),
    });
  };

  const handleFocalKey = (e: React.KeyboardEvent) => {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    setFocal((f) => ({ x: clamp01(f.x + step[0]), y: clamp01(f.y + step[1]) }));
  };

  const handleReset = () => {
    setAspectId(suggestedAspect);
    setZoom(1);
    setCenter({ cx: 0.5, cy: 0.5 });
    setFocal({ x: 0.5, y: 0.5 });
  };

  const label = "font-mono text-[9px] tracking-[0.2em] uppercase text-ink-black/60 dark:text-ink-cream/60";
  const ready = img !== null && !loadFailed;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Adjust cover photo framing"
        tabIndex={-1}
        className="w-full max-w-[620px] max-h-[90dvh] overflow-y-auto rounded-2xl border p-5 outline-none bg-white border-ink-black/[0.08] dark:bg-ink-black-raised dark:border-ink-cream/[0.08]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink-black dark:text-ink-cream">
            Adjust Cover Photo
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close framing editor"
            className="p-1 cursor-pointer transition-colors text-ink-black/45 hover:text-ink-black/70 dark:text-ink-cream/45 dark:hover:text-ink-cream/70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loadFailed ? (
          <div className="py-10 text-center">
            <p role="alert" className="text-[12px] font-medium text-ink-red">
              Couldn&apos;t load the photo — check your connection and try again.
            </p>
          </div>
        ) : !img ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-[12px] text-ink-black/60 dark:text-ink-cream/60">Loading photo…</p>
          </div>
        ) : (
          <>
            {/* Aspect presets */}
            <p className={cn(label, "mb-2")}>Crop Shape</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {COVER_ASPECTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAspectId(a.id)}
                  aria-pressed={aspectId === a.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium cursor-pointer transition-colors",
                    aspectId === a.id
                      ? "border-ink-rust/50 bg-ink-rust/[0.08] text-ink-rust dark:border-ink-red/50 dark:bg-ink-red/[0.1] dark:text-ink-red"
                      : "border-ink-black/[0.14] text-ink-black/70 hover:border-ink-rust/40 dark:border-ink-cream/[0.16] dark:text-ink-cream/70 dark:hover:border-ink-red/40",
                  )}
                >
                  {a.label}
                  {a.value ? <span className="opacity-60">{a.id}</span> : null}
                  {a.id === suggestedAspect ? (
                    <span className="rounded-full border border-ink-sage/40 bg-ink-sage/[0.12] px-1.5 text-[8px] font-mono uppercase tracking-[0.1em] text-ink-black/70 dark:text-ink-cream/70">
                      Suggested
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Crop stage */}
            <div ref={stageWrapRef} className="mb-1.5 flex justify-center rounded-xl bg-ink-black/90 p-3">
              {aspect && rect ? (
                <div
                  onPointerDown={handleStagePointerDown}
                  onPointerMove={handleStagePointerMove}
                  onPointerUp={handleStagePointerUp}
                  onPointerCancel={handleStagePointerUp}
                  onWheel={handleWheel}
                  style={{ width: winW, height: winH, ...cropRegionStyle(sourceUrl, rect) }}
                  className="relative cursor-grab touch-none select-none overflow-hidden rounded-md active:cursor-grabbing"
                  aria-label="Drag to reposition the crop"
                >
                  {/* Rule-of-thirds grid */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
                    <div className="absolute top-1/3 left-0 w-full h-px bg-white/25" />
                    <div className="absolute top-2/3 left-0 w-full h-px bg-white/25" />
                  </div>
                </div>
              ) : (
                <div
                  style={{ width: winW, height: winH, ...cropRegionStyle(sourceUrl, null) }}
                  className="rounded-md"
                  aria-label="Full photo — no crop applied"
                />
              )}
            </div>
            <p className="mb-3 text-center text-[10px] text-ink-black/60 dark:text-ink-cream/60">
              {aspect ? "Drag to reposition · pinch or scroll to zoom" : "Using the full photo — set the focal point below"}
            </p>

            {/* Zoom */}
            {aspect ? (
              <div className="mb-4 flex items-center gap-3">
                <span className={label}>Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={MAX_COVER_ZOOM}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  aria-label="Zoom"
                  className="flex-1 accent-ink-rust dark:accent-ink-red"
                />
              </div>
            ) : null}

            {/* Focal point */}
            <p className={cn(label, "mb-1")}>Focal Point</p>
            <p className="mb-2 text-[10px] text-ink-black/60 dark:text-ink-cream/60">
              Heroes resize with the screen — this spot stays in frame when edges get trimmed.
            </p>
            <div className="mb-4 flex justify-center">
              <div
                ref={focalRef}
                role="slider"
                tabIndex={0}
                aria-label="Focal point — use arrow keys to adjust"
                aria-valuenow={Math.round(focal.x * 100)}
                aria-valuetext={`${Math.round(focal.x * 100)}% across, ${Math.round(focal.y * 100)}% down`}
                onKeyDown={handleFocalKey}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  focalDragging.current = true;
                  setFocalFromEvent(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => {
                  if (focalDragging.current) setFocalFromEvent(e.clientX, e.clientY);
                }}
                onPointerUp={() => {
                  focalDragging.current = false;
                }}
                style={{
                  width: Math.min(stageAvailW, 200 * stageAspect),
                  aspectRatio: String(stageAspect),
                  ...cropRegionStyle(sourceUrl, rect),
                }}
                className="relative cursor-crosshair touch-none select-none overflow-hidden rounded-lg border border-ink-black/[0.1] outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink-rust dark:border-ink-cream/[0.1] dark:focus-visible:outline-ink-red"
              >
                <div
                  aria-hidden="true"
                  style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
                  className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.55)]"
                >
                  <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="font-mono text-[9px] tracking-[0.15em] uppercase cursor-pointer transition-colors text-ink-black/60 hover:text-ink-black dark:text-ink-cream/60 dark:hover:text-ink-cream"
              >
                Reset
              </button>
              <div className="flex gap-2">
                <Button variant="ink-outline" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  variant="ink"
                  size="sm"
                  onClick={() => onSave(aspect ? rect : null, focal)}
                  disabled={saving || !ready}
                >
                  {saving ? "Saving…" : "Save Framing"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
