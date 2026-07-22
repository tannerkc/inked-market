"use client";

import { PLACEHOLDER_PATTERN, PLACEHOLDER_PATTERN_RAW } from "@/lib/utils/placeholder-pattern";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStudioSite } from "@/components/studio-site/studio-site-context";
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

type GalleryLayoutProps = { items: GalleryTile[]; onPhotoClick?: (i: number) => void };

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
  onClick?: (index: number) => void;
}) {
  const isSkeleton = !src;
  return (
    <button
      type="button"
      data-gallery-item
      data-builder-card
      disabled={!onClick}
      onClick={onClick ? () => onClick(index) : undefined}
      className={cn(
        "group/tile flex w-full items-center justify-center overflow-hidden rounded-lg text-left transition-all",
        src && onClick && "cursor-zoom-in hover:opacity-90",
        isSkeleton && "opacity-50",
        // Skeleton hover: brighten + accent ring + plus glyph = "click to add photos".
        isSkeleton && onClick &&
          "cursor-pointer hover:opacity-100 hover:ring-2 hover:ring-inset hover:ring-[var(--accent)]",
        !onClick && "cursor-default",
        aspect,
        className,
      )}
      style={{
        backgroundColor: "var(--bg-sunken)",
        backgroundImage: src ? `url("${src}")` : PLACEHOLDER_PATTERN,
        backgroundSize: src ? "cover" : undefined,
        backgroundPosition: src ? "center" : undefined,
      }}
    >
      {isSkeleton && onClick ? (
        <span
          aria-hidden="true"
          className="opacity-0 transition-opacity group-hover/tile:opacity-100"
          style={{ color: "var(--accent)" }}
        >
          <svg width="18" height="18" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M5 1v8M1 5h8" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}

function FeaturedGallery({ items, onPhotoClick }: GalleryLayoutProps) {
  return (
    <div className="grid grid-cols-2 gap-3 @md:grid-cols-4">
      {/* First item spans 2x2 */}
      <GalleryItem
        index={0}
        aspect="aspect-square"
        src={items[0]?.src}
        className="col-span-2 row-span-2"
        onClick={onPhotoClick}
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

function UniformGallery({ items, onPhotoClick }: GalleryLayoutProps) {
  return (
    <div className="grid grid-cols-2 gap-3 @md:grid-cols-4">
      {items.slice(0, 8).map((item, i) => (
        <GalleryItem key={item.id} index={i} aspect="aspect-square" src={item.src} onClick={onPhotoClick} />
      ))}
    </div>
  );
}

function MasonryGallery({ items, onPhotoClick }: GalleryLayoutProps) {
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
function FilmStripGallery({ items, onPhotoClick }: GalleryLayoutProps) {
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
function FlashSheetGallery({ items, onPhotoClick }: GalleryLayoutProps) {
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

function CarouselGallery({ items, onPhotoClick }: GalleryLayoutProps) {
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
  const { config, data, onEditContent } = useStudioSite();
  const { galleryLayout, showGalleryHeading } = config;
  const showHeading = showGalleryHeading !== false;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Real images → lightbox on click. Empty → quiet skeleton tiles; in the
  // builder each tile deep-links to the Content panel's photos group, on the
  // public site they're inert (disabled, no onEditContent in context).
  const hasImages = data.images.length > 0;
  const items: GalleryTile[] = hasImages
    ? data.images.map((url, i) => ({
        id: i,
        aspect: GALLERY_ITEMS[i % GALLERY_ITEMS.length]!.aspect,
        src: url,
      }))
    : GALLERY_ITEMS.slice(0, 6);

  const onTileClick = hasImages
    ? setLightboxIndex
    : onEditContent
      ? () => onEditContent("photos")
      : undefined;

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

        {/* Skeleton tiles self-dim (opacity-50 each) so per-tile hover can brighten them. */}
        <div aria-hidden={!hasImages && !onEditContent ? true : undefined}>
          {galleryLayout === "featured" ? <FeaturedGallery items={items} onPhotoClick={onTileClick} /> : null}
          {galleryLayout === "uniform" ? <UniformGallery items={items} onPhotoClick={onTileClick} /> : null}
          {galleryLayout === "masonry" ? <MasonryGallery items={items} onPhotoClick={onTileClick} /> : null}
          {galleryLayout === "carousel" ? <CarouselGallery items={items} onPhotoClick={onTileClick} /> : null}
          {galleryLayout === "film-strip" ? <FilmStripGallery items={items} onPhotoClick={onTileClick} /> : null}
          {galleryLayout === "flash-sheet" ? <FlashSheetGallery items={items} onPhotoClick={onTileClick} /> : null}
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
