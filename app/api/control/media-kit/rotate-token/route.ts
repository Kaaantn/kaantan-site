import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getOrCreateKit, newToken, saveKit } from "@/lib/mediaKit";

export const dynamic = "force-dynamic";

// Linki yeniler: eski link anında çalışmaz hale gelir.
export async function POST() {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const kit = await getOrCreateKit();
    kit.shareToken = newToken();
    await saveKit(kit);
    return NextResponse.json({ kit });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
