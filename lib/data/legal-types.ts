import type { ReactNode } from "react";

export interface LegalSectionData {
  id: string;
  number: string;
  title: string;
  personalityIntro: string;
  content: ReactNode;
}

export interface LegalDocument {
  slug: "privacy" | "terms";
  title: string;
  headline: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  accentColor: "sage" | "rust";
  sections: LegalSectionData[];
}
