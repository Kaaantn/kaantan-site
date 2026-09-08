const { getBioConfig, saveBioConfig } = require("./lib/blobs");

function requireUser(context) {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

exports.handler = async function (event, context) {
  const headers = { "Content-Type": "application/json" };

  // Reads are public — this is what the live /bio page fetches to render.
  if (event.httpMethod === "GET") {
    const config = await getBioConfig();
    return { statusCode: 200, headers, body: JSON.stringify(config) };
  }

  // Writes require the panel login.
  if (event.httpMethod === "POST") {
    try {
      requireUser(context);
    } catch (e) {
      return { statusCode: e.statusCode || 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Bad Request" }) };
    }

    if (!body.config || typeof body.config !== "object") {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "config gerekli" }) };
    }

    await saveBioConfig(body.config);
    return { statusCode: 200, headers, body: JSON.stringify(body.config) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
};
