import type { IntegrationPlatform } from "@/lib/types/integrations";
import type { OAuthProvider } from "../types";
import { squareProvider } from "./square";
import { calendlyProvider } from "./calendly";
import { instagramProvider, facebookProvider } from "./meta";

/** Every platform with a real OAuth API on the free tier. Everything else in
 * the registry is link-based by vendor design (Yelp/Trustpilot APIs are paid;
 * Google Business Profile is approval-gated; Booksy et al. have no public API). */
const OAUTH_PROVIDERS: Partial<Record<IntegrationPlatform, OAuthProvider>> = {
  square: squareProvider,
  calendly: calendlyProvider,
  instagram: instagramProvider,
  facebook: facebookProvider,
};

export function getOAuthProvider(platform: string): OAuthProvider | null {
  return OAUTH_PROVIDERS[platform as IntegrationPlatform] ?? null;
}
