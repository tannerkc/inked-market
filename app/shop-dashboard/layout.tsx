import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Studio Dashboard", "Manage your tattoo studio listing, team, and bookings");

export default function ShopDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
