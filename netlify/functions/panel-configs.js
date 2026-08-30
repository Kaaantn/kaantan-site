const { getConfigs, saveConfigs } = require("./lib/blobs");

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

exports.handler = async function (event, context) {
  try {
    requireUser(context);
  } catch (e) {
    return { statusCode: e.statusCode || 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod === "GET") {
    const configs = await getConfigs();
    return { statusCode: 200, headers, body: JSON.stringify(configs) };
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Bad Request" }) };
    }

    const configs = await getConfigs();

    if (typeof body.fallbackWord === "string") {
      configs.fallbackWord = body.fallbackWord.trim();
      await saveConfigs(configs);
      return { statusCode: 200, headers, body: JSON.stringify(configs) };
    }

    if (typeof body.publicReplyEnabled === "boolean") {
      configs.publicReplyEnabled = body.publicReplyEnabled;
      await saveConfigs(configs);
      return { statusCode: 200, headers, body: JSON.stringify(configs) };
    }

    if (!body.post) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "post gerekli" }) };
    }

    const post = body.post;
    configs.posts = configs.posts || [];

    if (post.id) {
      const idx = configs.posts.findIndex((p) => p.id === post.id);
      if (idx === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Bulunamadı" }) };
      }
      configs.posts[idx] = { ...configs.posts[idx], ...post };
    } else {
      configs.posts.push({
        id: newId(),
        mediaId: post.mediaId || "",
        postLink: post.postLink || "",
        triggerWords: post.triggerWords || [],
        link: post.link || "",
        messageOverride: post.messageOverride || "",
        active: post.active !== false,
      });
    }

    await saveConfigs(configs);
    return { statusCode: 200, headers, body: JSON.stringify(configs) };
  }

  if (event.httpMethod === "DELETE") {
    const id = (event.queryStringParameters || {}).id;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id gerekli" }) };

    const configs = await getConfigs();
    configs.posts = (configs.posts || []).filter((p) => p.id !== id);
    await saveConfigs(configs);
    return { statusCode: 200, headers, body: JSON.stringify(configs) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
};
