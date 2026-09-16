import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/ig/repo";

// Ported from netlify/functions/link-click.js. Redirects to the configured
// post's link while recording a click for analytics. The destination always
// comes from server-side config lookup (never from the query string) to
// avoid this becoming an open redirect.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const commentId = params.get("c");
  const configId = params.get("p");

  const configs = await repo.getConfigs();
  const cfg = configs.posts.find((p) => p.id === configId);
  const dest = cfg?.link || "https://instagram.com/";

  if (commentId) {
    const state = await repo.getState(commentId);
    if (state && !state.linkClickedAt) {
      await repo.setState(commentId, { ...state, linkClickedAt: new Date().toISOString() });
    }
  }

  return NextResponse.redirect(dest);
}
