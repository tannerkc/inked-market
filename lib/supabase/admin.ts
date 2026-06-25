import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using the service role key.
 * Server-only — never import this in client components.
 * Used by: seeding script, claim flow API routes, admin operations.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
