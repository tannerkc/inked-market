"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";

const SVG_PATTERN = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath fill-rule='evenodd' d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`;

const GALLERY_ITEMS = [
  { id: 1, aspect: "aspect-square" },
  { id: 2, aspect: "aspect-[3/4]" },
  { id: 3, aspect: "aspect-square" },
  { id: 4, aspect: "aspect-[4/5]" },
  { id: 5, aspect: "aspect-[3/4]" },
  { id: 6, aspect: "aspect-square" },
  { id: 7, aspect: "aspect-[4/3]" },
  { id: 8, aspect: "aspect-square" },
];

function GalleryItem({
  aspect,
  className,
}: {
  aspect: string;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg", aspect, className)}
      style={{
        backgroundColor: "var(--bg-sunken)",
        backgroundImage: SVG_PATTERN,
      }}
    />
  );
}

function FeaturedGallery() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* First item spans 2x2 */}
      <div
        className="col-span-2 row-span-2 overflow-hidden rounded-lg aspect-square"
        style={{
          backgroundColor: "var(--bg-sunken)",
          backgroundImage: SVG_PATTERN,
        }}
      />
      {GALLERY_ITEMS.slice(1, 5).map((item) => (
        <GalleryItem key={item.id} aspect="aspect-square" />
      ))}
      {GALLERY_ITEMS.slice(5, 8).map((item) => (
        <GalleryItem key={item.id} aspect="aspect-square" />
      ))}
    </div>
  );
}

function UniformGallery() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {GALLERY_ITEMS.map((item) => (
        <GalleryItem key={item.id} aspect="aspect-square" />
      ))}
    </div>
  );
}

function MasonryGallery() {
  return (
    <div className="columns-2 gap-3 sm:columns-4">
      {GALLERY_ITEMS.map((item) => (
        <div key={item.id} className="mb-3 break-inside-avoid">
          <GalleryItem aspect={item.aspect} />
        </div>
      ))}
    </div>
  );
}

function CarouselGallery() {
  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none">
      {GALLERY_ITEMS.map((item) => (
        <div
          key={item.id}
          className="w-56 shrink-0 snap-start sm:w-64"
        >
          <GalleryItem aspect="aspect-[3/4]" className="rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function GallerySection({ className }: { className?: string }) {
  const { config } = useBuilder();
  const { galleryLayout } = config;

  return (
    <section
      className={cn(
        "w-full px-6 py-12 transition-all duration-500 ease-in-out lg:px-10",
        className,
      )}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Section label */}
      <p
        className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--accent)" }}
      >
        Portfolio
      </p>

      {galleryLayout === "featured" && <FeaturedGallery />}
      {galleryLayout === "uniform" && <UniformGallery />}
      {galleryLayout === "masonry" && <MasonryGallery />}
      {galleryLayout === "carousel" && <CarouselGallery />}
    </section>
  );
}
