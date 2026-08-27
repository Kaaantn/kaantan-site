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

  const testCommentId = "18062389934766206";
  const getUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${testCommentId}?fields=text,username,timestamp,media&access_token=${token}`;
  const getRes = await fetch(getUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  const mediaUrl = `https://graph.instagram.com/${GRAPH_VERSION}/me/media?fields=id,media_type,media_product_type,permalink,comments_count&limit=5&access_token=${token}`;
  const mediaRes = await fetch(mediaUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debugInfo, commentGetTest: getRes, recentMedia: mediaRes }, null, 2),
  };
};
