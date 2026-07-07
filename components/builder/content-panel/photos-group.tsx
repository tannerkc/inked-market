"use client";

import { useRef, useState } from "react";
import { useStudio } from "@/lib/providers/studio-provider";
import { createClient } from "@/lib/supabase/client";
import {
  uploadStudioImage,
  deleteStudioImage,
  IMAGE_LIMITS,
  type UploadKind,
} from "@/lib/utils/image-upload";
import { GroupSection } from "./group-section";
import { useSavedFlash } from "./fields";
import { cn } from "@/lib/utils";

export function PhotosGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"cover" | "gallery" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const images = studio?.images ?? [];
  const studioId = studio?.id;
  const atCap = images.length >= IMAGE_LIMITS.maxGalleryPhotos;

  const runUpload = async (files: FileList | null, kind: UploadKind) => {
    if (!files || files.length === 0) return;
    if (!studioId) {
      setError("Save your studio once from the dashboard before uploading photos.");
      return;
    }
    setError(null);
    setNotice(null);
    setBusy(kind === "cover" ? "cover" : "gallery");
    const supabase = createClient();
    let lowResSeen = false;
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      if (kind === "gallery" && images.length + uploaded.length >= IMAGE_LIMITS.maxGalleryPhotos) {
        setNotice(`Gallery cap is ${IMAGE_LIMITS.maxGalleryPhotos} photos — extra files were skipped.`);
        break;
      }
      const result = await uploadStudioImage(supabase, studioId, file, kind);
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
        const previous = studio?.coverImage;
        await update({ coverImage: uploaded[0] });
        if (previous) void deleteStudioImage(supabase, previous);
      } else {
        await update({ images: [...images, ...uploaded] });
      }
      flash();
    }
    if (lowResSeen) {
      setNotice("Some photos are under 800px — they may look blurry on large screens.");
    }
    setBusy(null);
  };

  const removeGalleryImage = async (url: string) => {
    // DB first — a dangling storage object is harmless, a broken image is not.
    await update({ images: images.filter((u) => u !== url) });
    flash();
    void deleteStudioImage(createClient(), url);
  };

  const removeCover = async () => {
    const previous = studio?.coverImage;
    await update({ coverImage: undefined });
    flash();
    if (previous) void deleteStudioImage(createClient(), previous);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    void update({ images: next }).then(flash);
  };

  return (
    <GroupSection id="photos" title="Photos" saved={saved} highlighted={highlighted}>
      {/* Cover image */}
      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Cover Photo
        </span>
        {studio?.coverImage ? (
          <div className="relative overflow-hidden rounded-lg border border-chrome-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- chrome thumbnail of a storage URL */}
            <img src={studio.coverImage} alt="Cover" className="h-28 w-full object-cover" />
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="rounded bg-ink-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink-black/90"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={removeCover}
                className="rounded bg-ink-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:text-ink-red"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={busy === "cover"}
            className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-chrome-border-hover text-[11px] font-semibold text-chrome-text-dim transition-colors hover:border-chrome-text-faint disabled:opacity-50"
          >
            {busy === "cover" ? "Uploading…" : "Upload cover photo"}
          </button>
        )}
      </div>

      {/* Gallery */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
            Gallery ({images.length}/{IMAGE_LIMITS.maxGalleryPhotos})
          </span>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={busy === "gallery" || atCap}
            className="rounded-md border border-chrome-border-hover px-2 py-1 text-[10px] font-semibold text-chrome-text-secondary transition-colors hover:text-white disabled:opacity-40"
          >
            {busy === "gallery" ? "Uploading…" : "Add photos"}
          </button>
        </div>

        {images.length === 0 ? (
          <p className="text-[10px] text-chrome-text-faint">
            No photos yet. JPG/PNG up to 10 MB &mdash; we compress them automatically.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((url, i) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-md border border-chrome-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- chrome thumbnail of a storage URL */}
                <img src={url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 flex justify-between bg-ink-black/70 px-1 py-0.5 backdrop-blur-sm",
                    "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} earlier`}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="px-1 text-[11px] text-white disabled:opacity-30"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete photo ${i + 1}`}
                    onClick={() => removeGalleryImage(url)}
                    className="px-1 text-[11px] text-white transition-colors hover:text-ink-red"
                  >
                    &times;
                  </button>
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} later`}
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="px-1 text-[11px] text-white disabled:opacity-30"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? <p role="alert" className="text-[10px] font-medium text-ink-red">{error}</p> : null}
      {notice ? <p className="text-[10px] font-medium text-ink-gold">{notice}</p> : null}

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void runUpload(e.target.files, "cover");
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void runUpload(e.target.files, "gallery");
          e.target.value = "";
        }}
      />
    </GroupSection>
  );
}
