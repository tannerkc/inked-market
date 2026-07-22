import { createBrowserClient } from "@supabase/ssr";

/**
 * Concurrent `auth.getUser()` calls contend for supabase-js's navigator lock
 * ("Lock … was released because another request stole it"). The browser client
 * is a singleton, so dedupe in-flight getUser calls at the factory — every
 * caller shares one lock acquisition and one /auth/v1/user request.
 */
export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const auth = client.auth as typeof client.auth & { __getUserDeduped?: boolean };
  if (!auth.__getUserDeduped) {
    auth.__getUserDeduped = true;
    const original = auth.getUser.bind(auth);
    let inflight: ReturnType<typeof original> | null = null;
    auth.getUser = (jwt?: string) => {
      if (jwt) return original(jwt);
      inflight ??= original().finally(() => {
        inflight = null;
      });
      return inflight;
    };
  }

  return client;
}
