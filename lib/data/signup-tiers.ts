export interface SignupTierFeature {
  text: string;
  included: boolean;
}

export interface SignupTierData {
  name: string;
  price: number;
  annualPrice?: number;
  description: string;
  features: SignupTierFeature[];
  badge?: string;
  badgeColor?: "red" | "rust" | "sage";
  freeBadge?: boolean;
}

export const artistTiers: SignupTierData[] = [
  {
    name: "Free",
    price: 0,
    description: "Manage your profile and gallery on your studio\u2019s page.",
    features: [
      { text: "Profile & gallery management", included: true },
      { text: "Gallery on studio page", included: true },
      { text: "Independent listing on Discover", included: false },
      { text: "Own artist profile page", included: false },
    ],
    freeBadge: true,
  },
  {
    name: "Pro",
    price: 14.85,
    annualPrice: 11.85,
    description: "Go independent. Get discovered on your own terms \u2014 no studio required.",
    features: [
      { text: "Profile & gallery management", included: true },
      { text: "Gallery on studio page", included: true },
      { text: "Public listing on Discover", included: true },
      { text: "Independent artist profile", included: true },
      { text: "No studio required", included: true },
    ],
    badge: "Popular",
    badgeColor: "red",
  },
];

export const studioTiers: SignupTierData[] = [
  {
    name: "Basic",
    price: 19.85,
    annualPrice: 15.85,
    description: "A professional listing on the Inked Market marketplace.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: false },
      { text: "Premium templates", included: false },
    ],
  },
  {
    name: "Pro",
    price: 59.85,
    annualPrice: 47.85,
    description: "Custom web page with full branding control.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: true },
      { text: "Customize colors, fonts & content", included: true },
      { text: "Premium templates", included: false },
    ],
    badge: "Popular",
    badgeColor: "rust",
  },
  {
    name: "Studio",
    price: 79.85,
    annualPrice: 63.85,
    description: "Everything in Pro plus premium templates and priority search placement.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Rearrange layout sections", included: true },
      { text: "Exclusive premium templates", included: true },
      { text: "Priority search placement", included: true },
    ],
  },
];
