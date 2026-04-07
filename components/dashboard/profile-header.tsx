"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface ProfileHeaderProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarShape?: "circle" | "rounded";
  tags?: string[];
  onEdit?: () => void;
  className?: string;
}

const ProfileHeader = React.forwardRef<HTMLDivElement, ProfileHeaderProps>(
  ({ name, subtitle, avatarUrl, avatarShape = "circle", tags, onEdit, className, ...props }, ref) => {
    const { mode } = useTheme();
    const isDark = mode === "dark";
    const shapeClass = avatarShape === "circle" ? "rounded-full" : "rounded-xl";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-row gap-3.5 mb-5 pb-4 border-b",
          isDark ? "border-ink-cream/[0.06]" : "border-ink-black/[0.06]",
          className
        )}
        {...props}
      >
        {/* Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className={cn("w-14 h-14 object-cover", shapeClass)}
            />
          ) : (
            <div className={cn(
              "w-14 h-14 border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-solid",
              isDark ? "border-ink-cream/[0.15]" : "border-ink-black/[0.15]",
              shapeClass
            )}>
              <span className={cn(
                "text-xl",
                isDark ? "text-ink-cream/20" : "text-ink-black/20"
              )}>+</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-base font-semibold",
            isDark ? "text-ink-cream" : "text-ink-black"
          )}>
            {name}
          </p>
          {subtitle && (
            <p className={cn(
              "text-[11px] mt-0.5",
              isDark ? "text-ink-cream/45" : "text-ink-black/45"
            )}>
              {subtitle}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full border",
                    isDark
                      ? "border-ink-red/20 text-ink-red/65"
                      : "border-ink-rust/20 text-ink-rust/65"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Edit */}
        {onEdit && (
          <div className="shrink-0">
            <button
              onClick={onEdit}
              className={cn(
                "font-mono text-[8px] tracking-[0.15em] uppercase cursor-pointer transition-colors",
                isDark
                  ? "text-ink-cream/35 hover:text-ink-cream/55"
                  : "text-ink-black/35 hover:text-ink-black/55"
              )}
            >
              Edit →
            </button>
          </div>
        )}
      </div>
    );
  }
);
ProfileHeader.displayName = "ProfileHeader";

export { ProfileHeader };
