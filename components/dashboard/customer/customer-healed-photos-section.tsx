"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import type { HealedPhoto } from "@/lib/types";

interface CustomerHealedPhotosSectionProps {
  photos: HealedPhoto[];
  onUpload: () => void;
  className?: string;
}

const CustomerHealedPhotosSection = React.forwardRef<
  HTMLDivElement,
  CustomerHealedPhotosSectionProps
>(({ photos, onUpload, className, ...props }, ref) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div ref={ref} className={className} {...props}>
      <DashboardSection
        title="Healed Photos"
        action={{ label: "Upload", onClick: onUpload }}
      >
        {photos.length === 0 ? (
          <EmptyState
            message="Share your healed results"
            description="Helps your artist's portfolio too"
            action={{ label: "Upload Photo", onClick: onUpload }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="group">
                <div
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden flex items-center justify-center transition-colors",
                    isDark
                      ? "bg-ink-cream/[0.04] group-hover:bg-ink-cream/[0.06]"
                      : "bg-ink-black/[0.04] group-hover:bg-ink-black/[0.06]"
                  )}
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption ?? "Healed tattoo"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={cn(
                        isDark ? "text-ink-cream/15" : "text-ink-black/15"
                      )}
                    >
                      <path
                        d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="mt-1.5 flex items-start justify-between gap-1">
                  {photo.caption && (
                    <p
                      className={cn(
                        "text-[11px] truncate",
                        isDark ? "text-ink-cream/40" : "text-ink-black/40"
                      )}
                    >
                      {photo.caption}
                    </p>
                  )}
                  {photo.approvedForPortfolio && (
                    <span
                      className={cn(
                        "font-mono text-[9px] tracking-[0.1em] uppercase rounded-full px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap",
                        isDark
                          ? "bg-ink-sage/10 text-ink-sage/70"
                          : "bg-ink-sage/10 text-ink-sage"
                      )}
                    >
                      In Portfolio
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerHealedPhotosSection.displayName = "CustomerHealedPhotosSection";

export { CustomerHealedPhotosSection };
export type { CustomerHealedPhotosSectionProps };
