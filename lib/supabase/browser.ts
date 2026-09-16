import { createBrowserClient } from "@supabase/ssr";

// Anon/publishable-key client for the login page's signInWithPassword call.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
