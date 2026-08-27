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

  const meUrl = `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,username&access_token=${token}`;
  const meRes = await fetch(meUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debugInfo, me: meRes }, null, 2),
  };
};
