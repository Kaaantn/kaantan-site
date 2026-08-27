const GRAPH_VERSION = "v21.0";

exports.handler = async function () {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "IG_PAGE_ACCESS_TOKEN not set" }) };
  }

  const convUrl = `https://graph.instagram.com/${GRAPH_VERSION}/me/conversations?platform=instagram&limit=3&access_token=${token}`;
  const convRes = await fetch(convUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  const details = [];
  for (const conv of (convRes.data || []).slice(0, 3)) {
    const msgUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${conv.id}?fields=messages.limit(3){message,from,to,created_time}&access_token=${token}`;
    const msgRes = await fetch(msgUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));
    details.push({ conversationId: conv.id, updated_time: conv.updated_time, msgRes });
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationDetails: details }, null, 2),
  };
};
