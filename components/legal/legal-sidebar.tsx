"use client";

import { ContentSidebar } from "@/components/content";
import type { SidebarSection } from "@/components/content";

interface LegalSidebarProps {
  sections: SidebarSection[];
  accentColor?: "sage" | "rust";
  hubHref?: string;
  className?: string;
}

function LegalSidebar({
  sections,
  accentColor = "rust",
  hubHref = "/legal",
  className,
}: LegalSidebarProps) {
  return (
    <ContentSidebar
      sections={sections}
      accentColor={accentColor}
      hubHref={hubHref}
      hubLabel="Legal Hub"
      className={className}
    />
  );
}

export { LegalSidebar };
export type { SidebarSection };
