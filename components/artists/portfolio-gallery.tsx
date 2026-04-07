"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PortfolioImage } from "@/lib/types";

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  specialties: string[];
}

function PortfolioGallery({ images, specialties }: PortfolioGalleryProps) {
  const [activeTag, setActiveTag] = useState("All Work");

  const allTags = ["All Work", ...specialties];

  const filteredImages =
    activeTag === "All Work"
      ? images
      : images.filter((img) =>
          img.tags.some(
            (tag) => tag.toLowerCase() === activeTag.toLowerCase()
          )
        );

  return (
    <>
      {/* Filter Tags */}
      <div className="flex gap-2 px-6 md:px-12 flex-wrap">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              "font-mono text-[9px] tracking-[0.12em] uppercase px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer",
              activeTag === tag
                ? "text-ink-red border-ink-red/35 bg-ink-red/[0.06]"
                : "text-ink-cream/40 border-ink-cream/10 hover:border-ink-cream/25 hover:text-ink-cream/70"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[3px] px-6 md:px-12 mt-4">
        {filteredImages.map((image, i) => (
          <div
            key={image.id}
            className={cn(
              "relative overflow-hidden cursor-pointer rounded group",
              i === 0 && filteredImages.length > 2 && "col-span-2 row-span-2"
            )}
            style={{ aspectRatio: i === 0 && filteredImages.length > 2 ? undefined : "3/4" }}
          >
            <Image
              src={image.url}
              alt={image.title ?? "Portfolio image"}
              fill
              sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover saturate-[0.8] contrast-[1.05] transition-all duration-500 group-hover:scale-[1.08] group-hover:saturate-100 group-hover:contrast-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-3.5">
              <span className="text-[13px] font-semibold text-ink-cream">
                {image.title}
              </span>
              <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink-cream/50">
                {image.tags.join(" · ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

PortfolioGallery.displayName = "PortfolioGallery";
export { PortfolioGallery };
