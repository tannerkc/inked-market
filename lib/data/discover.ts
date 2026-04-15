import type { InkAccentColor } from "@/lib/types";

export interface Badge {
  label: string;
  color: InkAccentColor;
}

export const badgeColorMap: Record<Badge["color"], string> = {
  sage: "bg-ink-sage",
  rust: "bg-ink-rust",
  red: "bg-ink-red",
};

export interface DiscoverProfile {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  verified: boolean;
  badges: Badge[];
  artistCount?: number;
  description?: string;
}

export const mockStudios: DiscoverProfile[] = [
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
    description:
      "Six chairs, zero egos. Traditional and realism specialists since 2019. Walk in on a Saturday and you'll leave with something permanent.",
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
    description:
      "Six artists. Zero egos. Japanese and blackwork specialists since 2018. Walk in on a Tuesday afternoon and you'll hear Coltrane, smell sandalwood, and leave with something permanent.",
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
    description:
      "Where watercolor meets skin. Delicate work that looks like it was painted, not tattooed.",
  },
];

export const mockArtists: DiscoverProfile[] = [
  {
    id: "1",
    name: "John Ham",
    image: "https://choose901.com/wp-content/uploads/2019/09/jordan-epperson-working-carrie-pinkley-e1569450400343.jpg",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Fine Line", "Minimalist", "Floral"],
    verified: true,
    badges: [
      { label: "Booking Open", color: "sage" },
      { label: "Verified", color: "sage" },
    ],
    description:
      "Fine line botanicals that look like they grew there. Three-month waitlist. Worth it. Every piece is a conversation between skin and nature.",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    image: "https://www.format.com/wp-content/uploads/Tattoo_ARtist-scaled.jpg",
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 198,
    specialties: ["Realism", "Portrait", "Black & Grey"],
    verified: true,
    badges: [],
    description:
      "Photorealism on skin. Portraits that make people do a double-take. If you want it to look real, Marcus is your guy.",
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
    description:
      "Third-generation Japanese tattoo tradition meets Pacific Northwest soul. Full sleeves that tell a story from wrist to shoulder.",
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
    description:
      "Sacred geometry and mathematical precision. Every dot placed with intention. The kind of work that makes other artists stop and stare.",
  },
];

export const discoverFilters = [
  "All Styles",
  "Near Me",
  "Walk-ins",
  "Booking Open",
  "Fine Line",
  "Japanese",
  "Blackwork",
];
