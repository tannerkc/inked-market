import React from "react";
import type { SocialLinks as SocialLinksType } from "@/lib/types";
import type { StudioIntegrations } from "@/lib/types/integrations";
import { socialUrl } from "@/lib/utils/external-links";
import { getBookingLink, getReviewProfileLinks } from "@/lib/utils/studio-content";

interface SocialLinkItemProps {
  href: string;
  icon: string;
  label: string;
}

function SocialLinkItem({ href, icon, label }: SocialLinkItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 font-mono text-[9px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-ink-cream/10 text-ink-cream/50 hover:border-ink-red hover:text-ink-red transition-all duration-300"
    >
      {icon} {label}
    </a>
  );
}

interface SocialLinksProps {
  links: SocialLinksType;
  integrations?: StudioIntegrations;
}

const SocialLinks = React.forwardRef<HTMLDivElement, SocialLinksProps>(
  ({ links, integrations }, ref) => {
    const items: SocialLinkItemProps[] = [];
    const push = (href: string | null | undefined, icon: string, label: string) => {
      if (href) items.push({ href, icon, label });
    };

    push(socialUrl("instagram", links.instagram), "◉", "Instagram");
    push(socialUrl("facebook", links.facebook), "◉", "Facebook");
    push(socialUrl("tiktok", links.tiktok), "◉", "TikTok");
    push(socialUrl("x", links.twitter), "◉", "X");
    push(socialUrl("website", links.website), "◎", "Website");
    for (const review of getReviewProfileLinks(integrations)) {
      push(review.url, "◉", review.name);
    }
    push(getBookingLink(integrations)?.url, "◎", "Book Online");

    if (items.length === 0) return null;
    return (
      <div ref={ref} className="flex flex-wrap gap-2">
        {items.map((item) => (
          <SocialLinkItem key={item.label} {...item} />
        ))}
      </div>
    );
  }
);
SocialLinks.displayName = "SocialLinks";

export { SocialLinks };
