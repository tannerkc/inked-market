"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/components/providers/auth-provider";

export interface SettingsNavItem {
  id: string;
  label: string;
  danger?: boolean;
}

const ALL_SECTIONS: (SettingsNavItem & { roles: UserRole[] | "all" })[] = [
  { id: "account", label: "Account", roles: "all" },
  { id: "appearance", label: "Appearance", roles: "all" },
  { id: "notifications", label: "Notifications", roles: "all" },
  { id: "connected-accounts", label: "Connected Accounts", roles: ["artist", "studio"] },
  { id: "plan-billing", label: "Plan & Billing", roles: ["artist", "studio"] },
  { id: "privacy", label: "Privacy", roles: "all" },
  { id: "danger-zone", label: "Danger Zone", roles: "all", danger: true },
];

export function useSettingsNav() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("account");

  const sections = useMemo(() => {
    const role = user?.role ?? "customer";
    return ALL_SECTIONS.filter(
      (s) => s.roles === "all" || s.roles.includes(role)
    ).map(({ roles: _roles, ...item }) => item);
  }, [user?.role]);

  return { activeSection, setActiveSection, sections };
}
