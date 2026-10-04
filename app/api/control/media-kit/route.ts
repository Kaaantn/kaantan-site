import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getOrCreateKit, sanitizeKit, saveKit } from "@/lib/mediaKit";

export const dynamic = "force-dynamic";

async function guard() {
  try {
    await requireUser();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    return NextResponse.json({ kit: await getOrCreateKit() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

  try {
    const current = await getOrCreateKit();
    const next = sanitizeKit(body.kit, current);
    await saveKit(next);
    return NextResponse.json({ kit: next });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
