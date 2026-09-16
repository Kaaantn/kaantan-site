import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getPost, savePost, deletePost } from "@/lib/blogAdmin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  try {
    return NextResponse.json(await getPost(slug));
  } catch {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

  try {
    const result = await savePost({ ...body, slug });
    return NextResponse.json(result);
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode || 500;
    return NextResponse.json({ error: (e as Error).message }, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const sha = request.nextUrl.searchParams.get("sha");
  if (!sha) return NextResponse.json({ error: "sha gerekli" }, { status: 400 });

  try {
    await deletePost(slug, sha);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode || 500;
    return NextResponse.json({ error: (e as Error).message }, { status: statusCode });
  }
}
