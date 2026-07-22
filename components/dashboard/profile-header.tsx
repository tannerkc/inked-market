import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";

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
    const shapeClass = avatarShape === "circle" ? "rounded-full" : "rounded-xl";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-row gap-3.5 mb-5 pb-4 border-b",
          "border-ink-black/[0.06] dark:border-ink-cream/[0.06]",
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
              "border-ink-black/[0.15] dark:border-ink-cream/[0.15]",
              shapeClass
            )}>
              <span className="text-xl text-ink-black/20 dark:text-ink-cream/20">+</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-ink-black dark:text-ink-cream">
            {name}
          </p>
          {subtitle && (
            <p className="text-[11px] mt-0.5 text-ink-black/45 dark:text-ink-cream/45">
              {subtitle}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {tags.map((tag) => (
                <StatusBadge key={tag} label={tag} color={BADGE_COLORS.tagOutline} className="px-2.5" />
              ))}
            </div>
          )}
        </div>

        {/* Edit */}
        {onEdit && (
          <div className="shrink-0">
            <button
              onClick={onEdit}
              className="font-mono text-[8px] tracking-[0.15em] uppercase cursor-pointer transition-colors text-ink-black/35 hover:text-ink-black/55 dark:text-ink-cream/35 dark:hover:text-ink-cream/55"
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
