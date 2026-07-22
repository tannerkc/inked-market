"use client";

import { SettingsSection } from "./settings-section";
import { SettingsToggleRow as ToggleRow, SettingsGroupLabel as GroupLabel } from "./settings-toggle-row";
import { useNotifications } from "./use-notifications";
import { ListGroup } from "@/components/dashboard";
import type { NotificationPreferences } from "@/lib/types";

export function NotificationsSection() {
  const { prefs, toggle, role } = useNotifications();

  type ToggleDef = {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
    warning?: string;
  };

  const activityToggles: ToggleDef[] = [];

  if (role === "artist") {
    activityToggles.push(
      { key: "bookingRequests", label: "Booking Requests", description: "When a client requests a booking", warning: "You may miss booking requests if this is turned off" },
      { key: "studioInvitations", label: "Studio Invitations", description: "When a studio invites you to join" },
      { key: "reviewAlerts", label: "Review Alerts", description: "When you receive a new review" },
    );
  } else if (role === "studio") {
    activityToggles.push(
      { key: "artistApplications", label: "Artist Applications", description: "When an artist requests affiliation" },
      { key: "bookingAlerts", label: "Booking Alerts", description: "When a booking is made at your studio", warning: "You may miss booking alerts if this is turned off" },
      { key: "reviewAlerts", label: "Review Alerts", description: "When your studio receives a new review" },
    );
  } else {
    activityToggles.push(
      { key: "savedArtistUpdates", label: "Saved Artist Updates", description: "When a saved artist posts new work" },
      { key: "bookingConfirmations", label: "Booking Confirmations", description: "Status updates on your bookings" },
    );
  }

  return (
    <SettingsSection title="Notifications" description="Control what updates you receive">
      {/* Activity */}
      <GroupLabel label="Activity" />
      <ListGroup>
        <div className="px-5">
          {activityToggles.map((t) => (
            <ToggleRow
              key={t.key}
              label={t.label}
              description={t.description}
              checked={!!prefs[t.key]}
              onChange={() => toggle(t.key)}
              warning={t.warning}
            />
          ))}
        </div>
      </ListGroup>

      {/* Communications */}
      <GroupLabel label="Communications" />
      <ListGroup>
        <div className="px-5">
          <ToggleRow
            label="Marketing Emails"
            description="New features, promotions, and announcements"
            checked={prefs.marketing}
            onChange={() => toggle("marketing")}
          />
          <ToggleRow
            label="Platform Updates"
            description="Maintenance, policy changes, and security alerts"
            checked={prefs.platformUpdates}
            onChange={() => toggle("platformUpdates")}
          />
        </div>
      </ListGroup>
    </SettingsSection>
  );
}
