"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createStrokeEngine } from "@/lib/drawing/stroke-engine";
import type { StrokePoint } from "@/lib/drawing/stroke-engine";
import { InkCursor } from "./ink-cursor";
import { ColorPalette } from "./color-palette";
import type { InkColor } from "./color-palette";

function getStrokeBounds(points: StrokePoint[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const p of points) {
    const half = p.width / 2;
    minX = Math.min(minX, p.x - half);
    minY = Math.min(minY, p.y - half);
    maxX = Math.max(maxX, p.x + half);
    maxY = Math.max(maxY, p.y + half);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function drawStrokeToCtx(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[],
  color: string
) {
  if (points.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 1; i < points.length; i++) {
    ctx.lineWidth = points[i].width;
    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
}

const BLEED_DURATION_MS = 800;

interface BleedAnimation {
  id: number;
  bitmap: ImageBitmap;
  x: number;
  y: number;
  startTime: number;
}

export function DrawingCanvas() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [color, setColor] = useState<InkColor>("#0A0A0A");

  const heroRef = useRef<HTMLElement | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  const settledCanvasRef = useRef<HTMLCanvasElement>(null);
  const bleedCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const engineRef = useRef(createStrokeEngine());
  const dprRef = useRef(1);
  const isDrawingRef = useRef(false);
  const colorRef = useRef(color);
  const strokeIdRef = useRef(0);
  const bleedAnimationsRef = useRef<BleedAnimation[]>([]);
  const rafRef = useRef<number>(0);

  // Keep colorRef in sync
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  // Detect desktop (fine pointer)
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Bleed animation loop
  const runBleedAnimations = useCallback(() => {
    const animations = bleedAnimationsRef.current;
    if (animations.length === 0) {
      rafRef.current = 0;
      return;
    }

    const bleedCanvas = bleedCanvasRef.current;
    if (!bleedCanvas) return;
    const ctx = bleedCanvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, bleedCanvas.width, bleedCanvas.height);

    const stillRunning: BleedAnimation[] = [];

    for (const anim of animations) {
      const elapsed = now - anim.startTime;
      const progress = Math.min(1, elapsed / BLEED_DURATION_MS);
      // Ease-out curve for natural ink soak feel
      const alpha = progress * progress * (3 - 2 * progress); // smoothstep

      ctx.globalAlpha = alpha;
      ctx.drawImage(anim.bitmap, anim.x, anim.y);

      if (progress < 1) {
        stillRunning.push(anim);
      } else {
        // Animation done — bake into settled canvas
        const settled = settledCanvasRef.current;
        if (settled) {
          const sCtx = settled.getContext("2d");
          if (sCtx) {
            sCtx.save();
            sCtx.setTransform(1, 0, 0, 1, 0, 0);
            sCtx.drawImage(anim.bitmap, anim.x, anim.y);
            sCtx.restore();
          }
        }
        anim.bitmap.close();
      }
    }

    ctx.restore();
    bleedAnimationsRef.current = stillRunning;

    if (stillRunning.length > 0) {
      rafRef.current = requestAnimationFrame(runBleedAnimations);
    } else {
      // Final clear of bleed canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, bleedCanvas.width, bleedCanvas.height);
      ctx.restore();
      rafRef.current = 0;
    }
  }, []);

  // Set up worker
  useEffect(() => {
    if (!isDesktop) return;

    const hero = document.querySelector("section");
    if (!hero) return;
    heroRef.current = hero;

    dprRef.current = Math.min(window.devicePixelRatio || 1, 2);

    try {
      if (typeof OffscreenCanvas !== "undefined") {
        const worker = new Worker(
          new URL("./drawing-worker.ts", import.meta.url)
        );

        worker.onmessage = (e) => {
          const { type, bitmap, x, y } = e.data;
          if (type === "stroke-processed" && bitmap) {
            // Start bleed animation
            bleedAnimationsRef.current.push({
              id: e.data.id,
              bitmap,
              x,
              y,
              startTime: performance.now(),
            });

            if (!rafRef.current) {
              rafRef.current = requestAnimationFrame(runBleedAnimations);
            }
          }
        };

        workerRef.current = worker;
      }
    } catch {
      // No worker — strokes will just be crisp (no bleed)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [isDesktop, runBleedAnimations]);

  // Resize canvases
  useEffect(() => {
    if (!isDesktop) return;

    const hero = heroRef.current;
    if (!hero) return;

    const resizeCanvases = () => {
      const rect = hero.getBoundingClientRect();
      const dpr = dprRef.current;
      const w = rect.width;
      const h = rect.height;

      [activeCanvasRef, settledCanvasRef, bleedCanvasRef].forEach((ref) => {
        const canvas = ref.current;
        if (!canvas) return;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
      });

      // Redraw stroke history on resize (crisp — bleed not needed for resize)
      const history = engineRef.current.getHistory();
      if (history.length > 0) {
        const settled = settledCanvasRef.current;
        if (settled) {
          const ctx = settled.getContext("2d");
          if (ctx) {
            for (const stroke of history) {
              drawStrokeToCtx(ctx, stroke.points, stroke.color);
            }
          }
        }
      }
    };

    const observer = new ResizeObserver(resizeCanvases);
    observer.observe(hero);
    resizeCanvases();

    return () => observer.disconnect();
  }, [isDesktop]);

  // Pointer handlers — use refs to avoid re-creating callbacks
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }

    if (!isDrawingRef.current) return;

    const hero = heroRef.current;
    const activeCanvas = activeCanvasRef.current;
    if (!hero || !activeCanvas) return;

    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = engineRef.current.addPoint(x, y, e.timeStamp);
    const points = engineRef.current.getPoints();

    if (points.length >= 2) {
      const ctx = activeCanvas.getContext("2d");
      if (ctx) {
        const prev = points[points.length - 2];
        ctx.strokeStyle = colorRef.current;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = point.width;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;

    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    engineRef.current.reset();
    engineRef.current.addPoint(x, y, e.timeStamp);
    isDrawingRef.current = true;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const points = engineRef.current.getPoints();
    if (points.length < 2) {
      engineRef.current.reset();
      return;
    }

    const currentColor = colorRef.current;
    const bounds = getStrokeBounds(points);

    // 1. Immediately draw crisp stroke onto settled canvas (accumulates)
    const settled = settledCanvasRef.current;
    if (settled) {
      const ctx = settled.getContext("2d");
      if (ctx) {
        drawStrokeToCtx(ctx, points, currentColor);
      }
    }

    // 2. Clear the active canvas
    const activeCanvas = activeCanvasRef.current;
    if (activeCanvas) {
      const ctx = activeCanvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
        ctx.restore();
      }
    }

    // 3. Send to worker for bleed processing (will animate on top)
    if (workerRef.current) {
      const id = ++strokeIdRef.current;
      workerRef.current.postMessage({
        type: "stroke",
        id,
        points,
        color: currentColor,
        bounds,
        dpr: dprRef.current,
      });
    }

    // 4. Commit to history for resize redraws
    engineRef.current.commitStroke(currentColor);
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      {/* Settled canvas — accumulates all completed strokes (crisp base) */}
      <canvas
        ref={settledCanvasRef}
        className="absolute inset-0 z-[18] pointer-events-none"
      />

      {/* Bleed canvas — animating bleed effects fade in on top of settled */}
      <canvas
        ref={bleedCanvasRef}
        className="absolute inset-0 z-[19] pointer-events-none"
      />

      {/* Active canvas — current stroke being drawn */}
      <canvas
        ref={activeCanvasRef}
        className="absolute inset-0 z-[20]"
        style={{ cursor: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setCursorVisible(false);
          if (isDrawingRef.current) handlePointerUp();
        }}
        onPointerEnter={() => setCursorVisible(true)}
      />

      {/* Custom cursor */}
      <InkCursor ref={cursorRef} color={color} visible={cursorVisible} />

      {/* Color palette */}
      <ColorPalette
        color={color}
        onColorChange={setColor}
        className="absolute bottom-6 right-6 z-[40]"
      />
    </>
  );
}

DrawingCanvas.displayName = "DrawingCanvas";
