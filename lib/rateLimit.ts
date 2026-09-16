import { createAdminClient } from "@/lib/supabase/admin";

// Ported from netlify/functions/lib/rateLimit.js — same UTC hour-bucket key
// format, now backed by the ig_rate_limit table instead of a Blobs store.
const MAX_PER_HOUR = parseInt(process.env.IG_MAX_MESSAGES_PER_HOUR || "80", 10);

function hourBucket(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}`;
}

// Returns true if sending is allowed (and increments the counter).
export async function allowSend(): Promise<boolean> {
  const supabase = createAdminClient();
  const key = hourBucket();

  const { data: existing } = await supabase
    .from("ig_rate_limit")
    .select("count")
    .eq("hour_bucket", key)
    .maybeSingle();

  const current = existing?.count ?? 0;
  if (current >= MAX_PER_HOUR) return false;

  await supabase.from("ig_rate_limit").upsert({ hour_bucket: key, count: current + 1 });
  return true;
}
