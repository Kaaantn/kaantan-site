import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { fetchInstagramStats } from "@/lib/mediaKit";

export const dynamic = "force-dynamic";

// Yalnızca rakamları döndürür; kaydetme kararı panelde (kullanıcı onayıyla) verilir.
export async function POST() {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ stats: await fetchInstagramStats() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
