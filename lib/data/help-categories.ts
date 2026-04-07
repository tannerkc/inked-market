import type { HelpCategory } from "@/lib/data/help-types";

export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description:
      "Create your account, explore the platform, and find your first artist or set up your studio",
    icon: "rocket",
    accentColor: "sage",
    audiences: ["customer", "artist", "studio-owner"],
    articleCount: 8,
    formats: ["guide", "faq"],
  },
  {
    slug: "for-artists",
    title: "For Artists",
    description:
      "Portfolio management, style tagging, booking setup, and growing your client base on the platform",
    icon: "pen-tool",
    accentColor: "red",
    audiences: ["artist"],
    articleCount: 14,
    formats: ["guide", "faq", "docs"],
  },
  {
    slug: "for-studio-owners",
    title: "For Studio Owners",
    description:
      "Claim your studio, manage your team, website builder, embeddable widgets, and analytics",
    icon: "storefront",
    accentColor: "rust",
    audiences: ["studio-owner"],
    articleCount: 16,
    formats: ["guide", "faq", "docs"],
  },
  {
    slug: "discovery-and-booking",
    title: "Discovery & Booking",
    description:
      "Search tips, comparing artists and styles, the booking flow, and what to expect at your appointment",
    icon: "search",
    accentColor: "sage",
    audiences: ["customer"],
    articleCount: 10,
    formats: ["guide", "faq"],
  },
  {
    slug: "trust-and-safety",
    title: "Trust & Safety",
    description:
      "How verification works, review guidelines, reporting concerns, and keeping the community safe",
    icon: "shield",
    accentColor: "red",
    audiences: ["customer", "artist", "studio-owner"],
    articleCount: 7,
    formats: ["guide", "faq"],
  },
  {
    slug: "account-and-settings",
    title: "Account & Settings",
    description:
      "Profile management, notification preferences, privacy controls, and account security",
    icon: "settings",
    accentColor: "rust",
    audiences: ["customer", "artist", "studio-owner"],
    articleCount: 9,
    formats: ["faq"],
  },
];

export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return helpCategories.find((c) => c.slug === slug);
}

export function getCategoriesByAudience(
  audience: string
): HelpCategory[] {
  if (audience === "all") return helpCategories;
  return helpCategories.filter((c) =>
    c.audiences.includes(audience as HelpCategory["audiences"][number])
  );
}
