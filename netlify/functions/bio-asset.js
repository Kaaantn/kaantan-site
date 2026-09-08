const { bioAssetStore } = require("./lib/blobs");

function requireUser(context) {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const MAX_BYTES = 5 * 1024 * 1024;

exports.handler = async function (event, context) {
  // Serving an uploaded image is public — it's rendered on the public bio page.
  if (event.httpMethod === "GET") {
    const id = (event.queryStringParameters || {}).id;
    if (!id) return { statusCode: 400, body: "id gerekli" };

    const store = bioAssetStore();
    const meta = await store.get(`${id}:meta`, { type: "json" });
    const data = await store.get(id, { type: "arrayBuffer" });
    if (!meta || !data) return { statusCode: 404, body: "Bulunamadı" };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": meta.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: Buffer.from(data).toString("base64"),
      isBase64Encoded: true,
    };
  }

  // Uploading requires the panel login.
  if (event.httpMethod === "POST") {
    try {
      requireUser(context);
    } catch (e) {
      return { statusCode: e.statusCode || 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: "Bad Request" }) };
    }

    if (!body.dataBase64 || !body.contentType) {
      return { statusCode: 400, body: JSON.stringify({ error: "dataBase64 ve contentType gerekli" }) };
    }
    if (!/^image\//.test(body.contentType)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Sadece resim dosyaları yüklenebilir" }) };
    }

    const buffer = Buffer.from(body.dataBase64, "base64");
    if (buffer.length > MAX_BYTES) {
      return { statusCode: 400, body: JSON.stringify({ error: "Dosya çok büyük (maks 5MB)" }) };
    }

    const id = newId();
    const store = bioAssetStore();
    await store.set(id, buffer);
    await store.setJSON(`${id}:meta`, { contentType: body.contentType });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, url: `/.netlify/functions/bio-asset?id=${id}` }),
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
