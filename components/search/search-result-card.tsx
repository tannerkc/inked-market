/**
 * SearchResultCard — thin wrapper around ProfileCard for the search page.
 * Maps search result data shape to ProfileCard props.
 */
import React from "react";
import { ProfileCard } from "@/components/ui/profile-card";

export interface SearchResultCardProps {
  type: "artist" | "studio";
  id: string;
  name: string;
  avatar: string;
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  verified: boolean;
  variant?: "light" | "dark";
  artistCount?: number;
  className?: string;
}

const SearchResultCard = React.forwardRef<HTMLAnchorElement, SearchResultCardProps>(
  ({ images, avatar, verified, ...props }, ref) => (
    <ProfileCard
      ref={ref}
      image={images[0] || ""}
      images={images}
      avatar={avatar}
      verified={verified}
      aspect="3/5"
      {...props}
    />
  )
);
SearchResultCard.displayName = "SearchResultCard";

export { SearchResultCard };
