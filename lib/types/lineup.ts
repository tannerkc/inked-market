import type { Badge } from "@/lib/data/discover";

// ─── Spotlight (Cover Story / Studio of the Week / Feature Articles) ───

export interface SpotlightContent {
  sections: {
    title: string;
    body: string;
  }[];
  pullQuote?: string;
  portfolioImages: string[];
  profileLink: string;
}

export interface LineupSpotlight {
  slug: string;
  type: "artist" | "studio";
  name: string;
  tagline: string;
  image: string;
  location: string;
  specialties: string[];
  badges: Badge[];
  excerpt: string;
  content: SpotlightContent;
}

// ─── News Articles (Display-only in v1) ───

export interface LineupArticle {
  slug: string;
  category: string;
  headline: string;
  excerpt: string;
  readTime: string;
  date: string;
}

// ─── Events / Blasts ───

export type LineupEventType = "flash" | "guest-spot" | "sale" | "opening";

export interface LineupEvent {
  id: string;
  type: LineupEventType;
  title: string;
  details: string;
  date: string;
  location: string;
  shopId?: string;
  artistId?: string;
  ctaLabel: string;
}

// ─── Quick Profiles (On Our Radar / Editor's Picks) ───

export interface LineupProfile {
  id: string;
  type: "artist" | "studio";
  name: string;
  image: string;
  location: string;
  specialties: string[];
  badges: Badge[];
}

// ─── Weekly Issue ───

export interface LineupIssue {
  id: string;
  number: number;
  date: string;
  coverStory: LineupSpotlight;
  news: LineupArticle[];
  onOurRadar: LineupProfile[];
  events: LineupEvent[];
  studioOfTheWeek: LineupSpotlight;
  editorsPicks: LineupProfile[];
  cultureArticle: LineupArticle;
}
