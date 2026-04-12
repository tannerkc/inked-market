"use client";

import { PLACEHOLDER_PATTERN, PLACEHOLDER_PATTERN_RAW } from "@/lib/utils/placeholder-pattern";
import { PHOTO_TONES } from "@/lib/data/mock-studio";

import { useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { cn } from "@/lib/utils";


type MockPhoto = {
  id: number;
};

type MockArtist = {
  id: number;
  name: string;
  initials: string;
  styles: string[];
  photoCount: number;
  avatarClass: string;
  photos: MockPhoto[];
};

const MOCK_ARTISTS: MockArtist[] = [
  {
    id: 1,
    name: "Jake Morrison",
    initials: "JM",
    styles: ["Traditional", "Neo-Traditional"],
    photoCount: 43,
    avatarClass: "from-blue-700 to-blue-500",
    photos: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
  },
  {
    id: 2,
    name: "Sarah Chen",
    initials: "SC",
    styles: ["Fine Line", "Minimalist"],
    photoCount: 28,
    avatarClass: "from-orange-700 to-orange-500",
    photos: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
  },
  {
    id: 3,
    name: "Marcus Reyes",
    initials: "MR",
    styles: ["Japanese", "Blackwork"],
    photoCount: 61,
    avatarClass: "from-emerald-800 to-emerald-600",
    photos: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
  },
];

function PhotoBlock({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-photo-item
      onClick={onClick}
      className={cn(
        "rounded-lg overflow-hidden cursor-zoom-in transition-opacity hover:opacity-80",
        className
      )}
      style={{
        background: "var(--bg-sunken)",
        backgroundImage: PLACEHOLDER_PATTERN,
      }}
    />
  );
}

function OverflowPill({
  remaining,
  onClick,
}: {
  remaining: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-photo-item
      onClick={onClick}
      className="rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-sunken)",
      }}
    >
      <span
        className="text-base font-bold leading-none"
        style={{ color: "var(--accent)" }}
      >
        +{remaining}
      </span>
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--text-muted)" }}
      >
        more
      </span>
    </button>
  );
}

function ArtistStrip({
  artist,
  photosToShow,
  onOverflowClick,
  onPhotoClick,
}: {
  artist: MockArtist;
  photosToShow: number;
  onOverflowClick: (artist: MockArtist) => void;
  onPhotoClick: (artist: MockArtist, index: number) => void;
}) {
  const strip = artist.photos.slice(0, photosToShow);
  const remaining = artist.photoCount - photosToShow;

  return (
    <div
      className="pt-4 pb-3 border-b last:border-b-0"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Identity row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-8 h-8 @sm:w-9 @sm:h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] @sm:text-[11px] font-bold text-white shrink-0",
              artist.avatarClass
            )}
          >
            {artist.initials}
          </div>
          <div className="min-w-0">
            <div
              className="text-[12px] @sm:text-[13px] font-semibold leading-tight truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {artist.name}
            </div>
            <div
              className="text-[10px] @sm:text-[11px] leading-tight mt-0.5 truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {artist.styles.join(" · ")} · {artist.photoCount} photos
            </div>
          </div>
        </div>
        <button
          type="button"
          className="text-[10px] @sm:text-[11px] font-medium shrink-0 ml-2"
          style={{ color: "var(--accent)" }}
        >
          View profile ↗
        </button>
      </div>

      {/* Photo strip — sizing handled by CSS in globals.css via data attributes */}
      <div data-photo-strip>
        <div data-photo-track>
          {strip.map((photo, i) => (
            <PhotoBlock key={photo.id} onClick={() => onPhotoClick(artist, i)} />
          ))}
          {remaining > 0 && (
            <OverflowPill
              remaining={remaining}
              onClick={() => onOverflowClick(artist)}
            />
          )}
        </div>
      </div>
    </div>
  );
}


function ArtistGallerySheet({
  artist,
  open,
  onClose,
  onPhotoClick,
}: {
  artist: MockArtist;
  open: boolean;
  onClose: () => void;
  onPhotoClick: (index: number) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={artist.name}
    >
      {/* Artist mini-profile */}
      <div
        className="flex items-center gap-3 mb-5 pb-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white shrink-0",
            artist.avatarClass
          )}
        >
          {artist.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[12px] font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {artist.styles.join(" · ")}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {artist.photoCount} photos
          </div>
        </div>
        <button
          type="button"
          className="text-[11px] font-medium shrink-0 transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          View profile ↗
        </button>
      </div>

      {/* 3-col portrait grid — each photo has a distinct muted tone */}
      <div className="grid grid-cols-3 gap-1.5">
        {artist.photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onPhotoClick(i)}
            className="aspect-[3/4] rounded-md overflow-hidden cursor-zoom-in transition-opacity hover:opacity-75"
            style={{
              backgroundColor: PHOTO_TONES[i % PHOTO_TONES.length],
              backgroundImage: PLACEHOLDER_PATTERN,
            }}
          />
        ))}
      </div>

      {/* Footer count */}
      <div className="mt-4 pt-3 text-center">
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Showing 12 of {artist.photoCount} photos
        </span>
      </div>
    </BottomSheet>
  );
}

export function ArtistStripsSection() {
  const { config } = useBuilder();
  const { galleryPhotosPerArtist } = config;

  const [sheetArtist, setSheetArtist] = useState<MockArtist | null>(null);
  const [lightboxArtist, setLightboxArtist] = useState<MockArtist | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photosToShow = galleryPhotosPerArtist ?? 5;

  const openLightbox = (artist: MockArtist, index: number) => {
    setLightboxArtist(artist);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxArtist(null);
    setLightboxIndex(null);
  };

  const lightboxPhotos = lightboxArtist?.photos ?? [];

  return (
    <section
      data-builder-section="artist-strips"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-[1350px] px-6 @lg:px-10 pt-6 pb-4">
        {/* Section heading */}
        <p
          className="text-[11px] font-bold tracking-[0.15em] uppercase mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Our Artists
        </p>

        {MOCK_ARTISTS.map((artist) => (
          <ArtistStrip
            key={artist.id}
            artist={artist}
            photosToShow={photosToShow}
            onOverflowClick={setSheetArtist}
            onPhotoClick={openLightbox}
          />
        ))}
      </div>

      <ArtistGallerySheet
        artist={sheetArtist ?? MOCK_ARTISTS[0]}
        open={!!sheetArtist}
        onClose={() => setSheetArtist(null)}
        onPhotoClick={(index) => {
          if (sheetArtist) {
            openLightbox(sheetArtist, index);
          }
        }}
      />

      <PhotoLightbox
        photos={lightboxPhotos}
        activeIndex={lightboxIndex}
        onClose={closeLightbox}
        onNavigate={setLightboxIndex}
        placeholderPattern={PLACEHOLDER_PATTERN_RAW}
      />
    </section>
  );
}
