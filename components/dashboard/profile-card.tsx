"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";

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
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`rounded-[20px] p-6 border ${isDark ? "bg-ink-cream/[0.03] border-ink-cream/[0.06]" : "bg-ink-black/[0.02] border-ink-black/[0.06]"}`}>
      <div className="text-center mb-4">
        <div className={`w-20 h-20 ${avatarShape === "circle" ? "rounded-full" : "rounded-2xl"} border-[1.5px] border-dashed mx-auto mb-3 flex items-center justify-center cursor-pointer transition-all hover:border-solid ${isDark ? "border-ink-cream/[0.15]" : "border-ink-black/[0.15]"}`}>
          <span className={`text-[28px] ${isDark ? "text-ink-cream/15" : "text-ink-black/15"}`}>+</span>
        </div>
        <h2 className={`text-lg font-semibold ${isDark ? "text-ink-cream" : "text-ink-black"}`}>{name}</h2>
        {subtitle && <p className={`text-[11px] mt-1 ${isDark ? "text-ink-cream/40" : "text-ink-black/40"}`}>{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {tags.map((tag) => (
          <span key={tag} className={`font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full border ${isDark ? "border-ink-red/20 text-ink-red/60" : "border-ink-rust/20 text-ink-rust/60"}`}>
            {tag}
          </span>
        ))}
      </div>
      <button onClick={onEdit} className={`w-full py-2.5 rounded-full font-mono text-[9px] tracking-[0.15em] uppercase cursor-pointer transition-colors border ${isDark ? "bg-ink-cream/[0.06] border-ink-cream/[0.08] text-ink-cream/50 hover:bg-ink-cream/[0.1]" : "bg-ink-black/[0.04] border-ink-black/[0.08] text-ink-black/50 hover:bg-ink-black/[0.08]"}`}>
        {editLabel}
      </button>
    </div>
  );
}
