import type { Metadata } from "next";
import { ContactPageContent } from "./contact-page-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Inked Market team for support, feedback, or business inquiries.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
