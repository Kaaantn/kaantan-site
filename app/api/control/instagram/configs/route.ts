import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import * as repo from "@/lib/ig/repo";

// Ported from netlify/functions/panel-configs.js.
export async function GET() {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs = await repo.getConfigs();
  // Mutates configs.posts in place and persists each resolved row itself.
  await repo.backfillMediaIds(configs);
  return NextResponse.json(configs);
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

  if (typeof body.fallbackWord === "string") {
    await repo.saveSettings({ fallbackWord: body.fallbackWord.trim() });
    return NextResponse.json(await repo.getConfigs());
  }

  if (typeof body.publicReplyEnabled === "boolean") {
    await repo.saveSettings({ publicReplyEnabled: body.publicReplyEnabled });
    return NextResponse.json(await repo.getConfigs());
  }

  if (!body.post) {
    return NextResponse.json({ error: "post gerekli" }, { status: 400 });
  }

  try {
    await repo.upsertPost(body.post);
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode || 500;
    return NextResponse.json({ error: statusCode === 404 ? "Bulunamadı" : "Kaydedilemedi" }, { status: statusCode });
  }

  return NextResponse.json(await repo.getConfigs());
}

export async function DELETE(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  await repo.deletePost(id);
  return NextResponse.json(await repo.getConfigs());
}
