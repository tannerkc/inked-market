"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useOverlayContainer } from "@/lib/contexts/overlay-context";

export interface LightboxPhoto {
  id: number;
  /** Optional: src for real images. Omit to render placeholder. */
  src?: string;
  alt?: string;
}

export interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  /** Optional: SVG pattern URL for placeholder background */
  placeholderPattern?: string;
  className?: string;
}

const PhotoLightbox = React.forwardRef<HTMLDivElement, PhotoLightboxProps>(
  ({ photos, activeIndex, onClose, onNavigate, placeholderPattern, className }, ref) => {
    const overlayEl = useOverlayContainer();
    const container = overlayEl ?? (typeof document !== "undefined" ? document.body : null);
    const posClass = overlayEl ? "absolute" : "fixed";

    const open = activeIndex !== null;

    // Keyboard navigation
    React.useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight" && activeIndex !== null) {
          onNavigate((activeIndex + 1) % photos.length);
        }
        if (e.key === "ArrowLeft" && activeIndex !== null) {
          onNavigate((activeIndex - 1 + photos.length) % photos.length);
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open, activeIndex, photos.length, onClose, onNavigate]);

    if (!container) return null;

    const photo = activeIndex !== null ? photos[activeIndex] : null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          aria-hidden="true"
          onClick={onClose}
          className={cn(
            `${posClass} inset-0 z-50 bg-black/85 backdrop-blur-sm`,
            "transition-opacity duration-200",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        />

        {/* Lightbox */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className={cn(
            `${posClass} inset-0 z-50 flex items-center justify-center p-4`,
            "transition-opacity duration-200",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            className
          )}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Photo counter */}
          {activeIndex !== null && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] font-medium text-white/60 tabular-nums">
              {activeIndex + 1} / {photos.length}
            </div>
          )}

          {/* Main photo */}
          {photo && (
            <div
              className="relative max-w-xl w-full aspect-[3/4] rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {photo.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.src}
                  alt={photo.alt ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: "var(--bg-sunken, #1a1a1a)",
                    backgroundImage: placeholderPattern ? `url("${placeholderPattern}")` : undefined,
                  }}
                />
              )}
            </div>
          )}

          {/* Prev button */}
          {photos.length > 1 && activeIndex !== null && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((activeIndex - 1 + photos.length) % photos.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && activeIndex !== null && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((activeIndex + 1) % photos.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </>,
      container
    );
  }
);

PhotoLightbox.displayName = "PhotoLightbox";

export { PhotoLightbox };
