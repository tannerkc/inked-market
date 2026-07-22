import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a rating number to one decimal place
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Canonical star-glyph rating label: "★ 4.8"
 */
export function formatStarRating(rating: number): string {
  return `★ ${formatRating(rating)}`;
}

/**
 * Format a large number with K/M suffix
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Copy fields from a (possibly null) source onto a target, but only when the
 * source's value is not `undefined`. Used to derive form state from a partial
 * domain object without writing one ?? chain per field.
 *
 * Returns the target for fluent use.
 */
export function copyDefinedFields<S extends object, K extends keyof S & string>(
  target: Record<string, unknown>,
  source: S | null | undefined,
  keys: readonly K[]
): typeof target {
  if (!source) return target;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined) target[key] = value;
  }
  return target;
}

/**
 * Split a full name into first and last components.
 * "Tanner Cottle" → { first: "Tanner", last: "Cottle" }
 * "Cher" → { first: "Cher", last: "" }
 * Empty/undefined input → { first: "", last: "" }
 */
export function splitFullName(name: string | undefined | null): { first: string; last: string } {
  if (!name) return { first: "", last: "" };
  const [first = "", ...rest] = name.split(" ");
  return { first, last: rest.join(" ") };
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format address for display
 */
export function formatAddress(
  city: string,
  state: string,
  country?: string
): string {
  const parts = [city, state];
  if (country && country !== "USA") {
    parts.push(country);
  }
  return parts.join(", ");
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Public profile URL for an artist or studio — pretty slug when present,
 * id fallback (mock/sample rows have no slug). The profile routes resolve
 * both and canonicalize id URLs to the slug.
 */
export function profilePath(
  type: "artist" | "studio",
  ref: { id: string; slug?: string | null }
): string {
  return `/${type}s/${ref.slug ?? ref.id}`;
}

/**
 * Booking entry URL (/book/[target]) — same slug-first convention as
 * profilePath. The /book route resolves artists first, then studios.
 */
export function bookPath(ref: { id: string; slug?: string | null }): string {
  return `/book/${ref.slug ?? ref.id}`;
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatAmount(amount: number): string {
  return currencyFormatter.format(amount);
}
