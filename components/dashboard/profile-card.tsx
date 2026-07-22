import * as React from "react";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";

interface ProfileCardProps {
  name: string;
  subtitle?: string;
  tags: string[];
  avatarShape?: "circle" | "rounded";
  editLabel?: string;
  onEdit?: () => void;
}

export function ProfileCard({
  name,
  subtitle,
  tags,
  avatarShape = "circle",
  editLabel = "Edit Profile",
  onEdit,
}: ProfileCardProps) {
  return (
    <div className="rounded-[20px] p-6 border bg-ink-black/[0.02] border-ink-black/[0.06] dark:bg-ink-cream/[0.03] dark:border-ink-cream/[0.06]">
      <div className="text-center mb-4">
        <div className={`w-20 h-20 ${avatarShape === "circle" ? "rounded-full" : "rounded-2xl"} border-[1.5px] border-dashed mx-auto mb-3 flex items-center justify-center cursor-pointer transition-all hover:border-solid border-ink-black/[0.15] dark:border-ink-cream/[0.15]`}>
          <span className="text-[28px] text-ink-black/15 dark:text-ink-cream/15">+</span>
        </div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-ink-cream">{name}</h2>
        {subtitle && <p className="text-[11px] mt-1 text-ink-black/60 dark:text-ink-cream/60">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {tags.map((tag) => (
          <StatusBadge key={tag} label={tag} color={BADGE_COLORS.tag} className="px-2.5" />
        ))}
      </div>
      <button onClick={onEdit} className="w-full py-2.5 rounded-full font-mono text-[9px] tracking-[0.15em] uppercase cursor-pointer transition-colors border bg-ink-black/[0.04] border-ink-black/[0.08] text-ink-black/50 hover:bg-ink-black/[0.08] dark:bg-ink-cream/[0.06] dark:border-ink-cream/[0.08] dark:text-ink-cream/50 dark:hover:bg-ink-cream/[0.1]">
        {editLabel}
      </button>
    </div>
  );
}
