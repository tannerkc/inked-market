import React from "react";
import { cn } from "@/lib/utils";

interface FilmGrainOverlayProps {
  className?: string;
}

const FilmGrainOverlay = React.forwardRef<HTMLDivElement, FilmGrainOverlayProps>(
  ({ className }, ref) => (
    <div
      ref={ref}
      className={cn("absolute inset-0 film-grain opacity-[0.035] pointer-events-none", className)}
    />
  )
);
FilmGrainOverlay.displayName = "FilmGrainOverlay";

export { FilmGrainOverlay };
