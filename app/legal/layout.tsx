import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Inked Market Legal", default: "Legal | Inked Market" },
  description: "Legal documents for Inked Market — privacy policy, terms of service, and more.",
  robots: "noindex, nofollow",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
