import { NextResponse } from "next/server";
import { getYoutubeSubscriberCount } from "@/lib/socialStats";

export async function GET() {
  const youtube = await getYoutubeSubscriberCount();
  return NextResponse.json(
    { youtube },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
