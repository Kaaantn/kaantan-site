import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase's free plan pauses a project after ~7 days without activity.
// Vercel Cron (vercel.json) calls this once a day so the DB never idles.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();
  const { error } = await supabase.from("ig_settings").select("id").limit(1);
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}
