/**
 * Inked Market's own outward-facing destinations — the single place to update
 * brand links. Set a social href to null to hide that icon everywhere.
 *
 * NOTE: verify the brand handles are registered before launch; update here if
 * the final handles differ.
 */

export const SITE_SOCIALS: { key: "instagram" | "x" | "tiktok"; label: string; href: string | null }[] = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/inkedmarket/" },
  { key: "x", label: "X", href: "https://x.com/inkedmarket" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@inkedmarket" },
];

export const SUPPORT_EMAIL = "support@inkedmarket.com";
