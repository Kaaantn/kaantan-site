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
  const replyUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${testCommentId}/private_replies?access_token=${token}`;
  const replyRes = await fetch(replyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: { text: "Test" } }),
  }).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debugInfo, jsonBodyReplyTest: replyRes }, null, 2),
  };
};
