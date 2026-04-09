import type { StudioData } from "@/lib/repositories";

/**
 * MOCK_STUDIO_DATA — canonical mock content used by the builder preview
 * when "Mock Data" mode is active. All hardcoded strings that were previously
 * scattered across preview components live here instead.
 *
 * Toggle via the "Mock" button in BuilderTopBar.
 */
export const MOCK_STUDIO_DATA: StudioData = {
  name: "Iron & Ink",
  phone: "(503) 555-0147",
  email: "hello@ironandink.com",
  city: "Portland",
  state: "OR",
  address: "1234 Hawthorne Blvd",
  zipCode: "97214",
  bio: "Founded with a passion for exceptional tattoo art, Iron & Ink has been crafting meaningful work since 2012. Our artists bring decades of combined experience across every style — from bold traditional to razor-thin fine line. We believe every tattoo tells a story. Come tell yours.",
  specialties: ["Blackwork", "Fine Line", "Realism", "Neo-Traditional"],
  services: ["walk-ins"],
  hours: {
    Monday: { open: "11:00 AM", close: "8:00 PM", closed: false },
    Tuesday: { open: "11:00 AM", close: "8:00 PM", closed: false },
    Wednesday: { open: "11:00 AM", close: "8:00 PM", closed: false },
    Thursday: { open: "11:00 AM", close: "8:00 PM", closed: false },
    Friday: { open: "11:00 AM", close: "9:00 PM", closed: false },
    Saturday: { open: "10:00 AM", close: "9:00 PM", closed: false },
    Sunday: { open: "12:00 PM", close: "6:00 PM", closed: true },
  },
  autoSpecialties: false,
  instagram: "@ironandinkpdx",
  website: "https://ironandink.com",
  tiktok: "@ironandinkpdx",
  facebook: undefined,
};
