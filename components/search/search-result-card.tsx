/**
 * SearchResultCard — thin wrapper around ProfileCard for the search page.
 * Maps search result data shape to ProfileCard props.
 */
import React from "react";
import { ProfileCard, type CardBadge } from "@/components/ui/profile-card";

export interface SearchResultCardProps {
  type: "artist" | "studio";
  id: string;
  slug?: string;
  name: string;
  avatar: string;
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  verified: boolean;
  artistCount?: number;
  badges?: CardBadge[];
  className?: string;
}

const SearchResultCard = React.forwardRef<HTMLAnchorElement, SearchResultCardProps>(
  ({ images, avatar, verified, badges, ...props }, ref) => (
    <ProfileCard
      ref={ref}
      image={images[0] || ""}
      images={images}
      avatar={avatar}
      verified={verified}
      badges={badges}
      aspect="3/5"
      {...props}
    />
  )
);
SearchResultCard.displayName = "SearchResultCard";

export { SearchResultCard };
