"use client";

import type { PolicyConfig, PoliciesPageLayout } from "@/lib/types/policies";
import { PoliciesTabsLayout } from "@/components/policies/policies-tabs-layout";
import { PoliciesSidebarLayout } from "@/components/policies/policies-sidebar-layout";

interface PoliciesPageClientProps {
  policies: PolicyConfig[];
  layout: PoliciesPageLayout;
}

export function PoliciesPageClient({
  policies,
  layout,
}: PoliciesPageClientProps) {
  if (layout === "sidebar") {
    return <PoliciesSidebarLayout policies={policies} />;
  }
  return <PoliciesTabsLayout policies={policies} />;
}

PoliciesPageClient.displayName = "PoliciesPageClient";
