import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Dashboard | Inked Market",
  description: "Manage your tattoo studio listing, team, and bookings",
};

export default function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
