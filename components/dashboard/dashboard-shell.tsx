"use client";

import * as React from "react";
import { DashboardLayout } from "./dashboard-layout";
import { OnboardingBanner } from "./onboarding-banner";
import { PageHeader } from "@/components/ui/page-header";
import { useTheme } from "@/components/providers/theme-provider";
import { permanentMarker } from "@/lib/fonts";

interface DashboardShellProps {
  eyebrowText: string;
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingProgress: number;
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  panels?: React.ReactNode;
}

export function DashboardShell({
  eyebrowText,
  onboardingTitle,
  onboardingSubtitle,
  onboardingProgress,
  leftColumn,
  rightColumn,
  panels,
}: DashboardShellProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={{ text: eyebrowText, variant: "marker", color: "rust" }}
        headline={{
          variant: "mixed",
          size: "sm",
          words: [
            { text: "Your", font: "pirata" },
            { text: "Dashboard", font: "cook", color: isDark ? "text-ink-red" : "text-ink-rust" },
          ],
        }}
        className="mb-6"
      />

      {!bannerDismissed && (
        <OnboardingBanner
          title={onboardingTitle}
          subtitle={onboardingSubtitle}
          progress={onboardingProgress}
          onDismiss={() => setBannerDismissed(true)}
          className="mb-7"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-7 items-start">
        <div className="space-y-5">{leftColumn}</div>
        <div>{rightColumn}</div>
      </div>

      {/* Watermark */}
      <div className={`text-center mt-10 pt-4 border-t ${isDark ? "border-ink-cream/[0.03]" : "border-ink-black/[0.03]"}`}>
        <p className={`${permanentMarker.className} text-[11px] ${isDark ? "text-ink-cream/[0.05]" : "text-ink-black/[0.05]"}`}>
          tattoos or it didn&apos;t happen
        </p>
      </div>

      {panels}
    </DashboardLayout>
  );
}
