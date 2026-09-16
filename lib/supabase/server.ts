import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cookie-bound client for the current request — used to check/establish the
// admin session (middleware, Server Components, the login route handler).
// Uses the publishable key; RLS grants it nothing on our tables (see
// lib/supabase/admin.ts for the privileged client actual data access uses).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session cookie on the response instead, this is safe to ignore.
          }
        },
      },
    }
  );
}
