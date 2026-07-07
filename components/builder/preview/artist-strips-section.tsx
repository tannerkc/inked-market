"use client";

import { PLACEHOLDER_PATTERN, PLACEHOLDER_PATTERN_RAW } from "@/lib/utils/placeholder-pattern";
import { PHOTO_TONES } from "@/lib/data/mock-studio";

import { useState } from "react";
import Link from "next/link";
import { useStudioSite } from "@/components/studio-site/studio-site-context";
import { SectionEmptyState } from "@/components/studio-site/empty-states";
import type { StudioSiteArtist } from "@/components/studio-site/studio-site-data";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { cn } from "@/lib/utils";


// Avatar gradients cycled by roster index — reproduces the original mock's
// per-artist avatar colors without carrying avatarClass in the data contract.
const AVATAR_GRADIENTS = [
  "from-blue-700 to-blue-500",
  "from-orange-700 to-orange-500",
  "from-emerald-800 to-emerald-600",
];

function avatarClassFor(index: number) {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]!;
}

function PhotoBlock({
  src,
  className,
  onClick,
}: {
  src?: string;
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
        backgroundImage: src ? `url("${src}")` : PLACEHOLDER_PATTERN,
        backgroundSize: src ? "cover" : undefined,
        backgroundPosition: src ? "center" : undefined,
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
  avatarClass,
  photosToShow,
  onOverflowClick,
  onPhotoClick,
}: {
  artist: StudioSiteArtist;
  avatarClass: string;
  photosToShow: number;
  onOverflowClick: (artist: StudioSiteArtist) => void;
  onPhotoClick: (artist: StudioSiteArtist, index: number) => void;
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
              avatarClass
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
              {[artist.styles.join(" · "), artist.photoCount > 0 ? `${artist.photoCount} photos` : null]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>
        {artist.profileHref ? (
          <Link
            href={artist.profileHref}
            className="text-[10px] @sm:text-[11px] font-medium shrink-0 ml-2 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            View profile &#8599;
          </Link>
        ) : null}
      </div>

      {/* Photo strip — sizing handled by CSS in globals.css via data attributes */}
      {artist.photos.length > 0 ? (
        <div data-photo-strip>
          <div data-photo-track>
            {strip.map((photo, i) => (
              <PhotoBlock key={photo.id} src={photo.url} onClick={() => onPhotoClick(artist, i)} />
            ))}
            {remaining > 0 ? (
              <OverflowPill
                remaining={remaining}
                onClick={() => onOverflowClick(artist)}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 w-12 shrink-0 rounded-md opacity-40"
              style={{ background: "var(--bg-sunken)", backgroundImage: PLACEHOLDER_PATTERN }}
              aria-hidden="true"
            />
          ))}
          <span className="ml-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
            Portfolio coming soon
          </span>
        </div>
      )}
    </div>
  );
}


function ArtistGallerySheet({
  artist,
  avatarClass,
  open,
  onClose,
  onPhotoClick,
}: {
  artist: StudioSiteArtist;
  avatarClass: string;
  open: boolean;
  onClose: () => void;
  onPhotoClick: (index: number) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={artist.name}
      className="[--bg-raised:transparent] [--bg-sunken:rgba(255,255,255,0.1)] [--text-muted:#ffffff] [--text-secondary:#ffffff] [--border:rgba(255,255,255,0.1)]"
    >
      {/* Artist mini-profile */}
      <div
        className="flex items-center gap-3 mb-5 pb-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white shrink-0",
            avatarClass
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
        {artist.profileHref ? (
          <Link
            href={artist.profileHref}
            className="text-[11px] font-medium shrink-0 transition-colors hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            View profile &#8599;
          </Link>
        ) : null}
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
              backgroundImage: photo.url ? `url("${photo.url}")` : PLACEHOLDER_PATTERN,
              backgroundSize: photo.url ? "cover" : undefined,
              backgroundPosition: photo.url ? "center" : undefined,
            }}
          />
        ))}
      </div>

      {/* Footer count */}
      <div className="mt-4 pt-3 text-center">
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Showing {artist.photos.length} of {artist.photoCount} photos
        </span>
      </div>
    </BottomSheet>
  );
}

export function ArtistStripsSection() {
  const { config, data } = useStudioSite();
  const { galleryPhotosPerArtist } = config;
  const artists = data.artists;

  const [sheetArtist, setSheetArtist] = useState<StudioSiteArtist | null>(null);
  const [lightboxArtist, setLightboxArtist] = useState<StudioSiteArtist | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photosToShow = galleryPhotosPerArtist ?? 5;

  const openLightbox = (artist: StudioSiteArtist, index: number) => {
    setLightboxArtist(artist);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxArtist(null);
    setLightboxIndex(null);
  };

  const lightboxPhotos = (lightboxArtist?.photos ?? []).map((photo, i) => ({
    id: i,
    src: photo.url,
  }));

  // No roster → designed empty state (public parity), never a hidden section.
  if (artists.length === 0) {
    return (
      <section data-builder-section="artist-strips" style={{ background: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-[1350px] px-6 @lg:px-10 pt-6 pb-4">
          <p
            className="text-[11px] font-bold tracking-[0.15em] uppercase mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Our Artists
          </p>
          <div
            data-builder-card
            className="rounded-lg border"
            style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
          >
            <SectionEmptyState
              message="Artist lineup coming soon."
              prompt={{ group: "artists", label: "Add artists" }}
            />
          </div>
        </div>
      </section>
    );
  }

  const sheetIndex = sheetArtist ? artists.findIndex((a) => a.id === sheetArtist.id) : -1;

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

        {artists.map((artist, i) => (
          <ArtistStrip
            key={artist.id}
            artist={artist}
            avatarClass={avatarClassFor(i)}
            photosToShow={photosToShow}
            onOverflowClick={setSheetArtist}
            onPhotoClick={openLightbox}
          />
        ))}
      </div>

      <ArtistGallerySheet
        artist={sheetArtist ?? artists[0]!}
        avatarClass={avatarClassFor(sheetIndex >= 0 ? sheetIndex : 0)}
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
