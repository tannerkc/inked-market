/**
 * FlashCard — thin wrapper around ProfileCard for backwards compatibility.
 * Maps the discover page's Badge type to ProfileCard's CardBadge.
 */
import React from "react";
import { ProfileCard } from "./profile-card";
import type { Badge } from "@/lib/data/discover";

interface FlashCardProps {
  id: string;
  type: "studio" | "artist";
  name: string;
  image: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  badges?: Badge[];
  artistCount?: number;
  className?: string;
}

const FlashCard = React.forwardRef<HTMLAnchorElement, FlashCardProps>(
  ({ badges = [], ...props }, ref) => (
    <ProfileCard
      ref={ref}
      badges={badges}
      aspect="3/4"
      {...props}
    />
  )
);
FlashCard.displayName = "FlashCard";

export { FlashCard };
