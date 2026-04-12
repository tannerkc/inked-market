import React from "react";
import { cn } from "@/lib/utils";

interface IntegrationBadgesProps {
  googleBusiness?: { profileUrl: string; rating: number; reviewCount: number };
  yelp?: { profileUrl: string; rating: number; reviewCount: number };
  className?: string;
}

const IntegrationBadges = React.forwardRef<HTMLDivElement, IntegrationBadgesProps>(
  ({ googleBusiness, yelp, className }, ref) => {
    if (!googleBusiness && !yelp) return null;

    const badgeClass = "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] hover:bg-ink-cream/[0.06] hover:border-ink-cream/10 transition-all duration-300 group";

    return (
      <div ref={ref} className={cn("mt-4", className)}>
        <div className="flex flex-wrap gap-2">
          {googleBusiness && (
            <a href={googleBusiness.profileUrl} target="_blank" rel="noopener noreferrer" className={badgeClass}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] tracking-[0.05em] text-ink-cream/70 group-hover:text-ink-cream/90 transition-colors">
                  {googleBusiness.rating.toFixed(1)}/5
                </span>
                <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-ink-cream/30">
                  {googleBusiness.reviewCount} reviews
                </span>
              </div>
            </a>
          )}
          {yelp && (
            <a href={yelp.profileUrl} target="_blank" rel="noopener noreferrer" className={badgeClass}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#FF1A1A">
                <path d="M20.16 12.73c-.16-.24-.46-.3-.46-.3l-3.1-1.23c-.37-.14-.62.04-.68.12-.06.08-.16.26.02.6l1.47 2.93s.1.2.34.24c.26.06.54-.08.7-.26.53-.56.82-1.16.82-1.16.16-.3-.02-.7-.11-.94zM14.5 15.8s-.06-.3-.28-.42c-.22-.12-.5-.02-.5-.02l-2.96 1.42c-.36.18-.38.52-.34.64.04.12.12.34.34.46.72.38 1.42.5 1.42.5.34.06.7-.16.82-.38l.6-1.38s.06-.3-.1-.82zM12.76 13.4c.16-.14.14-.48.14-.48l-.38-3.3c-.04-.4-.34-.5-.46-.52-.12-.02-.38-.06-.58.1-.66.52-1.06 1.12-1.06 1.12-.18.28-.04.66.08.82l2.04 2.48s.06.06.22-.22zM13.08 10.56c.26.06.44-.16.44-.16l2.18-2.44c.24-.28.08-.56 0-.66-.08-.1-.24-.28-.48-.34-.82-.2-1.54-.08-1.54-.08-.36.04-.56.4-.58.58l-.28 2.82s-.02.24.26.28zM10.16 13.08s.22.14.46.06c.24-.08.3-.34.3-.34l.58-3.28c.06-.4-.2-.58-.3-.62-.1-.06-.32-.14-.56-.04-.78.32-1.3.82-1.3.82-.28.22-.2.62-.1.8l1.28 2.66s-.22-.36-.36-.06z" />
              </svg>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] tracking-[0.05em] text-ink-cream/70 group-hover:text-ink-cream/90 transition-colors">
                  {yelp.rating.toFixed(1)}/5
                </span>
                <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-ink-cream/30">
                  {yelp.reviewCount} reviews
                </span>
              </div>
            </a>
          )}
        </div>
        {/* Attribution (Google TOS + Yelp TOS) */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {googleBusiness && (
            <span className="font-mono text-[7px] tracking-[0.15em] uppercase text-ink-cream/15">
              Powered by Google
            </span>
          )}
          {yelp && (
            <a href={yelp.profileUrl} target="_blank" rel="noopener noreferrer"
               className="font-mono text-[7px] tracking-[0.15em] uppercase text-ink-cream/15 hover:text-ink-cream/30 transition-colors">
              View on Yelp
            </a>
          )}
        </div>
      </div>
    );
  }
);
IntegrationBadges.displayName = "IntegrationBadges";

export { IntegrationBadges };
