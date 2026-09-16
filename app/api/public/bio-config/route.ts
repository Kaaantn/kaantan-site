import { NextRequest, NextResponse } from "next/server";
import { getBioConfig, saveBioConfig, type BioConfig } from "@/lib/bio";
import { requireUser } from "@/lib/auth/requireUser";

// GET is public — this is what the live /bio page depends on. Ported
// from netlify/functions/bio-config.js, same intentional asymmetry: this
// GET has no auth check, but POST below does.
export async function GET() {
  const config = await getBioConfig();
  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.config !== "object") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  await saveBioConfig(body.config as BioConfig);
  return NextResponse.json(body.config);
}
