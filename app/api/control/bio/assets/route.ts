import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "bio-assets";

// Replaces bio-asset.js's POST. GET/serving disappears entirely — Supabase
// Storage serves the uploaded file directly via its own public CDN URL.
export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contentType = body?.contentType as string | undefined;
  const dataBase64 = body?.dataBase64 as string | undefined;

  if (!contentType || !dataBase64 || !/^image\//.test(contentType)) {
    return NextResponse.json({ error: "Geçersiz görsel" }, { status: 400 });
  }

  const buffer = Buffer.from(dataBase64, "base64");
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Görsel 5MB'tan büyük olamaz" }, { status: 400 });
  }

  const ext = contentType.split("/")[1] || "bin";
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(id, buffer, {
    contentType,
    cacheControl: "31536000",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(id);
  return NextResponse.json({ id, url: data.publicUrl });
}
