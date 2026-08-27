const GRAPH_VERSION = "v21.0";

exports.handler = async function () {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "IG_PAGE_ACCESS_TOKEN not set" }) };
  }

  const meUrl = `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,username&access_token=${token}`;
  const debugUrl = `https://graph.facebook.com/${GRAPH_VERSION}/debug_token?input_token=${token}&access_token=${token}`;

  const [meRes, debugRes] = await Promise.all([
    fetch(meUrl).then((r) => r.json()).catch((e) => ({ error: String(e) })),
    fetch(debugUrl).then((r) => r.json()).catch((e) => ({ error: String(e) })),
  ]);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ me: meRes, debug: debugRes }, null, 2),
  };
};
