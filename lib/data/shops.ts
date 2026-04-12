import type { Studio, Review } from "@/lib/types";

type StudioWithArtists = Studio & {
  artists: Array<{
    id: string;
    name: string;
    specialty: string;
    profileImage: string;
  }>;
};

export const mockStudios: Record<string, StudioWithArtists> = {
  "1": {
    id: "1",
    name: "Ink Paradise Studio",
    description: "Premium tattoo studio specializing in custom designs",
    bio: "At Ink Paradise Studio, we believe that every tattoo tells a story. Our team of award-winning artists brings over 50 years of combined experience to create stunning, personalized artwork that you'll cherish forever. We pride ourselves on maintaining the highest standards of safety, professionalism, and artistic excellence.",
    coverImage:
      "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1200",
    profileImage:
      "https://images.unsplash.com/photo-1559599238-308793637427?w=400",
    location: {
      address: "123 Art Street",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
    },
    phone: "(555) 123-4567",
    email: "info@inkparadise.com",
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    specialties: ["Traditional", "Realism", "Color", "Custom Design"],
    artistIds: ["1", "3"],
    artists: [
      {
        id: "1",
        name: "Sarah Chen",
        specialty: "Fine Line & Minimalist",
        profileImage:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
      {
        id: "3",
        name: "Yuki Tanaka",
        specialty: "Japanese & Watercolor",
        profileImage:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600",
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
    ],
    openHours: {
      monday: { open: "10:00 AM", close: "8:00 PM" },
      tuesday: { open: "10:00 AM", close: "8:00 PM" },
      wednesday: { open: "10:00 AM", close: "8:00 PM" },
      thursday: { open: "10:00 AM", close: "8:00 PM" },
      friday: { open: "10:00 AM", close: "10:00 PM" },
      saturday: { open: "12:00 PM", close: "10:00 PM" },
      sunday: { closed: true },
    },
    socialLinks: {
      instagram: "https://instagram.com/inkparadise",
      facebook: "https://facebook.com/inkparadise",
    },
    integrations: {
      googleBusiness: {
        profileUrl: "https://maps.google.com/?cid=12345",
        rating: 4.8,
        reviewCount: 312,
      },
      yelp: {
        profileUrl: "https://www.yelp.com/biz/ink-paradise-studio-los-angeles",
        rating: 4.5,
        reviewCount: 87,
      },
      booking: {
        platform: "Porter",
        bookingUrl: "https://porter.ink/inkparadise/book",
        label: "Book on Porter",
      },
    },
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2026-03-01"),
  },
  "2": {
    id: "2",
    name: "Steel & Ink Collective",
    description: "Bold traditional and neo-traditional tattoo studio",
    bio: "Steel & Ink Collective is where tradition meets innovation. We specialize in bold, timeless designs rooted in the history of American and Japanese tattooing. Our artists push boundaries while honoring the craft that came before. Walk-ins welcome, custom pieces our specialty.",
    coverImage:
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=1200",
    profileImage:
      "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400",
    location: {
      address: "456 Steel Avenue",
      city: "Chicago",
      state: "IL",
      zipCode: "60614",
      country: "USA",
    },
    phone: "(555) 987-6543",
    email: "hello@steelandink.com",
    rating: 4.7,
    reviewCount: 198,
    verified: true,
    specialties: [
      "Traditional",
      "Neo-Traditional",
      "Japanese",
      "Bold Color",
    ],
    artistIds: ["2"],
    artists: [
      {
        id: "2",
        name: "Mike Rodriguez",
        specialty: "Traditional & Neo-Trad",
        profileImage:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
      "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600",
    ],
    openHours: {
      monday: { open: "11:00 AM", close: "9:00 PM" },
      tuesday: { open: "11:00 AM", close: "9:00 PM" },
      wednesday: { open: "11:00 AM", close: "9:00 PM" },
      thursday: { open: "11:00 AM", close: "9:00 PM" },
      friday: { open: "11:00 AM", close: "11:00 PM" },
      saturday: { open: "10:00 AM", close: "11:00 PM" },
      sunday: { open: "12:00 PM", close: "6:00 PM" },
    },
    socialLinks: {
      instagram: "https://instagram.com/steelandink",
      website: "https://steelandink.com",
    },
    createdAt: new Date("2022-06-01"),
    updatedAt: new Date("2026-02-15"),
  },
};

export const mockStudioReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "sr1",
      authorId: "c10",
      authorName: "Rachel P.",
      targetId: "1",
      targetType: "studio",
      rating: 5,
      title: "Incredible studio",
      content:
        "The whole team at Ink Paradise is talented and professional. The studio is immaculately clean and the vibe is relaxed and welcoming.",
      verified: true,
      createdAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
    },
    {
      id: "sr2",
      authorId: "c11",
      authorName: "James D.",
      targetId: "1",
      targetType: "studio",
      rating: 5,
      title: "Best in LA",
      content:
        "Got my first tattoo here and couldn't have asked for a better experience. They walked me through everything and the result is gorgeous.",
      verified: true,
      createdAt: new Date("2026-02-20"),
      updatedAt: new Date("2026-02-20"),
    },
    {
      id: "sr3",
      authorId: "c12",
      authorName: "Sophie M.",
      targetId: "1",
      targetType: "studio",
      rating: 5,
      title: "Always consistent",
      content:
        "Fourth visit and every single time the quality has been exceptional. This is the only studio I trust.",
      verified: true,
      createdAt: new Date("2026-01-15"),
      updatedAt: new Date("2026-01-15"),
    },
  ],
  "2": [
    {
      id: "sr4",
      authorId: "c13",
      authorName: "Chris B.",
      targetId: "2",
      targetType: "studio",
      rating: 5,
      title: "Bold work, great vibes",
      content:
        "Steel & Ink is the real deal. Traditional tattoos done right with respect for the history of the craft. Mike and the crew are legends.",
      verified: true,
      createdAt: new Date("2026-03-08"),
      updatedAt: new Date("2026-03-08"),
    },
    {
      id: "sr5",
      authorId: "c14",
      authorName: "Dana K.",
      targetId: "2",
      targetType: "studio",
      rating: 4,
      title: "Worth the trip",
      content:
        "Drove two hours to get tattooed here and it was absolutely worth it. The attention to detail is unmatched.",
      verified: true,
      createdAt: new Date("2026-02-14"),
      updatedAt: new Date("2026-02-14"),
    },
    {
      id: "sr6",
      authorId: "c15",
      authorName: "Mark T.",
      targetId: "2",
      targetType: "studio",
      rating: 5,
      title: "Walk-in friendly",
      content:
        "Popped in for a walk-in and they fit me right in. No pretension, just great tattoos. Will be back for a bigger piece.",
      verified: true,
      createdAt: new Date("2026-01-30"),
      updatedAt: new Date("2026-01-30"),
    },
  ],
};

export function getStudio(id: string) {
  return mockStudios[id] ?? undefined;
}

export function getStudioReviews(id: string) {
  return mockStudioReviews[id] ?? [];
}
