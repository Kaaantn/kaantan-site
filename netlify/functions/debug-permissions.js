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

  // mehmet761758 already has a real thread with qkaantan (human replied manually).
  const testIgsid = "938138928659282";
  const sendUrl = `https://graph.instagram.com/${GRAPH_VERSION}/me/messages?access_token=${token}`;
  const sendRes = await fetch(sendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: testIgsid }, message: { text: "Test - bot mesaj testi" } }),
  }).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ debugInfo, plainMessageTest: sendRes }, null, 2),
  };
};
