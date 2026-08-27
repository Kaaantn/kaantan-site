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
  const detailUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${testCommentId}?fields=text,username,timestamp,parent_id,user,from,hidden&access_token=${token}`;
  const detailRes = await fetch(detailUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  const permUrl = `https://graph.instagram.com/${GRAPH_VERSION}/me/permissions?access_token=${token}`;
  const permRes = await fetch(permUrl).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debugInfo, commentDetail: detailRes, permissionsViaIg: permRes }, null, 2),
  };
};
