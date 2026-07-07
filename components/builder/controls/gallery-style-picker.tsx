"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { galleryOptions, galleryPhotosOptions } from "@/lib/data/builder-options";
import type { GalleryLayout, GalleryPhotosPerArtist } from "@/lib/types/builder";
import { ThumbnailPicker } from "./thumbnail-picker";

// ─── Gallery Layout (mixed gallery preview) ───────────────────────────────────

function GalleryThumbnail({ layout }: { layout: GalleryLayout }) {
  switch (layout) {
    case "featured":
      return (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1 rounded-md bg-chrome-raised p-2">
          <div className="col-span-2 row-span-2 rounded bg-chrome-muted" />
          <div className="rounded bg-chrome-border-hover" />
          <div className="rounded bg-chrome-border-hover" />
        </div>
      );
    case "uniform":
      return (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1 rounded-md bg-chrome-raised p-2">
          <div className="rounded bg-chrome-muted" />
          <div className="rounded bg-chrome-muted" />
          <div className="rounded bg-chrome-muted" />
          <div className="rounded bg-chrome-muted" />
          <div className="rounded bg-chrome-muted" />
          <div className="rounded bg-chrome-muted" />
        </div>
      );
    case "masonry":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-chrome-raised p-2">
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-[60%] rounded bg-chrome-muted" />
            <div className="h-[40%] rounded bg-chrome-border-hover" />
          </div>
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-[40%] rounded bg-chrome-border-hover" />
            <div className="h-[60%] rounded bg-chrome-muted" />
          </div>
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-[50%] rounded bg-chrome-muted" />
            <div className="h-[50%] rounded bg-chrome-border-hover" />
          </div>
        </div>
      );
    case "carousel":
      return (
        <div className="flex h-full w-full items-center gap-1 overflow-hidden rounded-md bg-chrome-raised p-2">
          <div className="h-full w-[50%] shrink-0 rounded bg-chrome-muted" />
          <div className="h-full w-[32%] shrink-0 rounded bg-chrome-border-hover" />
          <div className="h-full w-[22%] shrink-0 rounded bg-chrome-subtle" />
        </div>
      );
    case "film-strip":
      return (
        <div className="flex h-full w-full flex-col gap-0.5 rounded-md bg-chrome-raised p-2">
          <div className="h-1 w-full rounded-sm [background-image:repeating-linear-gradient(90deg,var(--chrome-subtle)_0_4px,transparent_4px_9px)]" />
          <div className="flex flex-1 gap-1 overflow-hidden">
            <div className="h-full w-1/3 shrink-0 rounded-sm bg-chrome-muted" />
            <div className="h-full w-1/3 shrink-0 rounded-sm bg-chrome-muted" />
            <div className="h-full w-1/3 shrink-0 rounded-sm bg-chrome-border-hover" />
          </div>
          <div className="h-1 w-full rounded-sm [background-image:repeating-linear-gradient(90deg,var(--chrome-subtle)_0_4px,transparent_4px_9px)]" />
        </div>
      );
    case "flash-sheet":
      return (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 rounded-md bg-chrome-raised p-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-none border border-chrome-subtle bg-chrome-muted p-0.5" />
          ))}
        </div>
      );
  }
}

export function GalleryStylePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <ThumbnailPicker<GalleryLayout>
      title="Gallery Layout"
      options={galleryOptions}
      selectedValue={config.galleryLayout}
      onSelect={(value) => applyChange({ galleryLayout: value })}
      renderThumbnail={(value) => <GalleryThumbnail layout={value} />}
    />
  );
}

GalleryStylePicker.displayName = "GalleryStylePicker";

// ─── Gallery Photos Per Artist (artist strips) ────────────────────────────────

function GalleryPhotosThumbnail({ count }: { count: GalleryPhotosPerArtist }) {
  const photos = Array.from({ length: count });
  return (
    <div className="flex h-full w-full items-stretch gap-1 rounded-md bg-chrome-raised p-2">
      {photos.map((_, i) => (
        <div key={i} className="flex-1 rounded bg-chrome-muted" style={{ aspectRatio: "3/4" }} />
      ))}
      <div
        className="flex-1 rounded border border-dashed border-chrome-subtle flex items-center justify-center"
        style={{ aspectRatio: "3/4" }}
      >
        <span className="text-[8px] font-bold text-chrome-text-dim">+N</span>
      </div>
    </div>
  );
}

export function GalleryPhotosPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <ThumbnailPicker<GalleryPhotosPerArtist>
      title="Photos per Artist"
      columns={3}
      options={galleryPhotosOptions}
      selectedValue={config.galleryPhotosPerArtist}
      onSelect={(value) => applyChange({ galleryPhotosPerArtist: value })}
      renderThumbnail={(value) => <GalleryPhotosThumbnail count={value} />}
    />
  );
}

GalleryPhotosPicker.displayName = "GalleryPhotosPicker";
