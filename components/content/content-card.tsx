import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/icon-box";
import type { IconBoxColor } from "@/components/ui/icon-box";

interface ContentCardMetadata {
  label: string;
  value: string;
}

interface ContentCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  accentColor?: IconBoxColor;
  variant?: "light" | "dark";
  metadata?: ContentCardMetadata[];
  className?: string;
}

const ContentCard = React.forwardRef<HTMLAnchorElement, ContentCardProps>(
  (
    { title, subtitle, href, icon, accentColor = "rust", variant = "dark", metadata, className },
    ref
  ) => {
    const isDark = variant === "dark";

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "group relative block p-7 rounded-2xl border transition-all duration-500",
          isDark
            ? "border-ink-cream/[0.06] bg-ink-cream/[0.03] hover:border-ink-cream/[0.12]"
            : "border-ink-black/[0.06] bg-ink-black/[0.03] hover:border-ink-black/[0.12]",
          className
        )}
      >
        <IconBox color={accentColor} className="mb-5">
          {icon}
        </IconBox>
        <h2 className={cn(
          "text-xl font-bold mb-2 transition-colors",
          isDark
            ? "text-ink-cream group-hover:text-ink-cream/90"
            : "text-ink-black group-hover:text-ink-black/90"
        )}>
          {title}
        </h2>
        <p className={cn(
          "leading-relaxed text-sm",
          isDark ? "text-ink-cream/35" : "text-ink-black/35"
        )}>
          {subtitle}
        </p>

        {metadata && metadata.length > 0 && (
          <div className={cn(
            "flex items-center gap-3 mt-5 pt-4 border-t",
            isDark ? "border-ink-cream/[0.04]" : "border-ink-black/[0.04]"
          )}>
            {metadata.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <span className={isDark ? "text-ink-cream/10" : "text-ink-black/10"}>&middot;</span>}
                <span className={cn(
                  "font-mono text-[9px] tracking-[0.15em] uppercase",
                  isDark ? "text-ink-cream/20" : "text-ink-black/20"
                )}>
                  {item.label} {item.value}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className={cn(
          "absolute top-7 right-7 transition-colors",
          isDark
            ? "text-ink-cream/15 group-hover:text-ink-cream/30"
            : "text-ink-black/15 group-hover:text-ink-black/30"
        )}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M7 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Link>
    );
  }
);
ContentCard.displayName = "ContentCard";

export { ContentCard };
export type { ContentCardProps, ContentCardMetadata };
