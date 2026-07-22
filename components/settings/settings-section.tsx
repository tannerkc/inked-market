import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsSection = React.forwardRef<HTMLDivElement, SettingsSectionProps>(
  ({ title, description, children, className }, ref) => (
    <div ref={ref} className={cn("w-full", className)}>
      <h2 className="text-[16px] font-semibold mb-1 text-ink-black/80 dark:text-ink-cream/80">
        {title}
      </h2>
      <p className="text-[11px] mb-6 text-ink-black/35 dark:text-ink-cream/35">
        {description}
      </p>
      {children}
    </div>
  )
);
SettingsSection.displayName = "SettingsSection";

export { SettingsSection };
