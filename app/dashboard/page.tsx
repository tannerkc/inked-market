"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/providers/auth-guard";
import { ArtistDashboard } from "@/components/dashboard/artist";
import { StudioDashboard } from "@/components/dashboard/studio";
import { CustomerDashboard } from "@/components/dashboard/customer";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      {user?.role === "studio" ? (
        <StudioDashboard />
      ) : user?.role === "customer" ? (
        <CustomerDashboard />
      ) : (
        <ArtistDashboard />
      )}
    </AuthGuard>
  );
}
