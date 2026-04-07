import type { Artist, Review } from "@/lib/types";

export const mockArtists: Record<string, Artist & { studioName?: string }> = {
  "1": {
    id: "1",
    name: "Sarah Chen",
    bio: "Award-winning tattoo artist specializing in fine line and minimalist designs. With over 10 years of experience, I transform ideas into timeless art. My passion is creating delicate, meaningful pieces that resonate with each client's unique story. I believe in the power of simplicity and precision to create lasting beauty.",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    coverImage:
      "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1200",
    studioId: "1",
    studioName: "Ink Paradise Studio",
    specialties: ["Fine Line", "Minimalist", "Floral", "Geometric"],
    styles: ["minimalist", "fine-line", "geometric"],
    portfolioImages: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
        title: "Floral Sleeve",
        tags: ["floral", "fine-line"],
        uploadedAt: new Date("2026-01-15"),
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600",
        title: "Minimalist Design",
        tags: ["minimalist", "geometric"],
        uploadedAt: new Date("2026-01-10"),
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600",
        title: "Custom Work",
        tags: ["custom"],
        uploadedAt: new Date("2025-12-20"),
      },
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
        title: "Line Work",
        tags: ["fine-line"],
        uploadedAt: new Date("2025-12-05"),
      },
      {
        id: "5",
        url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
        title: "Botanical Art",
        tags: ["floral", "minimalist"],
        uploadedAt: new Date("2025-11-18"),
      },
      {
        id: "6",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
        title: "Abstract Piece",
        tags: ["abstract", "geometric"],
        uploadedAt: new Date("2025-11-01"),
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/sarahchen.ink",
      website: "https://sarahchen.ink",
    },
    rating: 4.9,
    reviewCount: 156,
    verified: true,
    yearsOfExperience: 10,
    certifications: [
      "Bloodborne Pathogens Certified",
      "First Aid & CPR Certified",
      "Advanced Safety Training",
    ],
    location: {
      city: "Los Angeles",
      state: "CA",
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2026-03-01"),
  } as Artist & { studioName?: string; location?: { city: string; state: string } },
  "2": {
    id: "2",
    name: "Mike Rodriguez",
    bio: "Bold lines, vivid color, timeless designs. I draw from the masters of traditional American and Japanese tattooing while pushing the boundaries of what's possible with modern technique. Every piece is built to last and designed to make a statement.",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    coverImage:
      "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=1200",
    studioId: "2",
    studioName: "Steel & Ink Collective",
    specialties: ["Traditional", "Neo-Traditional", "Japanese", "Color Work"],
    styles: ["traditional", "neo-traditional", "japanese"],
    portfolioImages: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600",
        title: "Eagle Chest Piece",
        tags: ["traditional", "color"],
        uploadedAt: new Date("2026-02-10"),
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
        title: "Koi Sleeve",
        tags: ["japanese"],
        uploadedAt: new Date("2026-01-25"),
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
        title: "Rose & Dagger",
        tags: ["neo-traditional"],
        uploadedAt: new Date("2026-01-08"),
      },
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
        title: "Dragon Back",
        tags: ["japanese", "color"],
        uploadedAt: new Date("2025-12-15"),
      },
      {
        id: "5",
        url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600",
        title: "Panther",
        tags: ["traditional"],
        uploadedAt: new Date("2025-12-01"),
      },
      {
        id: "6",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
        title: "Ship & Storm",
        tags: ["neo-traditional"],
        uploadedAt: new Date("2025-11-20"),
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/mikerodriguez.tattoo",
    },
    rating: 4.8,
    reviewCount: 243,
    verified: true,
    yearsOfExperience: 15,
    certifications: [
      "Bloodborne Pathogens Certified",
      "First Aid & CPR Certified",
      "Advanced Safety Training",
    ],
    location: {
      city: "Chicago",
      state: "IL",
    },
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2026-02-15"),
  } as Artist & { studioName?: string; location?: { city: string; state: string } },
  "3": {
    id: "3",
    name: "Yuki Tanaka",
    bio: "Blending Eastern and Western aesthetics, I create tattoos that are both culturally rich and deeply personal. My work draws from ukiyo-e woodblock prints, botanical illustration, and contemporary graphic design. Each piece is a collaboration — your story, my craft.",
    profileImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800",
    coverImage:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200",
    studioId: "1",
    studioName: "Ink Paradise Studio",
    specialties: ["Japanese", "Watercolor", "Botanical", "Fine Line"],
    styles: ["japanese", "watercolor", "fine-line"],
    portfolioImages: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
        title: "Crane & Cherry Blossom",
        tags: ["japanese", "botanical"],
        uploadedAt: new Date("2026-03-01"),
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
        title: "Watercolor Peony",
        tags: ["watercolor", "botanical"],
        uploadedAt: new Date("2026-02-14"),
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
        title: "Wave Study",
        tags: ["japanese"],
        uploadedAt: new Date("2026-01-28"),
      },
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600",
        title: "Botanical Sleeve",
        tags: ["botanical", "fine-line"],
        uploadedAt: new Date("2026-01-10"),
      },
      {
        id: "5",
        url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600",
        title: "Koi Composition",
        tags: ["japanese", "watercolor"],
        uploadedAt: new Date("2025-12-22"),
      },
      {
        id: "6",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
        title: "Bamboo & Sparrow",
        tags: ["japanese", "fine-line"],
        uploadedAt: new Date("2025-12-05"),
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/yukitanaka.ink",
      website: "https://yukitanaka.art",
    },
    rating: 4.95,
    reviewCount: 89,
    verified: true,
    yearsOfExperience: 8,
    certifications: [
      "Bloodborne Pathogens Certified",
      "First Aid & CPR Certified",
    ],
    location: {
      city: "Los Angeles",
      state: "CA",
    },
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2026-03-15"),
  } as Artist & { studioName?: string; location?: { city: string; state: string } },
};

export const mockReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      authorId: "c1",
      authorName: "Jessica M.",
      targetId: "1",
      targetType: "artist",
      rating: 5,
      title: "Incredible work",
      content:
        "Sarah created the most beautiful floral sleeve for me. Her attention to detail is incredible and she made me feel so comfortable throughout the entire process.",
      verified: true,
      createdAt: new Date("2026-03-10"),
      updatedAt: new Date("2026-03-10"),
    },
    {
      id: "r2",
      authorId: "c2",
      authorName: "Alex K.",
      targetId: "1",
      targetType: "artist",
      rating: 5,
      title: "Perfect execution",
      content:
        "Exactly what I envisioned. Clean lines, perfect placement. She really listens to what you want.",
      verified: true,
      createdAt: new Date("2026-02-18"),
      updatedAt: new Date("2026-02-18"),
    },
    {
      id: "r3",
      authorId: "c3",
      authorName: "Maria L.",
      targetId: "1",
      targetType: "artist",
      rating: 5,
      title: "Always perfect",
      content:
        "Third tattoo with Sarah and every single one has been perfection. Steady hand, amazing artistic vision.",
      verified: true,
      createdAt: new Date("2026-01-22"),
      updatedAt: new Date("2026-01-22"),
    },
  ],
  "2": [
    {
      id: "r4",
      authorId: "c4",
      authorName: "Derek T.",
      targetId: "2",
      targetType: "artist",
      rating: 5,
      title: "True master",
      content:
        "Mike did an incredible full back piece for me over 6 sessions. His bold line work and color saturation is unmatched. True master of traditional.",
      verified: true,
      createdAt: new Date("2026-03-05"),
      updatedAt: new Date("2026-03-05"),
    },
    {
      id: "r5",
      authorId: "c5",
      authorName: "Sam W.",
      targetId: "2",
      targetType: "artist",
      rating: 5,
      title: "Best in Chicago",
      content: "Best neo-trad artist in Chicago, hands down.",
      verified: true,
      createdAt: new Date("2026-02-12"),
      updatedAt: new Date("2026-02-12"),
    },
  ],
  "3": [
    {
      id: "r6",
      authorId: "c6",
      authorName: "Leah P.",
      targetId: "3",
      targetType: "artist",
      rating: 5,
      title: "Breathtaking",
      content:
        "Yuki's watercolor work is breathtaking. The colors are vivid and the composition flows perfectly with my body. Highly recommend.",
      verified: true,
      createdAt: new Date("2026-03-20"),
      updatedAt: new Date("2026-03-20"),
    },
    {
      id: "r7",
      authorId: "c7",
      authorName: "Tom H.",
      targetId: "3",
      targetType: "artist",
      rating: 5,
      title: "Cultural depth",
      content:
        "Yuki brought an incredible level of cultural depth to my Japanese sleeve. Every element has meaning and the execution is flawless.",
      verified: true,
      createdAt: new Date("2026-02-28"),
      updatedAt: new Date("2026-02-28"),
    },
    {
      id: "r8",
      authorId: "c8",
      authorName: "Nina R.",
      targetId: "3",
      targetType: "artist",
      rating: 5,
      title: "Stunning botanical",
      content:
        "Got a botanical piece from Yuki and it's absolutely stunning. The fine line detail is impeccable.",
      verified: true,
      createdAt: new Date("2026-01-15"),
      updatedAt: new Date("2026-01-15"),
    },
  ],
};

export function getArtist(id: string) {
  return mockArtists[id] ?? mockArtists["1"];
}

export function getArtistReviews(id: string) {
  return mockReviews[id] ?? mockReviews["1"];
}
