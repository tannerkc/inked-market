"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import type { StatusBadgeColor } from "@/components/ui/status-badge";
import type { Appointment, AppointmentStatus } from "@/lib/types";

interface CustomerAppointmentsSectionProps {
  upcoming: Appointment[];
  past: Appointment[];
  className?: string;
}

const appointmentStatusConfig: Record<AppointmentStatus, { label: string; color: StatusBadgeColor }> = {
  confirmed: { label: "Confirmed", color: BADGE_COLORS.sage },
  pending: { label: "Pending", color: BADGE_COLORS.rust },
  completed: { label: "Completed", color: BADGE_COLORS.sage },
  cancelled: { label: "Cancelled", color: BADGE_COLORS.red },
};

function formatShortDate(date: Date): { month: string; day: string } {
  const d = new Date(date);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate().toString();
  return { month, day };
}

function formatDuration(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 1) {
    return hours % 1 === 0 ? `${hours}hr` : `${hours.toFixed(1)}hr`;
  }
  return `${minutes}min`;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const { month, day } = formatShortDate(appointment.date);
  const config = appointmentStatusConfig[appointment.status];

  return (
    <div className="flex items-center gap-3 py-3 border-b transition-colors border-ink-black/[0.04] hover:bg-ink-black/[0.04] dark:border-ink-cream/[0.04] dark:hover:bg-ink-cream/[0.04]">
      <div className="w-10 flex-shrink-0 text-center text-ink-black/50 dark:text-ink-cream/50">
        <p className="font-mono text-[9px] tracking-[0.1em] uppercase leading-none">
          {month}
        </p>
        <p className="text-[16px] font-semibold leading-tight text-ink-black/70 dark:text-ink-cream/70">
          {day}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium truncate text-ink-black dark:text-ink-cream">
          {appointment.artistName}
        </p>
        {appointment.studioName && (
          <p className="text-[11px] truncate text-ink-black/40 dark:text-ink-cream/40">
            {appointment.studioName}
          </p>
        )}
        {appointment.notes && (
          <p className="text-[11px] truncate text-ink-black/30 dark:text-ink-cream/30">
            {appointment.notes}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 text-right">
        <StatusBadge label={config.label} color={config.color} />
        <p className="font-mono text-[10px] mt-1 text-ink-black/25 dark:text-ink-cream/25">
          {formatDuration(appointment.duration)}
        </p>
      </div>
    </div>
  );
}

const CustomerAppointmentsSection = React.forwardRef<
  HTMLDivElement,
  CustomerAppointmentsSectionProps
>(({ upcoming, past, className, ...props }, ref) => {
  const isEmpty = upcoming.length === 0 && past.length === 0;

  return (
    <div ref={ref} className={className} {...props}>
      <DashboardSection title="Appointments">
        {isEmpty ? (
          <EmptyState
            message="No appointments yet"
            description="Browse artists to get started"
          />
        ) : (
          <div>
            {upcoming.length > 0 && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1 mt-1 text-ink-black/25 dark:text-ink-cream/25">
                  Upcoming
                </p>
                {upcoming.map((appt) => (
                  <AppointmentRow key={appt.id} appointment={appt} />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className={upcoming.length > 0 ? "mt-4" : ""}>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1 mt-1 text-ink-black/25 dark:text-ink-cream/25">
                  Past
                </p>
                {past.map((appt) => (
                  <AppointmentRow key={appt.id} appointment={appt} />
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerAppointmentsSection.displayName = "CustomerAppointmentsSection";

export { CustomerAppointmentsSection };
export type { CustomerAppointmentsSectionProps };
