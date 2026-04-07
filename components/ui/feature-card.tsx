import React from "react";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/icon-box";
import type { IconBoxColor } from "@/components/ui/icon-box";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: IconBoxColor;
  tags?: string[];
  className?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, accentColor = "red", tags, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative p-7 rounded-2xl border border-ink-cream/[0.06] bg-ink-cream/[0.03] hover:border-ink-cream/[0.12] transition-all duration-500",
        className
      )}
    >
      <div className="relative">
        <IconBox color={accentColor} className="mb-5">
          {icon}
        </IconBox>
        <h3 className="text-xl font-bold text-ink-cream mb-3">{title}</h3>
        <p className="text-ink-cream/35 leading-relaxed">{description}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border border-ink-cream/[0.08] bg-ink-cream/[0.03] text-ink-cream/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
);
FeatureCard.displayName = "FeatureCard";

export { FeatureCard };
