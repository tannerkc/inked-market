import { ContentSection } from "@/components/content";
import type { ContentSectionProps } from "@/components/content";

type LegalSectionProps = Omit<ContentSectionProps, "accentColor"> & {
  accentColor?: "sage" | "rust";
};

const LegalSection = ContentSection;

export { LegalSection };
export type { LegalSectionProps };
