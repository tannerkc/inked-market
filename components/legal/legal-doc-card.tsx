import React from "react";
import { ContentCard } from "@/components/content";
import type { IconBoxColor } from "@/components/ui/icon-box";

interface LegalDocCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  accentColor?: IconBoxColor;
  lastUpdated?: string;
  version?: string;
  className?: string;
}

const LegalDocCard = React.forwardRef<HTMLAnchorElement, LegalDocCardProps>(
  (
    {
      title,
      subtitle,
      href,
      icon,
      accentColor = "rust",
      lastUpdated,
      version,
      className,
    },
    ref
  ) => {
    const metadata: { label: string; value: string }[] = [];
    if (lastUpdated) metadata.push({ label: "Updated", value: lastUpdated });
    if (version) metadata.push({ label: "v", value: version });

    return (
      <ContentCard
        ref={ref}
        title={title}
        subtitle={subtitle}
        href={href}
        icon={icon}
        accentColor={accentColor}
        metadata={metadata.length > 0 ? metadata : undefined}
        className={className}
      />
    );
  }
);
LegalDocCard.displayName = "LegalDocCard";

export { LegalDocCard };
