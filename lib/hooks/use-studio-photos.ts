"use client";

import { useState } from "react";
import { useStudio } from "@/lib/providers/studio-provider";
import { createClient } from "@/lib/supabase/client";
import {
  IMAGE_LIMITS,
  cropStudioCover,
  deleteStudioImage,
  uploadStudioImage,
  type UploadKind,
} from "@/lib/utils/image-upload";
import type { CoverCrop, CoverFocal } from "@/lib/types";

/**
 * All studio photo behavior (cover + gallery), shared by the builder's Photos
 * group and the dashboard's Studio Photos panel — one place for the upload
 * loop, cap handling, and the delete-DB-first-then-storage rule.
 *
 * Mutating actions return true when something changed so each surface can
 * show its own success feedback (builder flashes "Saved"; the panel's grid
 * updating is its own feedback). Mutations are rejected while an upload is in
 * flight: the upload's final write merges from the images array it captured
 * at start, so a concurrent delete/reorder would be silently clobbered.
 */
/** What an upload targets: the two DB kinds plus the multi-cover list. */
export type PhotoSlot = UploadKind | "covers";

export function useStudioPhotos() {
  const { studio, update } = useStudio();
  const [busy, setBusy] = useState<PhotoSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const images = studio?.images ?? [];
  const coverImage = studio?.coverImage;
  const coverImages = studio?.coverImages ?? [];
  const studioId = studio?.id;
  const atCap = images.length >= IMAGE_LIMITS.maxGalleryPhotos;
  const atCoverCap = coverImages.length >= IMAGE_LIMITS.maxCoverPhotos;

  // Framing state. Covers uploaded before framing existed have no recorded
  // original — the displayed cover IS the original (lazy backfill on save).
  const coverCrop = studio?.coverCrop ?? null;
  const coverFocal = studio?.coverFocal ?? null;
  const coverSourceUrl = studio?.coverImageOriginal ?? studio?.coverImage;

  const uploadFiles = async (
    files: FileList | File[] | null,
    kind: PhotoSlot,
  ): Promise<boolean> => {
    if (!files || files.length === 0 || busy) return false;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      // Drag-and-drop can hand us anything; pickers are pre-filtered by accept=.
      setNotice("Only image files can be uploaded.");
      return false;
    }
    if (!studioId) {
      setError("Save your studio info before uploading photos.");
      return false;
    }

    setError(null);
    setNotice(null);
    setBusy(kind);
    const supabase = createClient();
    let lowResSeen = false;
    const uploaded: string[] = [];

    for (const file of imageFiles) {
      if (kind === "gallery" && images.length + uploaded.length >= IMAGE_LIMITS.maxGalleryPhotos) {
        setNotice(`Gallery cap is ${IMAGE_LIMITS.maxGalleryPhotos} photos — extra files were skipped.`);
        break;
      }
      if (kind === "covers" && coverImages.length + uploaded.length >= IMAGE_LIMITS.maxCoverPhotos) {
        setNotice(`Cover photo cap is ${IMAGE_LIMITS.maxCoverPhotos} — extra files were skipped.`);
        break;
      }
      // Multi-cover photos are heroes too — compress at the cover edge size.
      const result = await uploadStudioImage(supabase, studioId, file, kind === "covers" ? "cover" : kind);
      if (!result.ok) {
        setError(result.error);
        break;
      }
      lowResSeen = lowResSeen || result.lowRes;
      uploaded.push(result.url);
      if (kind === "cover") break; // single slot
    }

    if (uploaded.length > 0) {
      if (kind === "cover") {
        const previousDisplay = coverImage;
        const previousOriginal = studio?.coverImageOriginal;
        // A new photo is both the original and the (unframed) display cover;
        // old framing is meaningless for it.
        await update({
          coverImage: uploaded[0],
          coverImageOriginal: uploaded[0],
          coverCrop: undefined,
          coverFocal: undefined,
        });
        if (previousDisplay) void deleteStudioImage(supabase, previousDisplay);
        if (previousOriginal && previousOriginal !== previousDisplay) {
          void deleteStudioImage(supabase, previousOriginal);
        }
      } else if (kind === "covers") {
        await update({ coverImages: [...coverImages, ...uploaded] });
      } else {
        await update({ images: [...images, ...uploaded] });
      }
    }
    if (lowResSeen) {
      setNotice("Some photos are under 800px — they may look blurry on large screens.");
    }
    setBusy(null);
    return uploaded.length > 0;
  };

  const removeGalleryImage = async (url: string): Promise<boolean> => {
    if (busy) return false;
    // DB first — a dangling storage object is harmless, a broken image is not.
    await update({ images: images.filter((u) => u !== url) });
    void deleteStudioImage(createClient(), url);
    return true;
  };

  const removeCoverImage = async (url: string): Promise<boolean> => {
    if (busy) return false;
    await update({ coverImages: coverImages.filter((u) => u !== url) });
    void deleteStudioImage(createClient(), url);
    return true;
  };

  const removeCover = async (): Promise<boolean> => {
    if (busy || !coverImage) return false;
    const previousOriginal = studio?.coverImageOriginal;
    await update({
      coverImage: undefined,
      coverImageOriginal: undefined,
      coverCrop: undefined,
      coverFocal: undefined,
    });
    const supabase = createClient();
    void deleteStudioImage(supabase, coverImage);
    if (previousOriginal && previousOriginal !== coverImage) {
      void deleteStudioImage(supabase, previousOriginal);
    }
    return true;
  };

  /**
   * Apply framing: re-encode the crop from the pristine original into a new
   * display cover (or reuse the original directly for "full photo"), persist
   * crop + focal for re-editing, then drop the superseded derived asset.
   */
  const applyCoverFraming = async (
    crop: CoverCrop | null,
    focal: CoverFocal,
  ): Promise<boolean> => {
    if (busy) return false;
    const source = coverSourceUrl;
    if (!studioId || !source) return false;
    setError(null);
    setNotice(null);
    setBusy("cover");
    const supabase = createClient();

    let displayUrl = source;
    if (crop) {
      const result = await cropStudioCover(supabase, studioId, source, crop);
      if (!result.ok) {
        setError(result.error);
        setBusy(null);
        return false;
      }
      displayUrl = result.url;
    }

    const previousDisplay = coverImage;
    await update({
      coverImage: displayUrl,
      coverImageOriginal: source,
      coverCrop: crop ?? undefined,
      coverFocal: focal,
    });
    // The old derived cover is superseded — but never delete the original.
    if (previousDisplay && previousDisplay !== source && previousDisplay !== displayUrl) {
      void deleteStudioImage(supabase, previousDisplay);
    }
    setBusy(null);
    return true;
  };

  const swapAt = (list: string[], index: number, delta: -1 | 1): string[] | null => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return null;
    const next = [...list];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    return next;
  };

  const moveImage = async (index: number, delta: -1 | 1): Promise<boolean> => {
    const next = busy ? null : swapAt(images, index, delta);
    if (!next) return false;
    await update({ images: next });
    return true;
  };

  const moveCoverImage = async (index: number, delta: -1 | 1): Promise<boolean> => {
    const next = busy ? null : swapAt(coverImages, index, delta);
    if (!next) return false;
    await update({ coverImages: next });
    return true;
  };

  return {
    images,
    coverImage,
    coverImages,
    coverCrop,
    coverFocal,
    coverSourceUrl,
    studioId,
    atCap,
    atCoverCap,
    busy,
    error,
    notice,
    uploadFiles,
    removeGalleryImage,
    removeCover,
    removeCoverImage,
    moveImage,
    moveCoverImage,
    applyCoverFraming,
  };
}
