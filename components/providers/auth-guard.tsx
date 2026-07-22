"use client";

import { useEffect } from "react";
import { useAuth, type UserRole } from "./auth-provider";
import { AccountPausedWall, ConfirmEmailBanner } from "@/components/account";
import { accountAccess } from "@/lib/utils/email-confirmation";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protects pages behind authentication.
 * Redirects to /login if not authenticated or wrong role.
 * Enforces the email-confirmation grace period: paused accounts get a
 * blocking wall; pending ones a floating reminder banner.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, user, hydrated } = useAuth();

  useEffect(() => {
    // ponytail: wait for the session to load before deciding — otherwise the
    // pre-hydration isAuthenticated=false bounces to /login on every mount,
    // and /login bounces back once hydrated → infinite full-page reload loop.
    if (!hydrated) return;
    if (!isAuthenticated) {
      window.location.href = "/login";
    } else if (requiredRole && user?.role !== requiredRole) {
      window.location.href = "/dashboard";
    }
  }, [hydrated, isAuthenticated, user, requiredRole]);

  if (!hydrated) return null;
  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  const access = accountAccess(user?.emailConfirmation, user?.paused === true);
  if (access === "paused") return <AccountPausedWall />;

  return (
    <>
      {children}
      {access === "pending" ? <ConfirmEmailBanner /> : null}
    </>
  );
}
