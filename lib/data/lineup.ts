import type {
  LineupIssue,
  LineupSpotlight,
  LineupArticle,
  LineupEvent,
  LineupProfile,
} from "@/lib/types/lineup";

// ─── Spotlights ───

export const allSpotlights: LineupSpotlight[] = [
  {
    slug: "maya-chen-watercolor-alchemist",
    type: "artist",
    name: "Maya Chen",
    tagline: "The Watercolor Alchemist",
    image:
      "https://images.unsplash.com/photo-1598371839696-ae3f4a550e72?w=800",
    location: "Portland, OR",
    specialties: ["Watercolor", "Fine Line", "Botanical"],
    badges: [
      { label: "Spotlight", color: "red" },
      { label: "Verified", color: "sage" },
    ],
    excerpt:
      "How a former marine biologist turned Portland's tattoo scene on its head with techniques borrowed from Japanese sumi-e painting.",
    content: {
      sections: [
        {
          title: "From Tide Pools to Tattoo Chairs",
          body: "Maya Chen spent six years studying marine biology at Oregon State before she picked up a tattoo machine. The transition wasn't as sudden as it sounds — her scientific illustrations of kelp forests and sea anemones had already caught the attention of Portland's art scene. 'I was drawing living things under a microscope,' she says. 'Now I draw living things on living things.'",
        },
        {
          title: "The Sumi-e Technique",
          body: "What sets Maya apart is her adaptation of Japanese sumi-e (ink wash) painting to skin. Traditional tattoo ink is applied in consistent, saturated layers. Maya dilutes hers, building translucent washes that bleed and bloom like real watercolor on paper. The effect is delicate, ethereal, and unlike anything else in the industry. 'Most tattoo artists fight the bleed,' she explains. 'I work with it.'",
        },
        {
          title: "Three-Month Wait, Zero Regrets",
          body: "Her waitlist currently sits at 14 weeks. She takes 3 clients per week, each getting a full-day session. No flash, no walk-ins, no compromises. Every piece is custom, starting with a 90-minute consultation where she studies how the client moves, how light hits their skin, and what botanical forms would complement their body's geometry.",
        },
      ],
      pullQuote:
        "Most tattoo artists fight the bleed. I work with it. The skin is alive — it wants to participate in the art.",
      portfolioImages: [
        "/tattoos/portfolio-placeholder-1.svg",
        "/tattoos/portfolio-placeholder-2.svg",
        "/tattoos/portfolio-placeholder-3.svg",
        "/tattoos/portfolio-placeholder-4.svg",
        "/tattoos/portfolio-placeholder-5.svg",
        "/tattoos/portfolio-placeholder-6.svg",
      ],
      profileLink: "/artists/1",
    },
  },
  {
    slug: "eternal-canvas-tradition-meets-innovation",
    type: "studio",
    name: "Eternal Canvas",
    tagline: "Where Tradition Meets Innovation",
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=800",
    location: "Chicago, IL",
    specialties: ["Traditional", "Neo-Traditional", "Japanese"],
    badges: [
      { label: "Featured Studio", color: "rust" },
      { label: "Verified", color: "sage" },
    ],
    excerpt:
      "Four artists, three decades of combined experience, and a philosophy that tradition isn't a constraint — it's a launchpad.",
    content: {
      sections: [
        {
          title: "Built on Flash, Evolved Beyond It",
          body: "Eternal Canvas opened in 2018 in Chicago's Wicker Park neighborhood. Founders Dani Reyes and Tomoko Sato met at a traditional flash convention and bonded over a shared frustration: shops were either rigidly old-school or chasing trends with no roots. They wanted both — deep respect for traditional craft with the freedom to push it forward.",
        },
        {
          title: "The Apprenticeship Model",
          body: "Every artist at Eternal Canvas went through a 2-year apprenticeship. No shortcuts, no Instagram fame bypassing the fundamentals. 'You learn to pull a clean line before you learn to break the rules,' says Reyes. The result is a team where every member can execute traditional American, Japanese, and neo-traditional work with equal confidence.",
        },
        {
          title: "Saturday Open Studio",
          body: "Every Saturday from 12-6, Eternal Canvas opens its doors for a community event. Local artists display work, clients browse flash walls, and there's usually a guest artist visiting from another city. It's become a neighborhood institution — the kind of place where regulars bring friends who've never been tattooed before and leave with their first piece.",
        },
      ],
      pullQuote:
        "You learn to pull a clean line before you learn to break the rules. Tradition isn't a cage — it's a foundation.",
      portfolioImages: [
        "/tattoos/portfolio-placeholder-1.svg",
        "/tattoos/portfolio-placeholder-2.svg",
        "/tattoos/portfolio-placeholder-3.svg",
        "/tattoos/portfolio-placeholder-4.svg",
      ],
      profileLink: "/studios/3",
    },
  },
  {
    slug: "marcus-rodriguez-photorealism-king",
    type: "artist",
    name: "Marcus Rodriguez",
    tagline: "The Photorealism King",
    image: "https://www.format.com/wp-content/uploads/Tattoo_ARtist-scaled.jpg",
    location: "Austin, TX",
    specialties: ["Realism", "Portrait", "Black & Grey"],
    badges: [{ label: "Spotlight", color: "red" }],
    excerpt:
      "Portraits that make people do a double-take. Marcus Rodriguez has spent a decade perfecting the art of putting real faces on skin.",
    content: {
      sections: [
        {
          title: "The Double-Take Effect",
          body: "Marcus Rodriguez's clients have a running joke: every portrait he does causes at least one stranger to ask if it's a photograph. He's been tattooing for 12 years, specializing exclusively in photorealistic portraits for the last 8. 'I don't do anything else,' he says. 'If you want a rose, I'll send you to someone who does better roses. But if you want a face that breathes, come to me.'",
        },
        {
          title: "Light Is Everything",
          body: "What separates Marcus from other realism artists is his obsessive attention to light sources. Before he starts a portrait, he studies how light falls across the reference photo — the direction, the temperature, the way shadows pool in eye sockets and under jawlines. Then he recreates that exact lighting in greyscale on skin, using a custom-mixed ink set of 14 grey values.",
        },
      ],
      pullQuote:
        "If you want a rose, I'll send you to someone who does better roses. But if you want a face that breathes, come to me.",
      portfolioImages: [
        "/tattoos/portfolio-placeholder-1.svg",
        "/tattoos/portfolio-placeholder-2.svg",
        "/tattoos/portfolio-placeholder-3.svg",
      ],
      profileLink: "/artists/2",
    },
  },
  {
    slug: "sacred-art-tattoo-brooklyn-institution",
    type: "studio",
    name: "Sacred Art Tattoo",
    tagline: "Brooklyn's Quiet Institution",
    image:
      "https://cdn.shopify.com/s/files/1/0566/0318/1110/files/Body2-1-1024x1024.png?v=1758733876",
    location: "New York, NY",
    specialties: ["Japanese", "Blackwork", "Tribal"],
    badges: [
      { label: "Featured Studio", color: "rust" },
      { label: "Verified", color: "sage" },
    ],
    excerpt:
      "Four artists, zero egos, and a Williamsburg space where Coltrane meets sandalwood. Sacred Art has been a Brooklyn fixture since 2018.",
    content: {
      sections: [
        {
          title: "The Sound and the Incense",
          body: "Walk into Sacred Art on a Tuesday afternoon and you'll hear Coltrane drifting through the space, smell sandalwood from the incense burning near the front desk, and see four artists working in focused silence. It's more meditation studio than tattoo shop — and that's exactly the point.",
        },
        {
          title: "Japanese Roots, Brooklyn Soul",
          body: "Owner Kenji Watanabe trained under a traditional tebori master in Osaka before moving to New York. He doesn't use the hand-poke method exclusively — his clients get machine work too — but the philosophy carries through: patience, precision, and respect for the body as a canvas with its own story.",
        },
      ],
      pullQuote:
        "The body already has a story. My job is to illustrate it, not overwrite it.",
      portfolioImages: [
        "/tattoos/portfolio-placeholder-1.svg",
        "/tattoos/portfolio-placeholder-2.svg",
        "/tattoos/portfolio-placeholder-3.svg",
        "/tattoos/portfolio-placeholder-4.svg",
      ],
      profileLink: "/studios/2",
    },
  },
  {
    slug: "yuki-tanaka-third-generation",
    type: "artist",
    name: "Yuki Tanaka",
    tagline: "Third Generation, First of Her Kind",
    image:
      "https://images.unsplash.com/photo-1475823678248-624fc6f85785?w=800",
    location: "Seattle, WA",
    specialties: ["Japanese", "Traditional", "Color"],
    badges: [
      { label: "Spotlight", color: "red" },
      { label: "Verified", color: "sage" },
    ],
    excerpt:
      "Third-generation Japanese tattoo tradition meets Pacific Northwest soul. Yuki Tanaka is rewriting what heritage means in modern tattooing.",
    content: {
      sections: [
        {
          title: "A Legacy Reimagined",
          body: "Yuki Tanaka's grandfather tattooed sailors in Yokohama. Her father ran a traditional studio in Osaka. She opened her own practice in Seattle's Capitol Hill, where she fuses three generations of Japanese technique with the moody, nature-saturated aesthetic of the Pacific Northwest. Her koi fish swim through Douglas fir forests. Her dragons perch on Cascadian peaks.",
        },
        {
          title: "Color That Lasts",
          body: "Yuki is known for color work that ages beautifully — a rarity in the industry. She uses a proprietary layering technique, building color in thin passes that settle into the skin gradually over 4-6 weeks. 'A tattoo should look better at year five than it did at week one,' she says.",
        },
      ],
      pullQuote:
        "A tattoo should look better at year five than it did at week one. That's the standard.",
      portfolioImages: [
        "/tattoos/portfolio-placeholder-1.svg",
        "/tattoos/portfolio-placeholder-2.svg",
        "/tattoos/portfolio-placeholder-3.svg",
      ],
      profileLink: "/artists/3",
    },
  },
];

// ─── Helper to get all spotlights across issues ───

export function getAllSpotlights(): LineupSpotlight[] {
  return allSpotlights;
}

export function getSpotlightBySlug(
  slug: string
): LineupSpotlight | undefined {
  return allSpotlights.find((s) => s.slug === slug);
}

// ─── Issues ───

export const lineupIssues: LineupIssue[] = [
  {
    id: "issue-007",
    number: 7,
    date: "2026-04-05",
    coverStory: allSpotlights[0]!, // Maya Chen
    news: [
      {
        slug: "blue-ceramic-tattoos",
        category: "Trending",
        headline: "The Rise of Blue Ceramic Tattoos",
        excerpt:
          "How Portuguese azulejo tile patterns became the most-requested style of 2026 — and the three artists leading the charge.",
        readTime: "5 min read",
        date: "2026-04-03",
      },
    ],
    onOurRadar: [
      {
        id: "3",
        type: "artist",
        name: "Yuki Tanaka",
        image:
          "https://images.unsplash.com/photo-1475823678248-624fc6f85785?w=800",
        location: "Seattle, WA",
        specialties: ["Japanese", "Traditional", "Color"],
        badges: [{ label: "Verified", color: "sage" }],
      },
      {
        id: "2",
        type: "artist",
        name: "Marcus Rodriguez",
        image:
          "https://www.format.com/wp-content/uploads/Tattoo_ARtist-scaled.jpg",
        location: "Austin, TX",
        specialties: ["Realism", "Portrait", "Black & Grey"],
        badges: [],
      },
    ],
    events: [
      {
        id: "evt-001",
        type: "flash",
        title: "Sacred Geometry — Spring Flash Day",
        details:
          "Walk-ins welcome · 12 artists · Pieces from $80 · Austin, TX",
        date: "2026-04-12",
        location: "Austin, TX",
        shopId: "2",
        ctaLabel: "Save Event",
      },
      {
        id: "evt-002",
        type: "guest-spot",
        title: "Yuki Tanaka Guest Spot at Ink Paradise",
        details:
          "One week only · Apr 18-24 · Japanese & Traditional · Book now",
        date: "2026-04-18",
        location: "Los Angeles, CA",
        artistId: "3",
        shopId: "1",
        ctaLabel: "Book Session",
      },
    ],
    studioOfTheWeek: allSpotlights[1]!, // Eternal Canvas
    editorsPicks: [
      {
        id: "4",
        type: "artist",
        name: "Alex Johnson",
        image:
          "https://images.squarespace-cdn.com/content/v1/54281bf0e4b05b9e44ad00f6/6854a9f2-7348-416b-b68b-0d77563aa3a3/GIANNA+pic.jpg",
        location: "Portland, OR",
        specialties: ["Geometric", "Dotwork"],
        badges: [{ label: "New", color: "red" }],
      },
      {
        id: "5",
        type: "artist",
        name: "Rina Okafor",
        image:
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400",
        location: "Atlanta, GA",
        specialties: ["Fine Line", "Minimalist"],
        badges: [{ label: "Rising", color: "rust" }],
      },
      {
        id: "6",
        type: "artist",
        name: "Diego Morales",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        location: "San Antonio, TX",
        specialties: ["Chicano", "Black & Grey"],
        badges: [],
      },
    ],
    cultureArticle: {
      slug: "appointment-only-model",
      category: "Industry",
      headline: "Why More Studios Are Going Appointment-Only",
      excerpt:
        "The walk-in model is fading. Here's what's replacing it — and why customers actually prefer it.",
      readTime: "6 min read",
      date: "2026-04-01",
    },
  },
  {
    id: "issue-006",
    number: 6,
    date: "2026-03-29",
    coverStory: allSpotlights[2]!, // Marcus Rodriguez
    news: [
      {
        slug: "tattoo-aftercare-2026",
        category: "Wellness",
        headline: "The New Science of Tattoo Aftercare",
        excerpt:
          "Forget petroleum jelly. Dermatologists and tattoo artists are finally agreeing on what actually helps ink heal better.",
        readTime: "4 min read",
        date: "2026-03-27",
      },
      {
        slug: "instagram-vs-portfolio",
        category: "Business",
        headline: "Instagram Is Dying for Tattoo Artists. What's Next?",
        excerpt:
          "Algorithm changes have slashed reach by 60%. How artists are building audiences without the grid.",
        readTime: "7 min read",
        date: "2026-03-25",
      },
    ],
    onOurRadar: [
      {
        id: "1",
        type: "artist",
        name: "John Ham",
        image:
          "https://choose901.com/wp-content/uploads/2019/09/jordan-epperson-working-carrie-pinkley-e1569450400343.jpg",
        location: "Los Angeles, CA",
        specialties: ["Fine Line", "Minimalist", "Floral"],
        badges: [
          { label: "Booking Open", color: "sage" },
          { label: "Verified", color: "sage" },
        ],
      },
      {
        id: "7",
        type: "studio",
        name: "Ink Paradise Studio",
        image:
          "https://www.glam.com/img/gallery/everything-you-need-to-know-about-becoming-a-tattoo-artist/l-intro-1685624990.jpg",
        location: "Los Angeles, CA",
        specialties: ["Traditional", "Realism", "Color"],
        badges: [{ label: "Walk-ins", color: "rust" }],
      },
    ],
    events: [
      {
        id: "evt-003",
        type: "opening",
        title: "Eternal Canvas — 8th Anniversary Show",
        details:
          "Art show + live tattooing · Free entry · Chicago, IL",
        date: "2026-04-05",
        location: "Chicago, IL",
        shopId: "3",
        ctaLabel: "RSVP",
      },
    ],
    studioOfTheWeek: allSpotlights[3]!, // Sacred Art Tattoo
    editorsPicks: [
      {
        id: "8",
        type: "artist",
        name: "Lena Vasquez",
        image:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
        location: "Denver, CO",
        specialties: ["Watercolor", "Abstract"],
        badges: [{ label: "Rising", color: "rust" }],
      },
      {
        id: "9",
        type: "artist",
        name: "Kai Nishimura",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        location: "San Francisco, CA",
        specialties: ["Geometric", "Blackwork"],
        badges: [{ label: "New", color: "red" }],
      },
      {
        id: "10",
        type: "artist",
        name: "Priya Sharma",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        location: "Brooklyn, NY",
        specialties: ["Fine Line", "Ornamental"],
        badges: [{ label: "Verified", color: "sage" }],
      },
    ],
    cultureArticle: {
      slug: "tattoo-pricing-transparency",
      category: "Culture",
      headline: "The Case for Transparent Tattoo Pricing",
      excerpt:
        "Why more artists are publishing their rates — and how it's changing the client-artist relationship for the better.",
      readTime: "5 min read",
      date: "2026-03-26",
    },
  },
];

// ─── Helpers ───

export function getCurrentIssue(): LineupIssue {
  return lineupIssues[0]!;
}

export function getIssueById(id: string): LineupIssue | undefined {
  return lineupIssues.find((i) => i.id === id);
}

export function getAllEvents(): LineupEvent[] {
  return lineupIssues.flatMap((issue) => issue.events);
}
