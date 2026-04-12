import React from "react";
import type { SocialLinks as SocialLinksType } from "@/lib/types";

interface SocialLinksProps {
  links: SocialLinksType;
  integrations?: {
    googleBusiness?: { profileUrl: string };
    yelp?: { profileUrl: string };
    booking?: { bookingUrl: string; label?: string };
  };
}

const SocialLinks = React.forwardRef<HTMLDivElement, SocialLinksProps>(
  ({ links, integrations }, ref) => (
    <div ref={ref} className="flex flex-wrap gap-2">
      {links.instagram && (
        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◉ Instagram
        </a>
      )}
      {links.facebook && (
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◉ Facebook
        </a>
      )}
      {links.website && (
        <a
          href={links.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◎ Website
        </a>
      )}
      {integrations?.googleBusiness && (
        <a
          href={integrations.googleBusiness.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◉ Google
        </a>
      )}
      {integrations?.yelp && (
        <a
          href={integrations.yelp.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◉ Yelp
        </a>
      )}
      {integrations?.booking && (
        <a
          href={integrations.booking.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
        >
          ◎ {integrations.booking.label ?? "Book Online"}
        </a>
      )}
    </div>
  )
);
SocialLinks.displayName = "SocialLinks";

export { SocialLinks };
