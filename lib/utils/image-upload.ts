import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Free-tier-safe client image pipeline: decode (EXIF-orientation aware) →
 * canvas re-encode (strips EXIF/GPS by construction) → WebP with JPEG
 * fallback → Supabase Storage at studio-images/{studioId}/{uuid}.{ext}.
 * No server-side transforms (paid tier) are ever requested.
 */

export const IMAGE_LIMITS = {
  maxSourceBytes: 10 * 1024 * 1024, // 10 MB source cap
  maxGalleryPhotos: 30,             // soft cap keeps page weight + free tier sane
  minEdgeWarn: 800,                 // below this we warn "may look blurry"
} as const;

export type UploadKind = "gallery" | "cover";

const MAX_EDGE: Record<UploadKind, number> = { gallery: 1600, cover: 2400 };
const BUCKET = "studio-images";
const MARKER = `/storage/v1/object/public/${BUCKET}/`;

/** Bucket-relative path from a public URL; null when not a studio-images URL. */
export function storagePathFromPublicUrl(url: string): string | null {
  const idx = url.indexOf(MARKER);
  if (idx === -1) return null;
  const path = url.slice(idx + MARKER.length);
  return path.length > 0 ? decodeURIComponent(path) : null;
}

async function encodeCanvas(canvas: HTMLCanvasElement): Promise<{ blob: Blob; ext: string }> {
  const tryType = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await tryType("image/webp", 0.8);
  // Older Safari cannot encode WebP from canvas — fall back to JPEG.
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpeg = await tryType("image/jpeg", 0.82);
  if (jpeg) return { blob: jpeg, ext: "jpg" };
  throw new Error("encode-failed");
}

export async function compressImage(
  file: File,
  kind: UploadKind,
): Promise<{ blob: Blob; ext: string; width: number; height: number; lowRes: boolean }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("unsupported-format");
  }
  const maxEdge = MAX_EDGE[kind];
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("encode-failed");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const { blob, ext } = await encodeCanvas(canvas);
  const lowRes = Math.max(width, height) < IMAGE_LIMITS.minEdgeWarn;
  return { blob, ext, width, height, lowRes };
}

const ERROR_MESSAGES: Record<string, string> = {
  "too-large": "That photo is over 10 MB — pick a smaller one.",
  "unsupported-format": "That format isn't supported — export as JPG or PNG and try again.",
  "encode-failed": "Couldn't process that photo — try a different one.",
  "upload-failed": "Upload failed — check your connection and retry.",
};

export async function uploadStudioImage(
  supabase: SupabaseClient,
  studioId: string,
  file: File,
  kind: UploadKind,
): Promise<{ ok: true; url: string; lowRes: boolean } | { ok: false; error: string }> {
  if (file.size > IMAGE_LIMITS.maxSourceBytes) {
    return { ok: false, error: ERROR_MESSAGES["too-large"]! };
  }
  try {
    const { blob, ext, lowRes } = await compressImage(file, kind);
    const path = `${studioId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) return { ok: false, error: ERROR_MESSAGES["upload-failed"]! };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, lowRes };
  } catch (e) {
    const key = e instanceof Error ? e.message : "upload-failed";
    return { ok: false, error: ERROR_MESSAGES[key] ?? ERROR_MESSAGES["upload-failed"]! };
  }
}

/**
 * Best-effort storage removal. Callers MUST persist the array/field change
 * FIRST (a dangling object is harmless; a broken image on a live site is not).
 */
export async function deleteStudioImage(supabase: SupabaseClient, url: string): Promise<boolean> {
  const path = storagePathFromPublicUrl(url);
  if (!path) return false;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}
