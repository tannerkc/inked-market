import { ComingSoon } from "@/components/ui/coming-soon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Dashboard | Inked Market",
  description: "Manage your tattoo artist profile and portfolio",
};

export default function ArtistDashboardPage() {
  return (
    <ComingSoon
      title="Artist Dashboard"
      description="Your personal command center to manage your portfolio, bookings, and connect with clients. Build your brand and grow your tattoo career."
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
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      }
      features={[
        "Manage your artist profile and bio",
        "Upload and organize portfolio work",
        "Appointment calendar and availability",
        "Client communication and inquiries",
        "Performance analytics and insights",
        "Review management",
        "Pricing and service management",
        "Social media integration",
      ]}
    />
  );
}
