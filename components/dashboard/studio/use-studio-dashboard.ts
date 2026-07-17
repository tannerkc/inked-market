"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useStudio } from "@/lib/providers/studio-provider";
import { usePlanBilling } from "@/components/settings/use-plan-billing";
import { setStudioVisibility } from "@/app/dashboard/builder/actions";
import { startCheckout } from "@/app/billing/actions";
import {
  buildStudioChecklist,
  checklistProgress,
  missingRequiredSteps,
} from "@/lib/utils/studio-onboarding";
import type { StudioData } from "@/lib/repositories";
import type { DashboardData, TierSlug } from "@/lib/types";
import { useStudioForm } from "./hooks/use-studio-form";
import { useBusinessHours } from "./hooks/use-business-hours";
import { useArtistRoster } from "./hooks/use-artist-roster";
import { useStudioIntegrations } from "./hooks/use-studio-integrations";
import { useStudioServices } from "./hooks/use-studio-services";
import { useAutoSpecialties } from "./hooks/use-auto-specialties";
import { useStudioStats } from "./hooks/use-studio-stats";

function buildSubtitle(studio: StudioData | null): string {
  if (!studio?.city || !studio?.state) return "";
  const phoneSuffix = studio.phone ? ` · ${studio.phone}` : "";
  return `${studio.city}, ${studio.state}${phoneSuffix}`;
}

export function useStudioDashboard(oauthReturn: { platform: string; status: string } | null = null) {
  const { user } = useAuth();
  const { studio, update, applyLocal } = useStudio();

  const form = useStudioForm(studio, update);
  const hours = useBusinessHours(studio, update);
  const roster = useArtistRoster(studio);
  const integrations = useStudioIntegrations(studio, update, oauthReturn);
  const servicesHook = useStudioServices(studio, update);
  const autoSpec = useAutoSpecialties(studio, update, roster.roster, form.setStudioForm);
  const stats = useStudioStats(studio, roster.roster);

  // Share Listing quick action — copies the public page URL.
  const [shareCopied, setShareCopied] = useState(false);
  const handleShareListing = async () => {
    const target = studio?.slug ?? studio?.id;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/studios/${target}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — silently skip.
    }
  };

  // Single-shot sync from async repository load. Each sub-hook is initialized
  // lazily from a possibly-null studio; this fires exactly once when the data
  // arrives and broadcasts to every sub-hook that needs to rehydrate.
  const initialized = useRef(false);
  useEffect(() => {
    if (!studio || initialized.current) return;
    initialized.current = true;
    form.loadFromStudio(studio);
    hours.loadFromStudio(studio);
    servicesHook.loadFromStudio(studio);
    autoSpec.loadFromStudio(studio);
  }, [studio, form, hours, servicesHook, autoSpec]);

  // ── Go live: draft studios 404 publicly until the required steps are done
  // AND an active plan exists, then the owner flips the listing on. The
  // builder is never gated on this — build first, go live when ready.
  const { currentPlan } = usePlanBilling();
  const hasActivePlan = currentPlan !== null;
  const checklist = buildStudioChecklist(studio);
  const missingSteps = missingRequiredSteps(checklist);
  const live = studio?.isVisible === true;
  const published = Boolean(studio?.publishedThemeConfig);
  const stepsReady = studio !== null && missingSteps.length === 0;
  // The client gate is UX only — setStudioVisibility re-checks the tier
  // server-side, and the DB trigger blocks direct is_visible writes.
  const [goingLive, setGoingLive] = useState(false);
  const handleGoLive = async () => {
    if (live || !stepsReady || !hasActivePlan || goingLive) return;
    setGoingLive(true);
    try {
      const result = await setStudioVisibility(true);
      if (result.ok) applyLocal({ isVisible: true });
      else console.error("Go live failed:", result.error);
    } finally {
      setGoingLive(false);
    }
  };
  // Go-live paywall path: the strip's "Choose a Plan" opens the same dialog
  // the builder uses at Publish — paying goes live via the checkout return
  // route (intent=golive).
  const goLiveWithPlan = async (slug: TierSlug) => {
    if (live || !stepsReady || goingLive) return;
    setGoingLive(true);
    const result = await startCheckout({ tier: slug, cycle: "monthly", intent: "golive" });
    if (result.url) {
      window.location.assign(result.url);
      return; // keep the spinner while the browser navigates to Stripe
    }
    console.error("Go-live checkout failed:", result.error);
    setGoingLive(false);
  };

  const completedSteps = checklist.filter((item) => item.completed).length;
  const data: DashboardData = {
    name: studio?.name ?? "",
    subtitle: buildSubtitle(studio),
    tags: studio?.specialties ?? [],
    accentColor: "amber",
    stats,
    checklist,
    onboardingTitle: "Finish setting up your studio",
    onboardingSubtitle: live
      ? `${completedSteps} of ${checklist.length} complete — you're live; customize your page free anytime`
      : `${completedSteps} of ${checklist.length} complete — finish the essentials to go live, customize your page free anytime`,
  };

  return {
    data,
    onboardingProgress: checklistProgress(checklist),
    user,
    studio,
    live,
    published,
    canGoLive: !live && stepsReady && hasActivePlan,
    needsPlanForGoLive: !live && stepsReady && !hasActivePlan,
    missingSteps,
    goingLive,
    handleGoLive,
    goLiveWithPlan,
    shareCopied,
    handleShareListing,
    ...form,
    ...hours,
    ...roster,
    ...integrations,
    ...servicesHook,
    ...autoSpec,
  };
}
