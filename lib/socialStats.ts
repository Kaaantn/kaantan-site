// Ported from netlify/functions/social-stats.js.
export async function getYoutubeSubscriberCount(): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=qkaantan&key=${key}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const count = data?.items?.[0]?.statistics?.subscriberCount;
    return count != null ? Number(count) : null;
  } catch {
    return null;
  }
}
