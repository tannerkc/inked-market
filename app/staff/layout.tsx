import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/staff/guard";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import { StaffTabs } from "./staff-tabs";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  if (!staff) notFound();

  return (
    <DashboardLayout>
      <div className="relative">
        <PageHeader
          eyebrow={{ text: "Internal Only", variant: "marker", color: "red" }}
          headline={{
            variant: "mixed",
            size: "sm",
            words: [
              { text: "Staff", font: "pirata" },
              { text: "Console", font: "cook", color: "text-ink-rust dark:text-ink-red" },
            ],
          }}
          subtitle={{ text: "Every action here is written to the audit log.", variant: "plain" }}
          className="mb-6"
        />
        <div className="absolute right-0 top-0">
          <StatusBadge
            label={staff.role}
            color={staff.role === "founder" ? BADGE_COLORS.tag : BADGE_COLORS.muted}
          />
        </div>
      </div>
      <StaffTabs />
      {children}
    </DashboardLayout>
  );
}
