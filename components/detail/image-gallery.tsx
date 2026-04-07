import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery = React.forwardRef<HTMLDivElement, ImageGalleryProps>(
  ({ images, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-[3px] px-6 md:px-12",
        className
      )}
    >
      {images.map((url, i) => (
        <div
          key={url}
          className={cn(
            "relative overflow-hidden cursor-pointer rounded group",
            i === 0 && images.length > 2 && "col-span-2 row-span-2"
          )}
          style={{
            aspectRatio:
              i === 0 && images.length > 2 ? undefined : "3/4",
          }}
        >
          <Image
            src={url}
            alt={`Gallery image ${i + 1}`}
            fill
            sizes={
              i === 0
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 50vw, 25vw"
            }
            className="object-cover saturate-[0.8] contrast-[1.05] transition-all duration-500 group-hover:scale-[1.08] group-hover:saturate-100 group-hover:contrast-100"
          />
        </div>
      ))}
    </div>
  )
);
ImageGallery.displayName = "ImageGallery";

export { ImageGallery };
