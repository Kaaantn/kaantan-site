const github = require("./lib/github");
const { parsePost, buildPost, slugify } = require("./lib/frontmatter");

const POSTS_DIR = "blog/posts";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function requireUser(context) {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

async function listPosts() {
  const dir = await github.listDir(POSTS_DIR);
  if (!dir.ok) return { ok: false, error: dir.data };

  const files = (dir.data || []).filter((f) => f.type === "file" && f.name.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (f) => {
      const file = await github.getFile(`${POSTS_DIR}/${f.name}`);
      if (!file.ok) return null;
      const raw = github.decodeContent(file.data.content);
      const parsed = parsePost(raw);
      return {
        slug: f.name.replace(/\.md$/, ""),
        title: parsed.title,
        date: parsed.date,
        description: parsed.description,
        sha: file.data.sha,
      };
    })
  );

  const clean = posts.filter(Boolean);
  clean.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { ok: true, posts: clean };
}

async function getPost(slug) {
  const file = await github.getFile(`${POSTS_DIR}/${slug}.md`);
  if (!file.ok) return { ok: false, error: file.data };
  const raw = github.decodeContent(file.data.content);
  const parsed = parsePost(raw);
  return {
    ok: true,
    post: {
      slug,
      title: parsed.title,
      date: parsed.date,
      description: parsed.description,
      body: parsed.body,
      sha: file.data.sha,
    },
  };
}

exports.handler = async function (event, context) {
  try {
    requireUser(context);
  } catch (e) {
    return json(e.statusCode || 401, { error: "Unauthorized" });
  }

  const params = event.queryStringParameters || {};

  if (event.httpMethod === "GET") {
    if (params.slug) {
      const res = await getPost(params.slug);
      if (!res.ok) return json(404, { error: "Bulunamadı" });
      return json(200, res.post);
    }
    const res = await listPosts();
    if (!res.ok) return json(502, { error: "GitHub'dan okunamadı" });
    return json(200, { posts: res.posts });
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return json(400, { error: "Bad Request" });
    }

    const title = (body.title || "").trim();
    const date = (body.date || "").trim();
    const description = (body.description || "").trim();
    const content = (body.body || "").trim();
    let slug = (body.slug || "").trim();

    if (!title || !content) return json(400, { error: "Başlık ve içerik zorunlu" });
    if (!DATE_RE.test(date)) return json(400, { error: "Tarih YYYY-MM-DD formatında olmalı" });

    const isUpdate = Boolean(body.sha);

    if (!isUpdate) {
      slug = slugify(slug || title);
      if (!SLUG_RE.test(slug)) return json(400, { error: "Geçersiz slug" });
    } else if (!SLUG_RE.test(slug)) {
      return json(400, { error: "Geçersiz slug" });
    }

    const path = `${POSTS_DIR}/${slug}.md`;
    let blocks = [];
    let sha = body.sha;

    if (isUpdate) {
      const existing = await github.getFile(path);
      if (!existing.ok) return json(404, { error: "Bulunamadı" });
      const parsedExisting = parsePost(github.decodeContent(existing.data.content));
      blocks = parsedExisting.blocks;
      sha = existing.data.sha;
    }

    const fileContent = buildPost({ title, date, description, body: content, blocks });
    const message = isUpdate ? `Blog: "${title}" güncellendi` : `Blog: "${title}" eklendi`;
    const result = await github.putFile(path, fileContent, message, sha);

    if (!result.ok) {
      return json(409, { error: (result.data && result.data.message) || "Kaydedilemedi" });
    }

    return json(200, {
      slug,
      title,
      date,
      description,
      sha: result.data.content.sha,
    });
  }

  if (event.httpMethod === "DELETE") {
    const slug = params.slug;
    const sha = params.sha;
    if (!slug || !sha || !SLUG_RE.test(slug)) return json(400, { error: "slug ve sha gerekli" });

    const result = await github.deleteFile(`${POSTS_DIR}/${slug}.md`, `Blog: "${slug}" silindi`, sha);
    if (!result.ok) return json(409, { error: (result.data && result.data.message) || "Silinemedi" });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method Not Allowed" });
};
