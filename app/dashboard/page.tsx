"use client";

import { use } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/providers/auth-guard";
import { ArtistDashboard } from "@/components/dashboard/artist";
import { StudioDashboard } from "@/components/dashboard/studio";
import { CustomerDashboard } from "@/components/dashboard/customer";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ integration?: string; status?: string }>;
}) {
  const { effectiveRole } = useAuth();
  // OAuth callbacks land on /dashboard?integration=...&status=... — resolved
  // here (hydration-safe, server knows the params) and passed down as data.
  const { integration, status } = use(searchParams);
  const oauthReturn = integration && status ? { platform: integration, status } : null;

  return (
    <AuthGuard>
      {effectiveRole === "studio" ? (
        <StudioDashboard oauthReturn={oauthReturn} />
      ) : effectiveRole === "customer" ? (
        <CustomerDashboard />
      ) : (
        <ArtistDashboard />
      )}
    </AuthGuard>
  );
}
