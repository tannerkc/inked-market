"use client";

import { useBuilder } from "@/components/builder/builder-provider";
import { galleryOptions, galleryPhotosOptions } from "@/lib/data/builder-options";
import type { GalleryLayout, GalleryPhotosPerArtist } from "@/lib/types/builder";
import { cn } from "@/lib/utils";

// ─── Gallery Layout (mixed gallery preview) ───────────────────────────────────

function GalleryThumbnail({ layout }: { layout: GalleryLayout }) {
  switch (layout) {
    case "featured":
      return (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="col-span-2 row-span-2 rounded bg-[#2a2a2a]" />
          <div className="rounded bg-[#333]" />
          <div className="rounded bg-[#333]" />
        </div>
      );
    case "uniform":
      return (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="rounded bg-[#2a2a2a]" />
          <div className="rounded bg-[#2a2a2a]" />
          <div className="rounded bg-[#2a2a2a]" />
          <div className="rounded bg-[#2a2a2a]" />
          <div className="rounded bg-[#2a2a2a]" />
          <div className="rounded bg-[#2a2a2a]" />
        </div>
      );
    case "masonry":
      return (
        <div className="flex h-full w-full gap-1 rounded-md bg-[#1a1a1a] p-2">
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-[60%] rounded bg-[#2a2a2a]" />
            <div className="h-[40%] rounded bg-[#333]" />
          </div>
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-[40%] rounded bg-[#333]" />
            <div className="h-[60%] rounded bg-[#2a2a2a]" />
          </div>
          <div className="flex w-1/3 flex-col gap-1">
            <div className="h-[50%] rounded bg-[#2a2a2a]" />
            <div className="h-[50%] rounded bg-[#333]" />
          </div>
        </div>
      );
    case "carousel":
      return (
        <div className="flex h-full w-full items-center gap-1 overflow-hidden rounded-md bg-[#1a1a1a] p-2">
          <div className="h-full w-[50%] shrink-0 rounded bg-[#2a2a2a]" />
          <div className="h-full w-[32%] shrink-0 rounded bg-[#333]" />
          <div className="h-full w-[22%] shrink-0 rounded bg-[#3a3a3a]" />
        </div>
      );
  }
}

export function GalleryStylePicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Gallery Layout
      </div>
      <div className="grid grid-cols-2 gap-2">
        {galleryOptions.map((opt) => {
          const selected = config.galleryLayout === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ galleryLayout: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-[#FF3333] bg-[#111] ring-1 ring-[#FF3333]/30"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                <GalleryThumbnail layout={opt.value} />
              </div>

              <div className="px-2 pb-2.5 pt-0.5">
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    selected ? "text-[#FF3333]" : "text-[#888] group-hover:text-[#bbb]"
                  )}
                >
                  {opt.label}
                </span>
              </div>

              {selected && (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3333]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

GalleryStylePicker.displayName = "GalleryStylePicker";

// ─── Gallery Photos Per Artist (artist strips) ────────────────────────────────

function GalleryPhotosThumbnail({ count }: { count: GalleryPhotosPerArtist }) {
  const photos = Array.from({ length: count });
  return (
    <div className="flex h-full w-full items-stretch gap-1 rounded-md bg-[#1a1a1a] p-2">
      {photos.map((_, i) => (
        <div key={i} className="flex-1 rounded bg-[#2a2a2a]" style={{ aspectRatio: "3/4" }} />
      ))}
      <div
        className="flex-1 rounded border border-dashed border-[#3a3a3a] flex items-center justify-center"
        style={{ aspectRatio: "3/4" }}
      >
        <span className="text-[8px] font-bold text-[#555]">+N</span>
      </div>
    </div>
  );
}

export function GalleryPhotosPicker() {
  const { config, applyChange } = useBuilder();

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Photos per Artist
      </div>
      <div className="grid grid-cols-3 gap-2">
        {galleryPhotosOptions.map((opt) => {
          const selected = config.galleryPhotosPerArtist === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyChange({ galleryPhotosPerArtist: opt.value })}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border transition-all",
                selected
                  ? "border-[#FF3333] bg-[#111] ring-1 ring-[#FF3333]/30"
                  : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
              )}
            >
              <div className="aspect-[4/3] w-full p-1.5">
                <GalleryPhotosThumbnail count={opt.value} />
              </div>
              <div className="px-2 pb-2.5 pt-0.5">
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    selected ? "text-[#FF3333]" : "text-[#888] group-hover:text-[#bbb]"
                  )}
                >
                  {opt.label}
                </span>
              </div>
              {selected && (
                <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3333]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

GalleryPhotosPicker.displayName = "GalleryPhotosPicker";
