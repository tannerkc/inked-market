import { ComingSoon } from "@/components/ui/coming-soon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Dashboard | Inked Market",
  description: "Manage your tattoo studio",
};

export default function ShopDashboardPage() {
  return (
    <ComingSoon
      title="Shop Dashboard"
      description="Powerful tools to manage your tattoo studio, team, bookings, and grow your business. Everything you need in one comprehensive platform."
      icon={
        <svg
          className="w-10 h-10 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      }
      features={[
        "Manage studio profile and portfolio",
        "Team member and artist management",
        "Appointment scheduling and calendar",
        "Customer relationship management (CRM)",
        "Analytics and business insights",
        "Review management and responses",
        "Financial reporting and invoicing",
        "Marketing tools and promotions",
      ]}
    />
  );
}
