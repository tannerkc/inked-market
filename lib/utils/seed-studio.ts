import type { AuthUser } from "@/components/providers/auth-provider";
import type { StudioData } from "@/lib/repositories";

/**
 * Maps AuthUser fields → StudioData for first-time repository seeding.
 *
 * Called once when the StudioRepository is empty (new user, or cleared storage).
 * Future: replace this with an API call that fetches the studio's persisted data.
 */
export function seedStudioFromAuthUser(user: AuthUser): StudioData {
  return {
    name: user.studioName ?? "",
    phone: user.phone,
    email: user.email,
    city: user.city,
    state: user.state,
    address: undefined,
    zipCode: undefined,
    bio: undefined,
    profileImage: undefined,
    coverImage: undefined,
    specialties: user.specialties ?? [],
    services: user.services ?? [],
    hours: {
      Monday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Tuesday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Wednesday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Thursday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Friday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Saturday: { open: "10:00 AM", close: "6:00 PM", closed: false },
      Sunday: { open: "10:00 AM", close: "6:00 PM", closed: true },
    },
    autoSpecialties: user.autoSpecialties ?? false,
    instagram: user.instagram,
    website: user.website,
    tiktok: user.tiktok,
    facebook: undefined,
  };
}
