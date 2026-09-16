import { createClient } from "@/lib/supabase/server";

// Mirrors the old Netlify Functions requireUser(context) pattern: every
// mutating route under app/api/control/** calls this independently, since
// middleware alone doesn't protect a route hit directly.
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const err = new Error("Unauthorized");
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }
  return data.user;
}
