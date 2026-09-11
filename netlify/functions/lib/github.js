// Thin wrapper around the GitHub Contents API. Blog posts stay as real
// markdown files in the repo (not Blobs) so the existing Eleventy build,
// sitemap.xml and SEO-friendly static rendering keep working unchanged —
// saving from the panel just makes a normal commit, which Netlify then
// auto-deploys (~30-60s), same as if it had been pushed by hand.

const OWNER = "Kaaantn";
const REPO = "kaantan-site";
const BRANCH = "master";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function token() {
  const t = process.env.GH_CONTENT_TOKEN;
  if (!t) throw new Error("GH_CONTENT_TOKEN env var is not set");
  return t.trim();
}

async function ghFetch(path, options) {
  const opts = options || {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function listDir(dirPath) {
  return ghFetch(`/contents/${dirPath}?ref=${BRANCH}`);
}

function getFile(filePath) {
  return ghFetch(`/contents/${filePath}?ref=${BRANCH}`);
}

function putFile(filePath, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  return ghFetch(`/contents/${filePath}`, { method: "PUT", body: JSON.stringify(body) });
}

function deleteFile(filePath, message, sha) {
  return ghFetch(`/contents/${filePath}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
}

function decodeContent(base64) {
  return Buffer.from(base64, "base64").toString("utf8");
}

module.exports = { listDir, getFile, putFile, deleteFile, decodeContent };
