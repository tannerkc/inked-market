"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";

const SVG_PATTERN = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath fill-rule='evenodd' d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`;

const SVG_PATTERN_RAW = `data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath fill-rule='evenodd' d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E`;

const GALLERY_ITEMS = [
  { id: 1, aspect: "aspect-square" },
  { id: 2, aspect: "aspect-[3/4]" },
  { id: 3, aspect: "aspect-square" },
  { id: 4, aspect: "aspect-[4/5]" },
  { id: 5, aspect: "aspect-[3/4]" },
  { id: 6, aspect: "aspect-square" },
  { id: 7, aspect: "aspect-[3/4]" },
  { id: 8, aspect: "aspect-square" },
  { id: 9, aspect: "aspect-[3/4]" },
];

const LIGHTBOX_PHOTOS = GALLERY_ITEMS.map((item) => ({ id: item.id }));

function GalleryItem({
  index,
  aspect,
  className,
  onClick,
}: {
  index: number;
  aspect: string;
  className?: string;
  onClick: (index: number) => void;
}) {
  return (
    <button
      type="button"
      data-gallery-item
      data-builder-card
      onClick={() => onClick(index)}
      className={cn(
        "overflow-hidden rounded-lg cursor-zoom-in text-left transition-opacity hover:opacity-90",
        aspect,
        className,
      )}
      style={{
        backgroundColor: "var(--bg-sunken)",
        backgroundImage: SVG_PATTERN,
      }}
    />
  );
}

function FeaturedGallery({ onPhotoClick }: { onPhotoClick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 @md:grid-cols-4">
      {/* First item spans 2x2 */}
      <button
        type="button"
        data-gallery-item
        data-builder-card
        onClick={() => onPhotoClick(0)}
        className="col-span-2 row-span-2 overflow-hidden rounded-lg aspect-square cursor-zoom-in transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--bg-sunken)",
          backgroundImage: SVG_PATTERN,
        }}
      />
      {GALLERY_ITEMS.slice(1, 7).map((item, i) => (
        <GalleryItem key={item.id} index={i + 1} aspect="aspect-square" onClick={onPhotoClick} />
      ))}
      {GALLERY_ITEMS.slice(7, 9).map((item, i) => (
        <GalleryItem key={item.id} index={i + 7} aspect="aspect-square" className="hidden @md:block" onClick={onPhotoClick} />
      ))}
    </div>
  );
}

function UniformGallery({ onPhotoClick }: { onPhotoClick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 @md:grid-cols-4">
      {GALLERY_ITEMS.slice(0, 8).map((item, i) => (
        <GalleryItem key={item.id} index={i} aspect="aspect-square" onClick={onPhotoClick} />
      ))}
    </div>
  );
}

function MasonryGallery({ onPhotoClick }: { onPhotoClick: (i: number) => void }) {
  return (
    <div className="columns-2 gap-3 @md:columns-4">
      {GALLERY_ITEMS.map((item, i) => (
        <div key={item.id} className="mb-3 break-inside-avoid">
          <GalleryItem index={i} aspect={item.aspect} onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}

function CarouselGallery({ onPhotoClick }: { onPhotoClick: (i: number) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none">
      {GALLERY_ITEMS.map((item, i) => (
        <div
          key={item.id}
          className="w-40 shrink-0 snap-start @sm:w-56 @md:w-64"
        >
          <GalleryItem index={i} aspect="aspect-[3/4]" className="rounded-xl" onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}

export function GallerySection({ className }: { className?: string }) {
  const { config } = useBuilder();
  const { galleryLayout, showGalleryHeading } = config;
  const showHeading = showGalleryHeading !== false;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section
      className={cn(
        "w-full transition-all duration-500 ease-in-out",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-[1350px] px-6 py-12 @lg:px-10">
        {showHeading && (
          <p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            Portfolio
          </p>
        )}

        {galleryLayout === "featured" && <FeaturedGallery onPhotoClick={setLightboxIndex} />}
        {galleryLayout === "uniform" && <UniformGallery onPhotoClick={setLightboxIndex} />}
        {galleryLayout === "masonry" && <MasonryGallery onPhotoClick={setLightboxIndex} />}
        {galleryLayout === "carousel" && <CarouselGallery onPhotoClick={setLightboxIndex} />}
      </div>

      <PhotoLightbox
        photos={LIGHTBOX_PHOTOS}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        placeholderPattern={SVG_PATTERN_RAW}
      />
    </section>
  );
}
