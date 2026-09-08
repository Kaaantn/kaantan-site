const GRAPH_VERSION = "v21.0";

exports.handler = async function () {
  const token = process.env.IG_PAGE_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: "IG_PAGE_ACCESS_TOKEN not set" }) };
  }

  const url = `https://graph.instagram.com/${GRAPH_VERSION}/me/media?fields=id,permalink,media_product_type&limit=15&access_token=${token}`;
  const data = await fetch(url).then((r) => r.json()).catch((e) => ({ error: String(e) }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data, null, 2),
  };
};
