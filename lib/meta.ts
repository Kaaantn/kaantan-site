// Thin wrapper around the Instagram Messaging API (Graph API).
// Ported verbatim from netlify/functions/lib/meta.js.
// NOTE: endpoint/field names follow Meta's docs as of the original port —
// verify against https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
// if anything here starts failing; Meta occasionally renames fields between API versions.

const GRAPH_VERSION = "v21.0";
// Instagram API with Instagram Login issues IGAA-prefixed tokens that are only
// valid against graph.instagram.com (graph.facebook.com rejects them with
// "Cannot parse access token" even though the token itself is fine).
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;

function pageToken(): string {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error("IG_PAGE_ACCESS_TOKEN env var is not set");
  return token.trim();
}

interface GraphResult<T = unknown> {
  ok: boolean;
  data: T;
}

async function graphPost<T = unknown>(path: string, body: unknown): Promise<GraphResult<T>> {
  const res = await fetch(`${GRAPH_BASE}${path}?access_token=${pageToken()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Graph API error", path, JSON.stringify(data));
  }
  return { ok: res.ok, data };
}

async function graphGet<T = unknown>(path: string): Promise<GraphResult<T>> {
  const res = await fetch(`${GRAPH_BASE}${path}${path.includes("?") ? "&" : "?"}access_token=${pageToken()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Graph API error", path, JSON.stringify(data));
  }
  return { ok: res.ok, data };
}

export interface Button {
  type: "postback" | "web_url";
  title: string;
  payload?: string;
  url?: string;
}

// First message in a thread, addressed to a comment. Opens the messaging window.
// NOTE: the "/{comment-id}/private_replies" edge is legacy/Facebook-Login-only and
// returns a generic "does not support this operation" (subcode 33) for Instagram
// Login tokens. Instagram Login flow requires POST /me/messages with
// recipient.comment_id instead.
export function sendPrivateReply(commentId: string, text: string, buttons?: Button[]) {
  const message = buttons
    ? { attachment: { type: "template", payload: { template_type: "button", text, buttons } } }
    : { text };
  return graphPost(`/me/messages`, { recipient: { comment_id: commentId }, message });
}

// Follow-up message inside an already-open thread, addressed by IGSID.
export function sendMessage(igsid: string, text: string, buttons?: Button[]) {
  const message = buttons
    ? { attachment: { type: "template", payload: { template_type: "button", text, buttons } } }
    : { text };
  return graphPost(`/me/messages`, { recipient: { id: igsid }, message });
}

// Public reply, visible under the comment itself (not a DM).
export function replyToComment(commentId: string, text: string) {
  return graphPost(`/${commentId}/replies`, { message: text });
}

// Instagram's Graph API returns Reels permalinks as /reel/{code}/ even when
// the same post is reachable (and commonly shared/pasted) as /p/{code}/ — so
// matching on the full URL misses every Reel. The shortcode is what actually
// identifies the post regardless of which prefix either side used.
export function extractShortcode(url: string | null | undefined): string | null {
  const m = (url || "").match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

interface MediaListResponse {
  data?: { id: string; permalink: string }[];
  paging?: { next?: string };
}

// Resolves a pasted Instagram post URL to the account's real numeric media
// id by scanning the account's own media and matching on permalink shortcode.
// Needed because per-post trigger-word matching requires the actual media id
// to avoid cross-post bleed (see findConfigForComment).
export async function findMediaIdByPermalink(postLinkOrId: string | null | undefined): Promise<string | null> {
  const raw = (postLinkOrId || "").trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return raw; // already a raw numeric media id

  const targetCode = extractShortcode(raw);
  if (!targetCode) return null;

  let url: string | undefined = `${GRAPH_BASE}/me/media?fields=id,permalink&limit=50&access_token=${pageToken()}`;
  for (let page = 0; page < 20 && url; page++) {
    const data: MediaListResponse = await fetch(url).then((r) => r.json()).catch(() => ({}));
    const match = (data.data || []).find((m) => extractShortcode(m.permalink) === targetCode);
    if (match) return match.id;
    url = data.paging?.next;
  }
  return null;
}

// Same idea as findMediaIdByPermalink but resolves many links in a single
// shared pagination pass instead of re-scanning from page 1 for each one.
export async function findMediaIdsByPermalinks(
  postLinksOrIds: string[]
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  const pending = new Map<string, string[]>(); // shortcode -> original input strings sharing it

  for (const raw of postLinksOrIds) {
    const trimmed = (raw || "").trim();
    if (!trimmed) {
      results[raw] = null;
    } else if (/^\d+$/.test(trimmed)) {
      results[raw] = trimmed;
    } else {
      const code = extractShortcode(trimmed);
      if (!code) {
        results[raw] = null;
      } else {
        if (!pending.has(code)) pending.set(code, []);
        pending.get(code)!.push(raw);
      }
    }
  }

  if (pending.size > 0) {
    let url: string | undefined = `${GRAPH_BASE}/me/media?fields=id,permalink&limit=50&access_token=${pageToken()}`;
    for (let page = 0; page < 20 && url && pending.size > 0; page++) {
      const data: MediaListResponse = await fetch(url).then((r) => r.json()).catch(() => ({}));
      for (const m of data.data || []) {
        const code = extractShortcode(m.permalink);
        if (code && pending.has(code)) {
          for (const raw of pending.get(code)!) results[raw] = m.id;
          pending.delete(code);
        }
      }
      url = data.paging?.next;
    }
    for (const raws of pending.values()) {
      for (const raw of raws) results[raw] = null;
    }
  }

  return results;
}

export async function isFollowingBusiness(igsid: string): Promise<boolean | null> {
  const { ok, data } = await graphGet<{ is_user_follow_business?: boolean }>(
    `/${igsid}?fields=is_user_follow_business`
  );
  return ok ? Boolean(data.is_user_follow_business) : null; // null = couldn't determine
}

export function postbackButton(title: string, payload: string): Button {
  return { type: "postback", title, payload };
}

export function webUrlButton(title: string, url: string): Button {
  return { type: "web_url", title, url };
}
