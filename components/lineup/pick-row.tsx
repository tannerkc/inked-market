import React from "react";
import Link from "next/link";
import { cn, profilePath } from "@/lib/utils";
import { bebasNeue } from "@/lib/fonts";
import type { LineupProfile } from "@/lib/types/lineup";

export interface PickRowProps {
  profile: LineupProfile;
  rank: number;
  className?: string;
}

const PickRow = React.forwardRef<HTMLAnchorElement, PickRowProps>(
  ({ profile, rank, className }, ref) => {
    const { type, name, image, location, specialties } = profile;
    const href = profilePath(type, profile);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "flex items-center gap-4 py-4 border-b group transition-colors rounded-lg",
          "border-ink-black/[0.06] hover:bg-ink-black/[0.02] hover:pl-2",
          "dark:border-ink-cream/[0.04] dark:hover:bg-ink-cream/[0.02]",
          className
        )}
      >
        <span className={`${bebasNeue.className} text-3xl min-w-[36px] text-center select-none text-ink-black/10 dark:text-ink-cream/10`}>
          {String(rank).padStart(2, "0")}
        </span>
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate transition-colors duration-500 text-ink-black dark:text-ink-cream">
            {name}
          </p>
          <p className="text-xs truncate transition-colors duration-500 text-ink-black/40 dark:text-ink-cream/40">
            {location} · {specialties.join(" · ")}
          </p>
        </div>
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-red flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </span>
      </Link>
    );
  }
);

PickRow.displayName = "PickRow";

export { PickRow };
