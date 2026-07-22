/**
 * Stateless Web Worker for ink bleed processing.
 * Receives a single stroke, applies bleed, returns the processed region bitmap.
 * No internal accumulation — the main thread handles compositing.
 */

import { applyInkBleed } from "../../lib/drawing/bleed-kernel";
import type { StrokePoint } from "../../lib/drawing/stroke-engine";

interface StrokeMessage {
  type: "stroke";
  id: number;
  points: StrokePoint[];
  color: string;
  bounds: { x: number; y: number; width: number; height: number };
  dpr: number;
}

function drawStroke(
  targetCtx: OffscreenCanvasRenderingContext2D,
  points: StrokePoint[],
  color: string
) {
  if (points.length < 2) return;

  targetCtx.strokeStyle = color;
  targetCtx.lineCap = "round";
  targetCtx.lineJoin = "round";

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    targetCtx.lineWidth = curr.width;
    targetCtx.beginPath();
    targetCtx.moveTo(prev.x, prev.y);
    targetCtx.lineTo(curr.x, curr.y);
    targetCtx.stroke();
  }
}

self.onmessage = async (e: MessageEvent<StrokeMessage>) => {
  const msg = e.data;
  if (msg.type !== "stroke") return;

  const { bounds, dpr, points, color, id } = msg;
  const padding = 10;

  const regionW = Math.ceil((bounds.width + padding * 2) * dpr);
  const regionH = Math.ceil((bounds.height + padding * 2) * dpr);
  const offsetX = bounds.x - padding;
  const offsetY = bounds.y - padding;

  if (regionW <= 0 || regionH <= 0) return;

  // Draw the stroke onto a region-sized canvas
  const tempCanvas = new OffscreenCanvas(regionW, regionH);
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.scale(dpr, dpr);
  tempCtx.translate(-offsetX, -offsetY);
  drawStroke(tempCtx, points, color);

  // Apply ink bleed to that region
  const imageData = tempCtx.getImageData(0, 0, regionW, regionH);
  const processed = applyInkBleed(imageData);
  tempCtx.putImageData(processed, 0, 0);

  // Return the processed region bitmap + its position
  const bitmap = await createImageBitmap(tempCanvas);
  self.postMessage(
    {
      type: "stroke-processed",
      id,
      bitmap,
      x: offsetX * dpr,
      y: offsetY * dpr,
    },
    { transfer: [bitmap] }
  );
};
