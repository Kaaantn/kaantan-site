import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listPosts, savePost } from "@/lib/blogAdmin";

export async function GET() {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await listPosts();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "GitHub'dan okunamadı" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

  try {
    const result = await savePost(body);
    return NextResponse.json(result);
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode || 500;
    return NextResponse.json({ error: (e as Error).message }, { status: statusCode });
  }
}
