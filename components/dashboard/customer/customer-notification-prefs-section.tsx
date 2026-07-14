"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { NotificationPreferences } from "@/lib/types";

interface CustomerNotificationPrefsSectionProps {
  prefs: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences) => void;
  className?: string;
}

interface PrefItem {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

const prefGroups: { title: string; items: PrefItem[] }[] = [
  {
    title: "Bookings & Appointments",
    items: [
      {
        key: "bookingConfirmations",
        label: "Booking Confirmations",
        description:
          "Get notified when appointments are confirmed or changed",
      },
    ],
  },
  {
    title: "Artists & Inspiration",
    items: [
      {
        key: "savedArtistUpdates",
        label: "Saved Artist Updates",
        description:
          "New work and flash drops from artists you follow",
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        key: "platformUpdates",
        label: "Platform Updates",
        description:
          "New features, improvements, and marketplace updates",
      },
      {
        key: "marketing",
        label: "Marketing & Promotions",
        description:
          "Special offers and curated artist recommendations",
      },
    ],
  },
];

const CustomerNotificationPrefsSection = React.forwardRef<
  HTMLDivElement,
  CustomerNotificationPrefsSectionProps
>(({ prefs, onToggle, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    <DashboardSection title="Notification Preferences">
      <div className="space-y-4">
        {prefGroups.map((group) => (
          <div key={group.title}>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2 text-ink-black/25 dark:text-ink-cream/25">
              {group.title}
            </p>
            <div className="rounded-lg overflow-hidden bg-ink-black/[0.03] dark:bg-ink-cream/[0.03]">
              {group.items.map((item, idx) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5",
                    idx > 0 && "border-t border-ink-black/[0.04] dark:border-ink-cream/[0.04]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[12px] text-ink-black dark:text-ink-cream">
                      {item.label}
                    </p>
                    <p className="text-[11px] mt-0.5 text-ink-black/35 dark:text-ink-cream/35">
                      {item.description}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={!!prefs[item.key]}
                    onChange={() => onToggle(item.key)}
                    size="sm"
                    aria-label={item.label}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  </div>
));
CustomerNotificationPrefsSection.displayName =
  "CustomerNotificationPrefsSection";

export { CustomerNotificationPrefsSection };
export type { CustomerNotificationPrefsSectionProps };
