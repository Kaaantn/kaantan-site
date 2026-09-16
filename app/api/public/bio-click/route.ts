import { NextRequest, NextResponse } from "next/server";
import { getBioConfig, saveBioConfig } from "@/lib/bio";

// Public redirect + click counter. Anti-open-redirect by design (same
// pattern as the old link-click.js): destination is always resolved from
// the stored config, never from a query-string URL parameter.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const fallback = "https://kaantan.com.tr/";

  if (!type || !id) {
    return NextResponse.redirect(fallback);
  }

  const config = await getBioConfig();
  let dest = fallback;

  if (type === "social") {
    const entry = config.socialLinks.find((s) => s.platform === id);
    if (entry) {
      dest = entry.url || fallback;
      entry.clicks = (entry.clicks || 0) + 1;
      await saveBioConfig(config);
    }
  } else if (type === "link") {
    const entry = config.links.find((l) => l.id === id);
    if (entry) {
      dest = entry.url || fallback;
      entry.clicks = (entry.clicks || 0) + 1;
      await saveBioConfig(config);
    }
  }

  return NextResponse.redirect(dest);
}
