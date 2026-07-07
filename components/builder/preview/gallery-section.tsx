"use client";

import { PLACEHOLDER_PATTERN, PLACEHOLDER_PATTERN_RAW } from "@/lib/utils/placeholder-pattern";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStudioSite } from "@/components/studio-site/studio-site-context";
import { SectionEmptyState } from "@/components/studio-site/empty-states";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";



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

type GalleryTile = { id: number; aspect: string; src?: string };

function GalleryItem({
  index,
  aspect,
  src,
  className,
  onClick,
}: {
  index: number;
  aspect: string;
  src?: string;
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
        "block w-full overflow-hidden rounded-lg cursor-zoom-in text-left transition-opacity hover:opacity-90",
        aspect,
        className,
      )}
      style={{
        backgroundColor: "var(--bg-sunken)",
        backgroundImage: src ? `url("${src}")` : PLACEHOLDER_PATTERN,
        backgroundSize: src ? "cover" : undefined,
        backgroundPosition: src ? "center" : undefined,
      }}
    />
  );
}

function FeaturedGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
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
          backgroundImage: items[0]?.src ? `url("${items[0].src}")` : PLACEHOLDER_PATTERN,
          backgroundSize: items[0]?.src ? "cover" : undefined,
          backgroundPosition: items[0]?.src ? "center" : undefined,
        }}
      />
      {items.slice(1, 7).map((item, i) => (
        <GalleryItem key={item.id} index={i + 1} aspect="aspect-square" src={item.src} onClick={onPhotoClick} />
      ))}
      {items.slice(7, 9).map((item, i) => (
        <GalleryItem key={item.id} index={i + 7} aspect="aspect-square" src={item.src} className="hidden @md:block" onClick={onPhotoClick} />
      ))}
    </div>
  );
}

function UniformGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 @md:grid-cols-4">
      {items.slice(0, 8).map((item, i) => (
        <GalleryItem key={item.id} index={i} aspect="aspect-square" src={item.src} onClick={onPhotoClick} />
      ))}
    </div>
  );
}

function MasonryGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  return (
    <div className="columns-2 gap-3 @md:columns-4">
      {items.map((item, i) => (
        <div key={item.id} className="mb-3 break-inside-avoid">
          <GalleryItem index={i} aspect={item.aspect} src={item.src} onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}

/** Dark Cinematic signature: horizontal strip framed by film sprocket holes. */
function FilmStripGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  const sprockets: React.CSSProperties = {
    backgroundImage: "repeating-linear-gradient(90deg, var(--border) 0 10px, transparent 10px 26px)",
  };
  return (
    <div className="overflow-hidden rounded-[var(--border-radius-lg)]" style={{ backgroundColor: "var(--bg-deep)" }}>
      <div className="h-4 w-full opacity-60" style={sprockets} aria-hidden="true" />
      <div className="flex gap-2 overflow-x-auto px-2 py-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((item, i) => (
          <div key={item.id} className="w-44 shrink-0 snap-start @sm:w-56 @md:w-64">
            <GalleryItem index={i} aspect="aspect-[3/4]" src={item.src} className="rounded-sm" onClick={onPhotoClick} />
          </div>
        ))}
      </div>
      <div className="h-4 w-full opacity-60" style={sprockets} aria-hidden="true" />
    </div>
  );
}

/** Traditional Flash signature: flash-sheet grid — bordered tiles with corner ornaments. */
function FlashSheetGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  const cornerBase = "pointer-events-none absolute h-2.5 w-2.5";
  return (
    <div className="grid grid-cols-2 gap-4 @md:grid-cols-3">
      {items.slice(0, 9).map((item, i) => (
        <div
          key={item.id}
          className="relative border-2 p-1.5"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 55%, var(--border))",
            backgroundColor: "var(--bg-raised)",
          }}
        >
          <span aria-hidden="true" className={cn(cornerBase, "left-0.5 top-0.5 border-l-2 border-t-2")} style={{ borderColor: "var(--accent)" }} />
          <span aria-hidden="true" className={cn(cornerBase, "right-0.5 top-0.5 border-r-2 border-t-2")} style={{ borderColor: "var(--accent)" }} />
          <span aria-hidden="true" className={cn(cornerBase, "bottom-0.5 left-0.5 border-b-2 border-l-2")} style={{ borderColor: "var(--accent)" }} />
          <span aria-hidden="true" className={cn(cornerBase, "bottom-0.5 right-0.5 border-b-2 border-r-2")} style={{ borderColor: "var(--accent)" }} />
          <GalleryItem index={i} aspect="aspect-square" src={item.src} className="rounded-none" onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}

function CarouselGallery({ items, onPhotoClick }: { items: GalleryTile[]; onPhotoClick: (i: number) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="w-40 shrink-0 snap-start @sm:w-56 @md:w-64"
        >
          <GalleryItem index={i} aspect="aspect-[3/4]" src={item.src} className="rounded-xl" onClick={onPhotoClick} />
        </div>
      ))}
    </div>
  );
}

export function GallerySection({ className }: { className?: string }) {
  const { config, data } = useStudioSite();
  const { galleryLayout, showGalleryHeading } = config;
  const showHeading = showGalleryHeading !== false;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Real images → render those. Empty → designed empty state: a quiet tile
  // silhouette (never mistakable for content) under a "coming soon" overlay.
  const hasImages = data.images.length > 0;
  const items: GalleryTile[] = hasImages
    ? data.images.map((url, i) => ({
        id: i,
        aspect: GALLERY_ITEMS[i % GALLERY_ITEMS.length]!.aspect,
        src: url,
      }))
    : GALLERY_ITEMS.slice(0, 6);

  const lightboxPhotos = hasImages
    ? items.map((item) => ({ id: item.id, src: item.src }))
    : [];

  return (
    <section
      className={cn(
        "w-full transition-all duration-500 ease-in-out",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-[1350px] px-6 py-12 @lg:px-10">
        {showHeading ? <p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            Portfolio
          </p> : null}

        <div className="relative">
          <div className={cn(!hasImages && "opacity-40")} aria-hidden={!hasImages}>
            {galleryLayout === "featured" ? <FeaturedGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} /> : null}
            {galleryLayout === "uniform" ? <UniformGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} /> : null}
            {galleryLayout === "masonry" ? <MasonryGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} /> : null}
            {galleryLayout === "carousel" ? <CarouselGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} /> : null}
            {galleryLayout === "film-strip" ? <FilmStripGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} /> : null}
            {galleryLayout === "flash-sheet" ? <FlashSheetGallery items={items} onPhotoClick={hasImages ? setLightboxIndex : () => {}} /> : null}
          </div>
          {!hasImages ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-[var(--border-radius-lg)] px-4 py-2"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
                  backdropFilter: "blur(2px)",
                }}
              >
                <SectionEmptyState
                  message="Portfolio coming soon."
                  prompt={{ group: "photos", label: "Add photos" }}
                  className="py-4"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <PhotoLightbox
        photos={lightboxPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        placeholderPattern={PLACEHOLDER_PATTERN_RAW}
      />
    </section>
  );
}
