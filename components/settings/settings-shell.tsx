"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { useSettingsNav } from "./use-settings-nav";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTabs } from "./settings-tabs";
import { AccountSection } from "./account-section";
import { AppearanceSection } from "./appearance-section";
import { NotificationsSection } from "./notifications-section";
import { ConnectedAccountsSection } from "./connected-accounts-section";
import { PlanBillingSection } from "./plan-billing-section";
import { PrivacySection } from "./privacy-section";
import { DangerZoneSection } from "./danger-zone-section";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  account: AccountSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  "connected-accounts": ConnectedAccountsSection,
  "plan-billing": PlanBillingSection,
  privacy: PrivacySection,
  "danger-zone": DangerZoneSection,
};

export function SettingsShell() {
  const { activeSection, setActiveSection, sections } = useSettingsNav();

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={{ text: "Account", variant: "marker", color: "rust" }}
        headline={{
          variant: "mixed",
          size: "sm",
          words: [
            { text: "Your", font: "pirata" },
            { text: "Settings", font: "cook", color: "text-ink-rust dark:text-ink-red" },
          ],
        }}
        className="mb-6"
      />

      {/* Mobile tabs */}
      <SettingsTabs
        sections={sections}
        activeSection={activeSection}
        onSelect={setActiveSection}
        className="mb-6"
      />

      {/* Desktop: sidebar + content */}
      <div className="flex gap-8 items-start">
        <SettingsSidebar
          sections={sections}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="flex-1 min-w-0">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </DashboardLayout>
  );
}
