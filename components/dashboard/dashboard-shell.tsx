"use client";

import * as React from "react";
import { DashboardLayout } from "./dashboard-layout";
import { OnboardingBanner } from "./onboarding-banner";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsBell } from "@/components/booking";
import { permanentMarker } from "@/lib/fonts";
import type { ChecklistItem } from "@/lib/types";

interface DashboardShellProps {
  eyebrowText: string;
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingProgress: number;
  /** Live checklist chips for the banner; incomplete ones are clickable via onOnboardingStepClick. */
  onboardingSteps?: ChecklistItem[];
  onOnboardingStepClick?: (id: string) => void;
  /** False while source data is still loading — keeps the banner from flashing stale progress. */
  onboardingReady?: boolean;
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  panels?: React.ReactNode;
}

export function DashboardShell({
  eyebrowText,
  onboardingTitle,
  onboardingSubtitle,
  onboardingProgress,
  onboardingSteps,
  onOnboardingStepClick,
  onboardingReady = true,
  leftColumn,
  rightColumn,
  panels,
}: DashboardShellProps) {
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow={{ text: eyebrowText, variant: "marker", color: "rust" }}
          headline={{
            variant: "mixed",
            size: "sm",
            words: [
              { text: "Your", font: "pirata" },
              { text: "Dashboard", font: "cook", color: "text-ink-rust dark:text-ink-red" },
            ],
          }}
        />
        <NotificationsBell />
      </div>

      {!bannerDismissed && onboardingReady ? (
        <OnboardingBanner
          title={onboardingTitle}
          subtitle={onboardingSubtitle}
          progress={onboardingProgress}
          steps={onboardingSteps}
          onStepClick={onOnboardingStepClick}
          onDismiss={() => setBannerDismissed(true)}
          className="mb-7"
        />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-7 items-start">
        <div className="space-y-5">{leftColumn}</div>
        <div>{rightColumn}</div>
      </div>

      {/* Watermark */}
      <div className="text-center mt-10 pt-4 border-t border-ink-black/[0.03] dark:border-ink-cream/[0.03]">
        <p className={`${permanentMarker.className} text-[11px] text-ink-black/[0.05] dark:text-ink-cream/[0.05]`}>
          tattoos or it didn&apos;t happen
        </p>
      </div>

      {panels}
    </DashboardLayout>
  );
}
