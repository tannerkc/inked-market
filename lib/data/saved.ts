import type { SavedItemMeta } from "@/lib/types";
import type { CardBadge } from "@/components/ui/profile-card";

// ─── Shared saved entity shape ──────────────────────────────────────────────

export interface SavedEntity {
  id: string;
  /** Pretty URL slug — present on DB rows; links fall back to id without it. */
  slug?: string;
  name: string;
  image: string;
  avatar?: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  verified: boolean;
  badges: CardBadge[];
  savedAt: string;
}

export interface SavedStudio extends SavedEntity {
  artistCount?: number;
}

export const savedStudios: SavedStudio[] = [
  {
    id: "1",
    name: "Ink Paradise Studio",
    image: "https://www.glam.com/img/gallery/everything-you-need-to-know-about-becoming-a-tattoo-artist/l-intro-1685624990.jpg",
    location: "Los Angeles, CA",
    rating: 4.8,
    reviewCount: 124,
    specialties: ["Traditional", "Realism", "Color"],
    verified: true,
    badges: [
      { label: "Walk-ins", color: "rust" },
      { label: "Verified", color: "sage" },
    ],
    artistCount: 6,
    savedAt: "2026-04-02T14:30:00Z",
  },
  {
    id: "2",
    name: "Sacred Art Tattoo",
    image: "https://cdn.shopify.com/s/files/1/0566/0318/1110/files/Body2-1-1024x1024.png?v=1758733876",
    location: "New York, NY",
    rating: 4.9,
    reviewCount: 203,
    specialties: ["Japanese", "Blackwork", "Tribal"],
    verified: true,
    badges: [{ label: "Verified", color: "sage" }],
    artistCount: 4,
    savedAt: "2026-03-29T09:15:00Z",
  },
  {
    id: "3",
    name: "Eternal Canvas",
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=800",
    location: "Miami, FL",
    rating: 4.7,
    reviewCount: 89,
    specialties: ["Watercolor", "Fine Line", "Portrait"],
    verified: false,
    badges: [{ label: "Booking Open", color: "red" }],
    artistCount: 3,
    savedAt: "2026-03-22T18:45:00Z",
  },
];

// ─── Saved Artist (same shape as base entity) ──────────────────────────────

export type SavedArtist = SavedEntity;

export const savedArtists: SavedArtist[] = [
  {
    id: "1",
    name: "John Ham",
    image: "https://choose901.com/wp-content/uploads/2019/09/jordan-epperson-working-carrie-pinkley-e1569450400343.jpg",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Fine Line", "Minimalist", "Floral"],
    verified: true,
    badges: [
      { label: "Booking Open", color: "sage" },
      { label: "Verified", color: "sage" },
    ],
    savedAt: "2026-04-03T10:00:00Z",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    image: "https://www.format.com/wp-content/uploads/Tattoo_ARtist-scaled.jpg",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 198,
    specialties: ["Realism", "Portrait", "Black & Grey"],
    verified: true,
    badges: [],
    savedAt: "2026-04-01T16:20:00Z",
  },
  {
    id: "3",
    name: "Yuki Tanaka",
    image: "https://images.unsplash.com/photo-1475823678248-624fc6f85785?w=800",
    location: "Seattle, WA",
    rating: 5.0,
    reviewCount: 87,
    specialties: ["Japanese", "Traditional", "Color"],
    verified: true,
    badges: [{ label: "Verified", color: "sage" }],
    savedAt: "2026-03-30T12:00:00Z",
  },
  {
    id: "4",
    name: "Alex Johnson",
    image: "https://images.squarespace-cdn.com/content/v1/54281bf0e4b05b9e44ad00f6/6854a9f2-7348-416b-b68b-0d77563aa3a3/GIANNA+pic.jpg",
    location: "Portland, OR",
    rating: 4.7,
    reviewCount: 142,
    specialties: ["Geometric", "Dotwork", "Abstract"],
    verified: false,
    badges: [{ label: "New", color: "red" }],
    savedAt: "2026-03-25T08:30:00Z",
  },
  {
    id: "5",
    name: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Fine Line", "Minimalist", "Geometric"],
    verified: true,
    badges: [{ label: "Verified", color: "sage" }],
    savedAt: "2026-03-20T14:00:00Z",
  },
];

// ─── Saved Portfolio Piece shape ────────────────────────────────────────────

export interface SavedPortfolioPiece {
  id: string;
  url: string;
  title: string;
  artistName: string;
  artistId: string;
  artistSlug?: string;
  tags: string[];
  aspectRatio: "2:3" | "1:1" | "3:4";
  savedAt: string;
}

export const savedPortfolio: SavedPortfolioPiece[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
    title: "Floral Sleeve",
    artistName: "Sarah Chen",
    artistId: "1",
    tags: ["Floral", "Fine Line"],
    aspectRatio: "2:3",
    savedAt: "2026-04-04T09:00:00Z",
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600",
    title: "Eagle Chest Piece",
    artistName: "Mike Rodriguez",
    artistId: "2",
    tags: ["Traditional", "Color"],
    aspectRatio: "1:1",
    savedAt: "2026-04-02T11:30:00Z",
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
    title: "Sacred Geometry",
    artistName: "Yuki Tanaka",
    artistId: "3",
    tags: ["Japanese", "Geometric"],
    aspectRatio: "3:4",
    savedAt: "2026-03-28T15:00:00Z",
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
    title: "Botanical Forearm",
    artistName: "Sarah Chen",
    artistId: "1",
    tags: ["Botanical", "Minimalist"],
    aspectRatio: "2:3",
    savedAt: "2026-03-24T10:00:00Z",
  },
];

// ─── Combined metadata for All tab ──────────────────────────────────────────

export const savedItemsMeta: SavedItemMeta[] = [
  ...savedPortfolio.map((p) => ({
    id: p.id,
    entityId: p.id,
    entityType: "design" as const,
    savedAt: p.savedAt,
  })),
  ...savedArtists.map((a) => ({
    id: `artist-${a.id}`,
    entityId: a.id,
    entityType: "artist" as const,
    savedAt: a.savedAt,
  })),
  ...savedStudios.map((s) => ({
    id: `studio-${s.id}`,
    entityId: s.id,
    entityType: "studio" as const,
    savedAt: s.savedAt,
  })),
].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

// ─── Utility ────────────────────────────────────────────────────────────────

export function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}
