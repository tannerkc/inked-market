"use client";

import { useRef, useState } from "react";
import { CoverPhotoEditor } from "@/components/studio-photos";
import { useBuilder } from "@/components/builder/builder-provider";
import { useStudioPhotos } from "@/lib/hooks/use-studio-photos";
import { IMAGE_LIMITS } from "@/lib/utils/image-upload";
import { suggestedAspectId } from "@/lib/utils/cover-crop";
import { supportsMultiCover } from "@/lib/utils/studio-content";
import { GroupSection } from "./group-section";
import { useSavedFlash } from "./fields";
import { cn } from "@/lib/utils";

/** Thumb grid with reorder/delete — shared by the gallery and multi-cover lists. */
function PhotoThumbGrid({
  photos,
  label,
  onMove,
  onRemove,
}: {
  photos: string[];
  label: string;
  onMove: (index: number, delta: -1 | 1) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {photos.map((url, i) => (
        <div
          key={url}
          className="group relative aspect-square overflow-hidden rounded-md border border-chrome-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- chrome thumbnail of a storage URL */}
          <img src={url} alt={`${label} ${i + 1}`} className="h-full w-full object-cover" />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex justify-between bg-ink-black/70 px-1 py-0.5 backdrop-blur-sm",
              "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            <button
              type="button"
              aria-label={`Move ${label.toLowerCase()} ${i + 1} earlier`}
              onClick={() => onMove(i, -1)}
              disabled={i === 0}
              className="px-1 text-[11px] text-white disabled:opacity-30"
            >
              &larr;
            </button>
            <button
              type="button"
              aria-label={`Delete ${label.toLowerCase()} ${i + 1}`}
              onClick={() => onRemove(url)}
              className="px-1 text-[11px] text-white transition-colors hover:text-ink-red"
            >
              &times;
            </button>
            <button
              type="button"
              aria-label={`Move ${label.toLowerCase()} ${i + 1} later`}
              onClick={() => onMove(i, 1)}
              disabled={i === photos.length - 1}
              className="px-1 text-[11px] text-white disabled:opacity-30"
            >
              &rarr;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PhotosGroup({ highlighted }: { highlighted?: boolean }) {
  const photos = useStudioPhotos();
  const { config, applyChange } = useBuilder();
  const { saved, flash } = useSavedFlash();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coversInputRef = useRef<HTMLInputElement>(null);
  const [framingOpen, setFramingOpen] = useState(false);

  const { images, coverImage, coverImages, atCap, atCoverCap, busy, error, notice } = photos;

  // Multi-cover only exists on collage heroes (Studio Minimal grid, Gutter Punk zine).
  const multiCapable = supportsMultiCover(config.heroLayout);
  const coverMode = config.heroCoverMode === "multi" ? "multi" : "single";
  const multi = multiCapable && coverMode === "multi";

  const flashIf = (changed: boolean) => {
    if (changed) flash();
  };

  return (
    <GroupSection id="photos" title="Photos" saved={saved} highlighted={highlighted}>
      {/* Cover image */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
            {multi
              ? `Cover Photos (${coverImages.length}/${IMAGE_LIMITS.maxCoverPhotos})`
              : "Cover Photo"}
          </span>
          {multiCapable ? (
            <div className="flex gap-1">
              {(["single", "multi"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => applyChange({ heroCoverMode: mode })}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    coverMode === mode
                      ? "border-chrome-text-faint bg-chrome-border text-white"
                      : "border-chrome-border-hover bg-transparent text-chrome-text-secondary hover:text-white",
                  )}
                >
                  {mode === "single" ? "Single" : "Multi"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {multi ? (
          <div className="space-y-1.5">
            {coverImages.length > 0 ? (
              <PhotoThumbGrid
                photos={coverImages}
                label="Cover photo"
                onMove={(i, d) => void photos.moveCoverImage(i, d).then(flashIf)}
                onRemove={(url) => void photos.removeCoverImage(url).then(flashIf)}
              />
            ) : null}
            <button
              type="button"
              onClick={() => coversInputRef.current?.click()}
              disabled={busy === "covers" || atCoverCap}
              className={cn(
                "flex w-full items-center justify-center rounded-lg border-2 border-dashed border-chrome-border-hover",
                "text-[11px] font-semibold text-chrome-text-dim transition-colors hover:border-chrome-text-faint disabled:opacity-50",
                coverImages.length === 0 ? "h-20" : "h-9",
              )}
            >
              {busy === "covers"
                ? "Uploading…"
                : atCoverCap
                  ? "Cover photo cap reached"
                  : coverImages.length === 0
                    ? "Upload cover photos"
                    : "Add cover photos"}
            </button>
          </div>
        ) : coverImage ? (
          <div className="relative overflow-hidden rounded-lg border border-chrome-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- chrome thumbnail of a storage URL */}
            <img src={coverImage} alt="Cover" className="h-28 w-full object-cover" />
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => setFramingOpen(true)}
                className="rounded bg-ink-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink-black/90"
              >
                Adjust
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="rounded bg-ink-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink-black/90"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => void photos.removeCover().then(flashIf)}
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
          <PhotoThumbGrid
            photos={images}
            label="Gallery photo"
            onMove={(i, d) => void photos.moveImage(i, d).then(flashIf)}
            onRemove={(url) => void photos.removeGalleryImage(url).then(flashIf)}
          />
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
          // Fresh upload → straight into the framing editor.
          void photos.uploadFiles(e.target.files, "cover").then((ok) => {
            flashIf(ok);
            if (ok) setFramingOpen(true);
          });
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
          void photos.uploadFiles(e.target.files, "gallery").then(flashIf);
          e.target.value = "";
        }}
      />
      <input
        ref={coversInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void photos.uploadFiles(e.target.files, "covers").then(flashIf);
          e.target.value = "";
        }}
      />

      {framingOpen && photos.coverSourceUrl ? (
        <CoverPhotoEditor
          sourceUrl={photos.coverSourceUrl}
          initialCrop={photos.coverCrop}
          initialFocal={photos.coverFocal}
          suggestedAspect={suggestedAspectId(config.heroLayout)}
          saving={busy === "cover"}
          onSave={(crop, focal) => {
            void photos.applyCoverFraming(crop, focal).then((ok) => {
              flashIf(ok);
              if (ok) setFramingOpen(false);
            });
          }}
          onClose={() => setFramingOpen(false)}
        />
      ) : null}
    </GroupSection>
  );
}
