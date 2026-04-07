import Image from "next/image";
import React from "react";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { cn } from "@/lib/utils";

interface DetailHeroProps {
  coverImage?: string;
  name: string;
  children: React.ReactNode;
  className?: string;
}

const DetailHero = React.forwardRef<HTMLElement, DetailHeroProps>(
  ({ coverImage, name, children, className }, ref) => (
    <section
      ref={ref}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 min-h-[480px] md:min-h-[560px] relative pt-16",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden min-h-[300px] md:min-h-0 group">
        {coverImage && (
          <Image
            src={coverImage}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover saturate-[0.7] contrast-[1.1] transition-[filter] duration-500 group-hover:saturate-100 group-hover:contrast-100"
          />
        )}
      </div>

      {/* Text Panel */}
      <div className="relative px-6 py-10 md:px-12 md:py-16 flex flex-col justify-center overflow-hidden">
        <FilmGrainOverlay />
        {children}
      </div>
    </section>
  )
);
DetailHero.displayName = "DetailHero";

export { DetailHero };
