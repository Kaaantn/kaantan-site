// One-off debug endpoint: explicitly subscribes the qkaantan Instagram account
// to this app's webhook (POST /{ig-user-id}/subscribed_apps). Field-level toggles
// in the Meta dashboard only declare which fields the app supports; the account
// itself must separately opt in to receive events. Safe to call repeatedly.
const IG_USER_ID = "17841448302622825";
const GRAPH_VERSION = "v21.0";

exports.handler = async function () {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "IG_PAGE_ACCESS_TOKEN not set" }) };
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${IG_USER_ID}/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${token}`;
  const res = await fetch(url, { method: "POST" });
  const data = await res.json().catch(() => ({}));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: res.ok, status: res.status, data }),
  };
};
