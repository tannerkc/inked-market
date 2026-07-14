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
  maxCoverPhotos: 6,                // grid-overlay hero renders at most 6 tiles
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

const REFS_BUCKET = "booking-refs";

/** Reference-image upload for booking requests: {userId}/{uuid}.{ext} in booking-refs. */
export async function uploadBookingReference(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > IMAGE_LIMITS.maxSourceBytes) {
    return { ok: false, error: ERROR_MESSAGES["too-large"]! };
  }
  try {
    const { blob, ext } = await compressImage(file, "gallery");
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(REFS_BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) return { ok: false, error: ERROR_MESSAGES["upload-failed"]! };
    const { data } = supabase.storage.from(REFS_BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    const key = e instanceof Error ? e.message : "upload-failed";
    return { ok: false, error: ERROR_MESSAGES[key] ?? ERROR_MESSAGES["upload-failed"]! };
  }
}

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
 * Re-encode a region of an already-uploaded cover (the pristine original)
 * into a new derived cover asset. Fetches the source (Supabase public storage
 * serves CORS), crops via canvas, caps the result at the cover max edge.
 * `rect` is normalized 0-1 against the source image.
 */
export async function cropStudioCover(
  supabase: SupabaseClient,
  studioId: string,
  sourceUrl: string,
  rect: { x: number; y: number; w: number; h: number },
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  let bitmap: ImageBitmap;
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error("fetch");
    bitmap = await createImageBitmap(await res.blob());
  } catch {
    return { ok: false, error: "Couldn't load the original photo — check your connection and retry." };
  }

  try {
    // Pixel rect, clamped inside the bitmap and at least 1px.
    const sx = Math.min(bitmap.width - 1, Math.max(0, Math.round(rect.x * bitmap.width)));
    const sy = Math.min(bitmap.height - 1, Math.max(0, Math.round(rect.y * bitmap.height)));
    const sw = Math.max(1, Math.min(bitmap.width - sx, Math.round(rect.w * bitmap.width)));
    const sh = Math.max(1, Math.min(bitmap.height - sy, Math.round(rect.h * bitmap.height)));

    const scale = Math.min(1, MAX_EDGE.cover / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("encode-failed");
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const { blob, ext } = await encodeCanvas(canvas);
    const path = `${studioId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) return { ok: false, error: ERROR_MESSAGES["upload-failed"]! };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    const key = e instanceof Error ? e.message : "encode-failed";
    return { ok: false, error: ERROR_MESSAGES[key] ?? ERROR_MESSAGES["encode-failed"]! };
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
