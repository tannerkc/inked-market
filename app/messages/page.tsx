import { ComingSoon } from "@/components/ui/coming-soon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Inked Market",
  description: "Connect with artists and studios",
};

export default function MessagesPage() {
  return (
    <ComingSoon
      title="Messages"
      description="Connect directly with artists and studios. Discuss your ideas, get quotes, and schedule consultations all in one place."
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      }
      features={[
        "Real-time messaging with artists and studios",
        "Share design ideas and reference images",
        "Get instant quotes and availability",
        "Organize conversations by project",
        "Receive notifications for new messages",
      ]}
    />
  );
}
