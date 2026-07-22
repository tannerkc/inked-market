"use client";

import { useRef, useState } from "react";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { CoverPhotoEditor } from "@/components/studio-photos";
import { useStudio } from "@/lib/providers/studio-provider";
import { useStudioPhotos } from "@/lib/hooks/use-studio-photos";
import { IMAGE_LIMITS } from "@/lib/utils/image-upload";
import { suggestedAspectId } from "@/lib/utils/cover-crop";
import { cn } from "@/lib/utils";

interface StudioPhotosPanelProps {
  open: boolean;
  onClose: () => void;
}

const sectionLabel =
  "font-mono text-[9px] tracking-[0.2em] uppercase text-ink-black/60 dark:text-ink-cream/60";

export function StudioPhotosPanel({ open, onClose }: StudioPhotosPanelProps) {
  const { studio } = useStudio();
  const photos = useStudioPhotos();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [framingOpen, setFramingOpen] = useState(false);

  // Counter-based drag tracking — child elements fire enter/leave in pairs,
  // so a plain boolean flickers while moving across the grid.
  const dragDepth = useRef(0);
  const [dragActive, setDragActive] = useState(false);

  const { images, coverImage, studioId, atCap, busy, error, notice } = photos;
  const uploading = busy !== null;

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  };
  const handleDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragActive(false);
    void photos.uploadFiles(e.dataTransfer.files, "gallery");
  };

  const controlButton =
    "px-1.5 py-0.5 text-[11px] text-white cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-default";

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Studio Photos">
      <div className="space-y-6">
        {!studioId ? (
          <p className="text-[12px] rounded-xl border border-ink-gold/30 bg-ink-gold/[0.06] px-3 py-2.5 text-ink-black/70 dark:text-ink-cream/70">
            Save your studio info first — photos need a saved studio to attach to.
          </p>
        ) : null}

        {/* Cover photo */}
        <div>
          <p className={cn(sectionLabel, "mb-2")}>Cover Photo</p>
          {coverImage ? (
            <div className="relative overflow-hidden rounded-xl border border-ink-black/[0.08] dark:border-ink-cream/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element -- panel thumbnail of a storage URL */}
              <img src={coverImage} alt="Current cover" className="h-32 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFramingOpen(true)}
                  disabled={uploading}
                  className="rounded-md bg-ink-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink-black/90 disabled:opacity-50"
                >
                  Adjust
                </button>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md bg-ink-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink-black/90 disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => void photos.removeCover()}
                  disabled={uploading}
                  className="rounded-md bg-ink-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:text-ink-red disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={busy === "cover" || !studioId}
              className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed text-[11px] font-medium transition-colors border-ink-black/[0.15] text-ink-black/60 hover:border-ink-rust/50 hover:text-ink-rust dark:border-ink-cream/[0.15] dark:text-ink-cream/60 dark:hover:border-ink-red/50 dark:hover:text-ink-red disabled:opacity-50 disabled:cursor-default"
            >
              {busy === "cover" ? "Uploading…" : "Upload cover photo"}
            </button>
          )}
          <p className="mt-1.5 text-[10px] text-ink-black/60 dark:text-ink-cream/60">
            Shown at the top of your public page
          </p>
        </div>

        {/* Gallery */}
        <div>
          <p className={cn(sectionLabel, "mb-2")}>
            Gallery ({images.length}/{IMAGE_LIMITS.maxGalleryPhotos})
          </p>

          <div
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl transition-shadow",
              dragActive && "ring-2 ring-ink-rust/50 dark:ring-ink-red/50",
            )}
          >
            {images.length === 0 ? (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={busy === "gallery" || !studioId}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-10 transition-colors border-ink-black/[0.15] hover:border-ink-rust/50 dark:border-ink-cream/[0.15] dark:hover:border-ink-red/50 disabled:opacity-50 disabled:cursor-default"
              >
                <span className="text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
                  {busy === "gallery" ? "Uploading…" : "Add your first photos"}
                </span>
                <span className="text-[10px] text-ink-black/60 dark:text-ink-cream/60">
                  Click or drag &amp; drop — JPG/PNG up to 10 MB, we compress them automatically
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-ink-black/[0.08] dark:border-ink-cream/[0.08]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- panel thumbnail of a storage URL */}
                    <img src={url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 flex justify-between bg-ink-black/70 px-1 py-0.5 backdrop-blur-sm transition-opacity",
                        // Hover/keyboard reveal on fine pointers; always visible on touch.
                        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100",
                      )}
                    >
                      <button
                        type="button"
                        aria-label={`Move photo ${i + 1} earlier`}
                        onClick={() => void photos.moveImage(i, -1)}
                        disabled={i === 0 || uploading}
                        className={controlButton}
                      >
                        &larr;
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete photo ${i + 1}`}
                        onClick={() => void photos.removeGalleryImage(url)}
                        disabled={uploading}
                        className={cn(controlButton, "hover:text-ink-red")}
                      >
                        &times;
                      </button>
                      <button
                        type="button"
                        aria-label={`Move photo ${i + 1} later`}
                        onClick={() => void photos.moveImage(i, 1)}
                        disabled={i === images.length - 1 || uploading}
                        className={controlButton}
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
                ))}

                {!atCap ? (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={busy === "gallery" || !studioId}
                    aria-label="Add photos"
                    className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed transition-colors border-ink-black/[0.15] text-ink-black/60 hover:border-ink-rust/50 hover:text-ink-rust dark:border-ink-cream/[0.15] dark:text-ink-cream/60 dark:hover:border-ink-red/50 dark:hover:text-ink-red disabled:opacity-50 disabled:cursor-default"
                  >
                    <span className="text-[18px] leading-none">+</span>
                    <span className="text-[10px] font-medium">
                      {busy === "gallery" ? "Uploading…" : "Add"}
                    </span>
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {atCap ? (
            <p className="mt-2 text-[10px] text-ink-black/60 dark:text-ink-cream/60">
              Gallery is full — remove a photo to add another.
            </p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-[11px] font-medium text-ink-red">{error}</p>
        ) : null}
        {notice ? (
          <p className="text-[11px] font-medium text-ink-gold">{notice}</p>
        ) : null}
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          // Fresh upload → straight into the framing editor.
          void photos.uploadFiles(e.target.files, "cover").then((ok) => {
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
          void photos.uploadFiles(e.target.files, "gallery");
          e.target.value = "";
        }}
      />

      {framingOpen && photos.coverSourceUrl ? (
        <CoverPhotoEditor
          sourceUrl={photos.coverSourceUrl}
          initialCrop={photos.coverCrop}
          initialFocal={photos.coverFocal}
          suggestedAspect={suggestedAspectId(studio?.themeConfig?.heroLayout)}
          saving={busy === "cover"}
          onSave={(crop, focal) => {
            void photos.applyCoverFraming(crop, focal).then((ok) => {
              if (ok) setFramingOpen(false);
            });
          }}
          onClose={() => setFramingOpen(false)}
        />
      ) : null}
    </SlideOverPanel>
  );
}
