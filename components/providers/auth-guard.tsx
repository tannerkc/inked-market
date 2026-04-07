"use client";

import { useEffect } from "react";
import { useAuth, type UserRole } from "./auth-provider";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protects pages behind authentication.
 * On localhost: redirects to /login if not authenticated.
 * Off localhost: renders children directly (auth disabled).
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLocalhost, user } = useAuth();

  useEffect(() => {
    if (!isLocalhost) return;
    if (!isAuthenticated) {
      window.location.href = "/login";
    } else if (requiredRole && user?.role !== requiredRole) {
      // Wrong role — redirect to their correct dashboard
      if (user?.role === "artist") window.location.href = "/dashboard";
      else if (user?.role === "studio") window.location.href = "/dashboard";
      else window.location.href = "/";
    }
  }, [isAuthenticated, isLocalhost, user, requiredRole]);

  // Off localhost: always render (auth disabled)
  if (!isLocalhost) return <>{children}</>;

  // On localhost: only render when authenticated with correct role
  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
