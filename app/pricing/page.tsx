import { createMetadata } from "@/lib/metadata";
import { PricingPageContent } from "./pricing-page-content";

export const metadata = createMetadata("Pricing", "Simple, transparent pricing for artists and studios on Inked Market.");

export default function PricingPage() {
  return <PricingPageContent />;
}
