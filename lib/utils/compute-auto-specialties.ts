import { tattooStyleLabels } from "@/lib/data/signup-styles";
import type { Affiliation, TattooStyle } from "@/lib/types";

/**
 * Compute studio specialties from the union of all active roster artists' styles.
 * Returns display labels (e.g., "Fine Line") in tattooStyleLabels order.
 */
export function computeAutoSpecialties(roster: Affiliation[]): string[] {
  const allStyles = new Set<string>();

  for (const artist of roster) {
    if (artist.status === "active" && artist.styles) {
      for (const style of artist.styles) {
        allStyles.add(style);
      }
    }
  }

  // Maintain consistent display order by following tattooStyleLabels
  // Compare against TattooStyle keys (e.g., "fine-line"), not display labels
  return (Object.entries(tattooStyleLabels) as [TattooStyle, string][])
    .filter(([key]) => allStyles.has(key))
    .map(([, label]) => label);
}
