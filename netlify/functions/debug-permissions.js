const GRAPH_VERSION = "v21.0";

exports.handler = async function () {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "IG_PAGE_ACCESS_TOKEN not set" }) };
  }

  const debugInfo = {
    length: token.length,
    prefix: token.slice(0, 8),
    suffix: token.slice(-6),
    hasWhitespace: /\s/.test(token),
    hasQuotes: /["']/.test(token),
    dotCount: (token.match(/\./g) || []).length,
  };

  // Find a recent comment on a reel and check its author's id, without sending anything yet.
  const mediaUrl = `https://graph.instagram.com/${GRAPH_VERSION}/me/media?fields=id&limit=3&access_token=${token}`;
  const mediaRes = await fetch(mediaUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  const recentComments = [];
  for (const m of (mediaRes.data || [])) {
    const cUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${m.id}/comments?fields=id,text,timestamp,from&limit=10&access_token=${token}`;
    const cRes = await fetch(cUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));
    for (const c of (cRes.data || [])) recentComments.push(c);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debugInfo, recentComments }, null, 2),
  };
};
