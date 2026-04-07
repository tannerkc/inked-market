import type { Metadata } from "next";
import { PricingPageContent } from "./pricing-page-content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for artists and studios on Inked Market.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
