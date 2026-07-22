"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "@/components/ui/tab-bar";

const TABS = [
  { label: "Users", value: "/staff" },
  { label: "Promos", value: "/staff/promos" },
  { label: "Team", value: "/staff/team" },
  { label: "Audit", value: "/staff/audit" },
];

export function StaffTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const active = TABS.find((t) => t.value === pathname)?.value ?? "/staff";
  return <TabBar tabs={TABS} activeTab={active} onTabChange={(href) => router.push(href)} className="mb-8" />;
}
