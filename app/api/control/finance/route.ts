import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseEntryInput } from "@/lib/finance";

export const dynamic = "force-dynamic";

async function guard() {
  try {
    await requireUser();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const COLUMNS = "id,type,amount,currency,category,title,note,entry_date,status,created_at";

// Son ~14 ayın kayıtları (grafikler + ay seçici için yeterli). ?all=1 tüm geçmişi getirir.
export async function GET(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const supabase = createAdminClient();
  let q = supabase.from("finance_entries").select(COLUMNS).order("entry_date", { ascending: false }).order("created_at", { ascending: false }).limit(5000);

  if (request.nextUrl.searchParams.get("all") !== "1") {
    const d = new Date();
    d.setMonth(d.getMonth() - 14);
    q = q.gte("entry_date", d.toISOString().slice(0, 10));
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: (data || []).map((e) => ({ ...e, amount: Number(e.amount) })) });
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = parseEntryInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("finance_entries").insert(parsed.value).select(COLUMNS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: { ...data, amount: Number(data.amount) } });
}

export async function PUT(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const parsed = parseEntryInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("finance_entries")
    .update({ ...parsed.value, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: { ...data, amount: Number(data.amount) } });
}

export async function DELETE(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("finance_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
