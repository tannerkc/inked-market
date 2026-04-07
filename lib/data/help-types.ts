import type { ReactNode } from "react";
import type { IconBoxColor } from "@/components/ui/icon-box";

export type HelpAudience = "customer" | "artist" | "studio-owner";

export type HelpContentFormat = "guide" | "faq" | "docs";

export interface HelpFaqItem {
  id: string;
  question: string;
  answer: ReactNode;
  audiences: HelpAudience[];
}

export interface HelpSectionData {
  id: string;
  number: string;
  title: string;
  personalityIntro?: string;
  content: ReactNode;
}

export interface HelpCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  accentColor: IconBoxColor;
  audiences: HelpAudience[];
  articleCount: number;
  formats: HelpContentFormat[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  headline: string;
  subtitle: string;
  format: HelpContentFormat;
  audiences: HelpAudience[];
  categorySlug: string;
  accentColor: IconBoxColor;
  sections?: HelpSectionData[];
  faqItems?: HelpFaqItem[];
  tags: string[];
  popularOrder?: number;
}

export interface HelpSearchSuggestion {
  title: string;
  href: string;
  audience: HelpAudience;
  format: HelpContentFormat;
}
