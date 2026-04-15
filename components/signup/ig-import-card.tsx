"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IgImportCardProps {
  onConnect?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function IgImportCard({ onConnect, onSkip, className }: IgImportCardProps) {
  return (
    <div className={cn("rounded-[18px] border border-ink-black/[0.05] bg-white p-[22px] text-center", className)}>
      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center mx-auto mb-3.5 shadow-[0_4px_16px_rgba(253,29,29,0.2)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
        </svg>
      </div>
      <h4 className="text-[15px] font-semibold text-ink-black mb-1">Import from Instagram</h4>
      <p className="text-xs text-ink-black/30 mb-4 leading-relaxed">
        Connect your IG to instantly populate your portfolio with your best work.
      </p>
      <button
        type="button"
        onClick={onConnect}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink-black text-ink-cream font-mono text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-ink-black/90 transition-colors"
      >
        <span className="w-[5px] h-[5px] rounded-full bg-ink-red shadow-[0_0_6px_color-mix(in_srgb,var(--ink-red)_40%,transparent)]" />
        Connect Instagram
      </button>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="block w-full text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-black/20 hover:text-ink-black/40 transition-colors cursor-pointer mt-3"
        >
          Skip for now &rarr;
        </button>
      )}
    </div>
  );
}
