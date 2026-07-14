"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
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
        <div>
          {invoices.map((invoice) => {
            const config = invoiceStatusConfig[invoice.status];

            return (
              <div
                key={invoice.id}
                className="flex items-center gap-3 py-3 border-b transition-colors border-ink-black/[0.04] hover:bg-ink-black/[0.04] dark:border-ink-cream/[0.04] dark:hover:bg-ink-cream/[0.04]"
              >
                <span className="font-mono text-[10px] tracking-[0.1em] flex-shrink-0 w-16 text-ink-black/25 dark:text-ink-cream/25">
                  {formatDate(invoice.createdAt)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] truncate text-ink-black dark:text-ink-cream">
                    {invoice.description}
                  </p>
                  <p className="text-[11px] truncate text-ink-black/40 dark:text-ink-cream/40">
                    {invoice.artistName}
                  </p>
                </div>

                <span className="text-[12px] font-semibold flex-shrink-0 text-ink-black dark:text-ink-cream">
                  {formatAmount(invoice.amount)}
                </span>

                <StatusBadge
                  label={config.label}
                  color={config.color}
                  className="flex-shrink-0"
                />
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  </div>
));
CustomerInvoicesSection.displayName = "CustomerInvoicesSection";

export { CustomerInvoicesSection };
export type { CustomerInvoicesSectionProps };
