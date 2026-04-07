"use client";

import { useRouter } from "next/navigation";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";

export function StudioPageCard() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <DashboardSection title="Your Studio Page">
      <div className={`relative rounded-[20px] border-2 overflow-hidden ${isDark ? "border-ink-red/[0.15] bg-ink-cream/[0.02]" : "border-ink-rust/20 bg-ink-black/[0.02]"}`}>
        {/* Draft badge */}
        <span className={`absolute top-4 right-4 font-mono text-[8px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border ${isDark ? "bg-ink-red/[0.08] text-ink-red border-ink-red/[0.15]" : "bg-ink-rust/[0.08] text-ink-rust border-ink-rust/[0.15]"}`}>
          Draft
        </span>
        <div className="p-7 flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${isDark ? "bg-ink-red/[0.06] border-ink-red/[0.1]" : "bg-ink-rust/[0.06] border-ink-rust/[0.1]"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={isDark ? "text-ink-red" : "text-ink-rust"}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <h3 className={`text-[17px] font-semibold mb-1.5 ${isDark ? "text-ink-cream" : "text-ink-black"}`}>Your Studio Page</h3>
          <p className={`text-[13px] max-w-[400px] ${isDark ? "text-ink-cream/40" : "text-ink-black/40"}`}>
            Preview and customize your public listing before going live.
          </p>
          <div className={`w-full my-5 flex items-center gap-3 ${isDark ? "text-ink-cream/20" : "text-ink-black/20"}`}>
            <div className={`flex-1 h-px ${isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]"}`} />
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase whitespace-nowrap">
              Templates on Shader &amp; Magnum · Premium on Magnum
            </span>
            <div className={`flex-1 h-px ${isDark ? "bg-ink-cream/[0.06]" : "bg-ink-black/[0.06]"}`} />
          </div>
          <Button variant="ink" size="lg" statusDot className="w-full sm:w-auto sm:min-w-[320px]" onClick={() => router.push("/dashboard/builder")}>
            Customize Your Studio Page
          </Button>
          <p className={`text-[10px] mt-2.5 ${isDark ? "text-ink-cream/20" : "text-ink-black/20"}`}>
            Free to build · Publish when you&apos;re ready
          </p>
        </div>
      </div>
    </DashboardSection>
  );
}
