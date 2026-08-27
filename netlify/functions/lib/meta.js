// Thin wrapper around the Instagram Messaging API (Graph API).
// NOTE: endpoint/field names follow the current Meta documentation as of this
// writing. Verify against https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
// once the app is live — Meta occasionally renames fields between API versions.

const GRAPH_VERSION = "v21.0";
// Instagram API with Instagram Login issues IGAA-prefixed tokens that are only
// valid against graph.instagram.com (graph.facebook.com rejects them with
// "Cannot parse access token" even though the token itself is fine).
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;

function pageToken() {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error("IG_PAGE_ACCESS_TOKEN env var is not set");
  return token.trim();
}

async function graphPost(path, body) {
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

async function graphGet(path) {
  const res = await fetch(`${GRAPH_BASE}${path}${path.includes("?") ? "&" : "?"}access_token=${pageToken()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Graph API error", path, JSON.stringify(data));
  }
  return { ok: res.ok, data };
}

// First message in a thread, addressed to a comment. Opens the messaging window.
// NOTE: the "/{comment-id}/private_replies" edge is legacy/Facebook-Login-only and
// returns a generic "does not support this operation" (subcode 33) for Instagram
// Login tokens. Instagram Login flow requires POST /me/messages with
// recipient.comment_id instead: https://developers.facebook.com/docs/instagram-platform/private-replies/
function sendPrivateReply(commentId, text, buttons) {
  const message = buttons
    ? {
        attachment: {
          type: "template",
          payload: { template_type: "button", text, buttons },
        },
      }
    : { text };
  return graphPost(`/me/messages`, { recipient: { comment_id: commentId }, message });
}

// Follow-up message inside an already-open thread, addressed by IGSID.
function sendMessage(igsid, text, buttons) {
  const message = buttons
    ? {
        attachment: {
          type: "template",
          payload: { template_type: "button", text, buttons },
        },
      }
    : { text };
  return graphPost(`/me/messages`, { recipient: { id: igsid }, message });
}

async function isFollowingBusiness(igsid) {
  const { ok, data } = await graphGet(`/${igsid}?fields=is_user_follow_business`);
  return ok ? Boolean(data.is_user_follow_business) : null; // null = couldn't determine
}

function postbackButton(title, payload) {
  return { type: "postback", title, payload };
}

function webUrlButton(title, url) {
  return { type: "web_url", title, url };
}

module.exports = {
  sendPrivateReply,
  sendMessage,
  isFollowingBusiness,
  postbackButton,
  webUrlButton,
};
