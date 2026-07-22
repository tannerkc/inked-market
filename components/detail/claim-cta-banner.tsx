import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ClaimCtaBannerProps {
  studioId: string;
  className?: string;
}

const ClaimCtaBanner = React.forwardRef<HTMLDivElement, ClaimCtaBannerProps>(
  ({ studioId, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-6 md:mx-12 mt-6 px-5 py-4 rounded-lg",
        "bg-ink-sage/[0.08] border border-ink-sage/20",
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
        className
      )}
    >
      <div>
        <p className="font-mono text-[11px] tracking-[0.05em] text-ink-cream/70">
          Is this your shop?
        </p>
        <p className="font-mono text-[9px] tracking-[0.04em] text-ink-cream/35 mt-0.5">
          Claim it to customize your listing, add photos, and manage your
          profile.
        </p>
      </div>
      <Link
        href={`/claim/${studioId}`}
        className={cn(
          "shrink-0 px-4 py-2 rounded-full",
          "bg-ink-sage/20 border border-ink-sage/30",
          "font-mono text-[10px] tracking-[0.12em] uppercase text-ink-sage",
          "hover:bg-ink-sage/30 transition-colors duration-200"
        )}
      >
        Claim This Shop
      </Link>
    </div>
  )
);
ClaimCtaBanner.displayName = "ClaimCtaBanner";

export { ClaimCtaBanner };
