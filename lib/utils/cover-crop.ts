import type { CSSProperties } from "react";
import type { CoverCrop, CoverFocal } from "@/lib/types";
import type { HeroLayout } from "@/lib/types/builder";

/**
 * Pure geometry for the cover framing editor. The editor's state is
 * (aspect, zoom, center) — all normalized against the ORIGINAL image — so the
 * math is independent of how large the editor happens to render on screen.
 * Asserted in scripts/check-builder.ts.
 */

export const MAX_COVER_ZOOM = 4;

export interface AspectPreset {
  id: string;
  label: string;
  /** width/height; null = use the full photo (no crop). */
  value: number | null;
}

export const COVER_ASPECTS: AspectPreset[] = [
  { id: "3:1", label: "Banner", value: 3 },
  { id: "21:9", label: "Wide", value: 21 / 9 },
  { id: "16:9", label: "Cinematic", value: 16 / 9 },
  { id: "4:3", label: "Classic", value: 4 / 3 },
  { id: "full", label: "Full photo", value: null },
];

/** Nominal hero shape per layout — what the crop window suggests by default. */
const HERO_ASPECT: Record<HeroLayout, string> = {
  split: "4:3",
  fullbleed: "21:9",
  centered: "21:9",
  masthead: "3:1",
  "grid-overlay": "16:9",
  zine: "16:9",
};

export function suggestedAspectId(heroLayout?: string): string {
  return HERO_ASPECT[heroLayout as HeroLayout] ?? "16:9";
}

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

/**
 * Largest rect of `aspect` that fits the image, as fractions of the image —
 * the crop at zoom 1. Wider-than-image aspects clamp to full width, taller
 * ones to full height.
 */
export function baseCropSize(
  imgW: number,
  imgH: number,
  aspect: number,
): { w: number; h: number } {
  const rectW = Math.min(imgW, imgH * aspect);
  return { w: rectW / imgW, h: rectW / aspect / imgH };
}

/** Clamp a crop center so the rect stays inside the image. */
export function clampCenter(
  cx: number,
  cy: number,
  size: { w: number; h: number },
): { cx: number; cy: number } {
  return {
    cx: clamp(cx, size.w / 2, 1 - size.w / 2),
    cy: clamp(cy, size.h / 2, 1 - size.h / 2),
  };
}

/** Crop rect from editor state. Always fully inside the image. */
export function cropRect(
  imgW: number,
  imgH: number,
  aspect: number,
  ratioId: string,
  zoom: number,
  cx: number,
  cy: number,
): CoverCrop {
  const z = clamp(zoom, 1, MAX_COVER_ZOOM);
  const base = baseCropSize(imgW, imgH, aspect);
  const size = { w: base.w / z, h: base.h / z };
  const center = clampCenter(cx, cy, size);
  return {
    x: center.cx - size.w / 2,
    y: center.cy - size.h / 2,
    w: size.w,
    h: size.h,
    ratio: ratioId,
  };
}

/** Recover (zoom, center) from a saved rect — restores the editor session. */
export function viewportFromRect(
  imgW: number,
  imgH: number,
  aspect: number,
  rect: CoverCrop,
): { zoom: number; cx: number; cy: number } {
  const base = baseCropSize(imgW, imgH, aspect);
  return {
    zoom: clamp(base.w / rect.w, 1, MAX_COVER_ZOOM),
    cx: rect.x + rect.w / 2,
    cy: rect.y + rect.h / 2,
  };
}

/**
 * CSS to display exactly `rect` of `url` inside a container of the rect's
 * aspect (background-position p% aligns p% of image with p% of container,
 * hence x / (1 - w)).
 */
export function cropRegionStyle(
  url: string,
  rect: Pick<CoverCrop, "x" | "y" | "w" | "h"> | null,
): CSSProperties {
  if (!rect) {
    return { backgroundImage: `url("${url}")`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  const posX = rect.w >= 1 ? 50 : (rect.x / (1 - rect.w)) * 100;
  const posY = rect.h >= 1 ? 50 : (rect.y / (1 - rect.h)) * 100;
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${100 / rect.w}% ${100 / rect.h}%`,
    backgroundPosition: `${posX}% ${posY}%`,
  };
}

/** background-position for a focal point (defaults to center). */
export function focalPosition(focal?: CoverFocal | null): string {
  if (!focal) return "center";
  return `${clamp01(focal.x) * 100}% ${clamp01(focal.y) * 100}%`;
}
