import { ComingSoon } from "@/components/ui/coming-soon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved | Inked Market",
  description: "Your saved artists, shops, and design inspiration",
};

export default function SavedPage() {
  return (
    <ComingSoon
      title="Saved Collection"
      description="Build your personal collection of favorite artists, studios, and design inspiration. Keep track of everything you love in one organized place."
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      }
      features={[
        "Save your favorite artists and studios",
        "Bookmark inspiring designs for reference",
        "Create custom collections and boards",
        "Add notes and tags to saved items",
        "Share your collections with others",
        "Get notifications when artists post new work",
      ]}
    />
  );
}
