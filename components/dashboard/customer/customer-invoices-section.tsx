"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { ListGroup } from "@/components/dashboard/list-group";
import { formatDate, formatAmount } from "@/lib/utils";
import { StatusBadge, BADGE_COLORS } from "@/components/ui/status-badge";
import type { Invoice, InvoiceStatus } from "@/lib/types";

interface CustomerInvoicesSectionProps {
  invoices: Invoice[];
  className?: string;
}

const invoiceStatusConfig: Record<InvoiceStatus, { color: typeof BADGE_COLORS[keyof typeof BADGE_COLORS]; label: string }> = {
  paid: { color: BADGE_COLORS.sage, label: "Paid" },
  unpaid: { color: BADGE_COLORS.rust, label: "Unpaid" },
  overdue: { color: BADGE_COLORS.red, label: "Overdue" },
  refunded: { color: BADGE_COLORS.muted, label: "Refunded" },
};

const CustomerInvoicesSection = React.forwardRef<
  HTMLDivElement,
  CustomerInvoicesSectionProps
>(({ invoices, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    <DashboardSection title="Invoices">
      {invoices.length === 0 ? (
        <EmptyState
          message="No invoices yet"
          description="Invoices appear after booking appointments"
        />
      ) : (
        <ListGroup>
          {invoices.map((invoice) => {
            const config = invoiceStatusConfig[invoice.status];
            const urgent = invoice.status === "unpaid" || invoice.status === "overdue";

            return (
              <div
                key={invoice.id}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-ink-black/[0.03] dark:hover:bg-ink-cream/[0.03]"
              >
                <InitialsAvatar
                  name={invoice.artistName}
                  tone={urgent ? "accent" : "muted"}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate text-ink-black dark:text-ink-cream">
                    {invoice.description}
                  </p>
                  <p className="mt-0.5 text-[11px] truncate text-ink-black/40 dark:text-ink-cream/40">
                    {invoice.artistName}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-ink-black/25 dark:text-ink-cream/25">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[12px] font-semibold text-ink-black dark:text-ink-cream">
                    {formatAmount(invoice.amount)}
                  </span>
                  <StatusBadge label={config.label} color={config.color} />
                </div>
              </div>
            );
          })}
        </ListGroup>
      )}
    </DashboardSection>
  </div>
));
CustomerInvoicesSection.displayName = "CustomerInvoicesSection";

export { CustomerInvoicesSection };
export type { CustomerInvoicesSectionProps };
