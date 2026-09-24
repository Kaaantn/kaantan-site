import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseContentInput } from "@/lib/content";

export const dynamic = "force-dynamic";

async function guard() {
  try {
    await requireUser();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const COLUMNS = "id,title,platform,status,scheduled_for,notes,url,sort_order,created_at";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("content_items")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = parseContentInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("content_items").insert(parsed.value).select(COLUMNS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function PUT(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const parsed = parseContentInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("content_items")
    .update({ ...parsed.value, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
