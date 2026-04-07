import type { DashboardData, WeeklyAvailability, Affiliation } from "@/lib/types";

export function getCustomerDashboardData(): DashboardData {
  return {
    name: "Alex Morgan",
    tags: ["Fine Line", "Geometric", "Minimalist"],
    accentColor: "indigo",
    stats: [
      { label: "Appointments", value: 2 },
      { label: "Unread", value: 3 },
      { label: "Reviews", value: 1 },
    ],
    checklist: [
      { id: "create-account", label: "Create account", completed: true },
      { id: "set-styles", label: "Set style preferences", completed: true },
      { id: "add-photo", label: "Add a profile photo", completed: false },
      { id: "save-artist", label: "Save your first artist", completed: false },
      { id: "submit-booking", label: "Submit a booking request", completed: false },
      { id: "first-appointment", label: "Complete your first appointment", completed: false },
    ],
    onboardingTitle: "Get the most out of Inked Market",
    onboardingSubtitle: "2 of 6 complete — set up your profile to connect with artists",
  };
}

export function getArtistDashboardData(): DashboardData {
  return {
    name: "Sarah Chen",
    tags: ["Fine Line", "Minimalist", "Geometric"],
    accentColor: "indigo",
    stats: [
      { label: "Profile views", value: 0, empty: true },
      { label: "Saves", value: 0, empty: true },
      { label: "Messages", value: 0, empty: true },
    ],
    checklist: [
      { id: "create-account", label: "Create account", completed: true },
      { id: "choose-styles", label: "Choose your styles", completed: true },
      { id: "connect-instagram", label: "Connect Instagram", completed: true },
      { id: "select-plan", label: "Select your plan", completed: true },
      { id: "add-bio", label: "Add a bio", completed: false },
      { id: "upload-headshot", label: "Upload a headshot", completed: false },
      { id: "add-portfolio", label: "Add first portfolio piece", completed: false },
    ],
    onboardingTitle: "Finish setting up your profile",
    onboardingSubtitle: "4 of 7 complete — artists with full profiles get 3× more views",
  };
}

export function getStudioDashboardData(): DashboardData {
  return {
    name: "Iron Rose Tattoo",
    subtitle: "Portland, OR · (503) 555-0142",
    tags: ["Traditional", "Japanese", "Neo-Traditional"],
    accentColor: "amber",
    stats: [
      { label: "Page views", value: 0, empty: true },
      { label: "Inquiries", value: 0, empty: true },
      { label: "Bookings", value: 0, empty: true },
    ],
    checklist: [
      { id: "create-account", label: "Create account", completed: true },
      { id: "add-studio-details", label: "Add studio details", completed: true },
      { id: "set-specialties", label: "Set specialties", completed: true },
      { id: "add-photos", label: "Add studio photos", completed: false },
      { id: "set-hours", label: "Set business hours", completed: false },
      { id: "customize-page", label: "Customize your page", completed: false },
    ],
    onboardingTitle: "Finish setting up your studio",
    onboardingSubtitle: "3 of 6 complete — customize your page for free, publish when you're ready",
  };
}

export function getPopulatedArtistData(): DashboardData {
  return {
    name: "Sarah Chen",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    tags: ["Fine Line", "Minimalist", "Geometric"],
    accentColor: "indigo",
    stats: [
      { label: "Profile views", value: 142 },
      { label: "Saves", value: 38 },
      { label: "Messages", value: 12 },
    ],
    checklist: [
      { id: "create-account", label: "Create account", completed: true },
      { id: "choose-styles", label: "Choose your styles", completed: true },
      { id: "connect-instagram", label: "Connect Instagram", completed: true },
      { id: "select-plan", label: "Select your plan", completed: true },
      { id: "add-bio", label: "Add a bio", completed: true },
      { id: "upload-headshot", label: "Upload a headshot", completed: true },
      { id: "add-portfolio", label: "Add first portfolio piece", completed: true },
    ],
    onboardingTitle: "Finish setting up your profile",
    onboardingSubtitle: "7 of 7 complete — artists with full profiles get 3× more views",
  };
}

export function getPopulatedStudioData(): DashboardData {
  return {
    name: "Iron Rose Tattoo",
    subtitle: "Portland, OR · (503) 555-0142",
    avatarUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200",
    tags: ["Traditional", "Japanese", "Neo-Traditional"],
    accentColor: "amber",
    stats: [
      { label: "Page views", value: 1247 },
      { label: "Inquiries", value: 89 },
      { label: "Bookings", value: 34 },
    ],
    checklist: [
      { id: "create-account", label: "Create account", completed: true },
      { id: "add-studio-details", label: "Add studio details", completed: true },
      { id: "set-specialties", label: "Set specialties", completed: true },
      { id: "add-photos", label: "Add studio photos", completed: true },
      { id: "set-hours", label: "Set business hours", completed: true },
      { id: "customize-page", label: "Customize your page", completed: true },
    ],
    onboardingTitle: "Finish setting up your studio",
    onboardingSubtitle: "6 of 6 complete — customize your page for free, publish when you're ready",
  };
}

export function getDefaultAvailability(): WeeklyAvailability {
  const workdaySlot = { start: "10:00 AM", end: "6:00 PM" };
  return {
    Monday: { enabled: true, slots: [workdaySlot] },
    Tuesday: { enabled: true, slots: [workdaySlot] },
    Wednesday: { enabled: true, slots: [workdaySlot] },
    Thursday: { enabled: true, slots: [workdaySlot] },
    Friday: { enabled: true, slots: [workdaySlot] },
    Saturday: { enabled: true, slots: [workdaySlot] },
    Sunday: { enabled: false, slots: [] },
  };
}

export function getArtistSearchResults(): Array<{
  id: string;
  name: string;
  avatarUrl?: string;
  styles: string[];
}> {
  return [
    {
      id: "artist-search-1",
      name: "Marcus Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      styles: ["Traditional", "Blackwork"],
    },
    {
      id: "artist-search-2",
      name: "Yuki Tanaka",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      styles: ["Japanese", "Fine Line"],
    },
    {
      id: "artist-search-3",
      name: "Jade Williams",
      avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200",
      styles: ["Watercolor", "Abstract"],
    },
    {
      id: "artist-search-4",
      name: "Dev Patel",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
      styles: ["Geometric", "Dotwork"],
    },
  ];
}

export function getStudioSearchResults(): Array<{
  id: string;
  name: string;
  avatarUrl?: string;
  location: string;
}> {
  return [
    {
      id: "studio-search-1",
      name: "Black Anchor Tattoo",
      avatarUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200",
      location: "Brooklyn, NY",
    },
    {
      id: "studio-search-2",
      name: "Silk City Ink",
      avatarUrl: "https://images.unsplash.com/photo-1611523658822-385aa008324c?w=200",
      location: "Portland, OR",
    },
    {
      id: "studio-search-3",
      name: "Desert Sun Studio",
      avatarUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200",
      location: "Austin, TX",
    },
  ];
}

export function getStudioRoster(): Affiliation[] {
  return [
    {
      id: "roster-1",
      name: "Sarah Chen",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      status: "active",
      role: "artist",
      styles: ["Fine Line", "Minimalist", "Geometric"],
    },
    {
      id: "roster-2",
      name: "Marcus Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      status: "pending-invite",
      role: "artist",
      styles: ["Traditional", "Blackwork"],
    },
    {
      id: "roster-3",
      name: "Yuki Tanaka",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      status: "pending-request",
      role: "artist",
      styles: ["Japanese", "Fine Line"],
    },
  ];
}
