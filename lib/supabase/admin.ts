import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Privileged, server-only client (secret key) used by every /api/control/**
// and /api/public/** route for actual table/storage access. Bypasses RLS by
// design — see the plan's rationale: a single-admin-user app has no
// legitimate client-side query path to protect with row policies, so all
// reads/writes go through this client from Route Handlers instead.
// Never import this file from a Client Component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}
