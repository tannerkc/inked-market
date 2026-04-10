"use client";

import { useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

const SVG_PATTERN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='none'/%3E%3Cpath d='M0 0h1v20H0zm10 0h1v20h-1zM0 0v1h20V0zm0 10v1h20v-1z' fill='%23fff' opacity='.06'/%3E%3C/svg%3E`;

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

function PhotoBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg overflow-hidden flex-1 min-w-0 aspect-[3/4]", className)}
      style={{
        background: "var(--bg-sunken)",
        backgroundImage: `url("${SVG_PATTERN}")`,
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
      onClick={onClick}
      className="flex-1 min-w-0 aspect-[3/4] rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
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
}: {
  artist: MockArtist;
  photosToShow: number;
  onOverflowClick: (artist: MockArtist) => void;
}) {
  const strip = artist.photos.slice(0, photosToShow);
  const remaining = artist.photoCount - photosToShow;

  return (
    <div
      className="px-5 py-5 border-b last:border-b-0"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white shrink-0",
              artist.avatarClass
            )}
          >
            {artist.initials}
          </div>
          <div>
            <div
              className="text-[13px] font-semibold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {artist.name}
            </div>
            <div
              className="text-[11px] leading-tight mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {artist.styles.join(" · ")} · {artist.photoCount} photos
            </div>
          </div>
        </div>
        <button
          type="button"
          className="text-[11px] font-medium shrink-0"
          style={{ color: "var(--accent)" }}
        >
          View profile ↗
        </button>
      </div>
      <div className="flex gap-2">
        {strip.map((photo) => (
          <PhotoBlock key={photo.id} />
        ))}
        {remaining > 0 && (
          <OverflowPill
            remaining={remaining}
            onClick={() => onOverflowClick(artist)}
          />
        )}
      </div>
    </div>
  );
}

function ArtistGallerySheet({
  artist,
  open,
  onClose,
}: {
  artist: MockArtist;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`${artist.name} — ${artist.photoCount} photos`}
    >
      <div className="grid grid-cols-2 @md:grid-cols-4 gap-2">
        {artist.photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square rounded-lg overflow-hidden"
            style={{
              background: "var(--bg-sunken)",
              backgroundImage: `url("${SVG_PATTERN}")`,
            }}
          />
        ))}
      </div>
      <div
        className="mt-4 pt-4 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Showing 12 of {artist.photoCount} photos
        </span>
        <button
          type="button"
          className="text-[12px] font-medium"
          style={{ color: "var(--accent)" }}
        >
          View full profile ↗
        </button>
      </div>
    </BottomSheet>
  );
}

export function GallerySection() {
  const { config } = useBuilder();
  const { showGalleryHeading, galleryPhotosPerArtist } = config;
  const [sheetArtist, setSheetArtist] = useState<MockArtist | null>(null);

  const photosToShow = galleryPhotosPerArtist ?? 5;

  return (
    <section
      data-builder-section="gallery"
      style={{ background: "var(--bg-primary)" }}
    >
      {showGalleryHeading && (
        <div className="px-5 pt-6 pb-2">
          <div
            className="text-[10px] font-bold tracking-[0.12em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Gallery
          </div>
        </div>
      )}
      {MOCK_ARTISTS.map((artist) => (
        <ArtistStrip
          key={artist.id}
          artist={artist}
          photosToShow={photosToShow}
          onOverflowClick={setSheetArtist}
        />
      ))}
      <ArtistGallerySheet
        artist={sheetArtist ?? MOCK_ARTISTS[0]}
        open={!!sheetArtist}
        onClose={() => setSheetArtist(null)}
      />
    </section>
  );
}
